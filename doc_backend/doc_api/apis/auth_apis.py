from rest_framework_jwt.views import JSONWebTokenAPIView
from rest_framework import status, views
from rest_framework_jwt.serializers import JSONWebTokenSerializer
from rest_framework_jwt.utils import jwt_decode_handler
from rest_framework.response import Response
from doc_api.models import User, SystemSetting, RegisterCode, EmailVerificationCode
from django.contrib.auth import authenticate
from doc_api.utils.auth_helpers import get_jwt_token, jwt_response_payload_handler
from doc_api.settings.conf import AuthAction
from doc_api.utils.action_log_helpers import action_log
from doc_api.utils.email_helpers import send_email, get_email_setting
from datetime import datetime, timedelta



class Authentication(JSONWebTokenAPIView):
    serializer_class = JSONWebTokenSerializer

    def post(self, request, *args, **kwargs):
        username = request.data.get('username')
        password = request.data.get('password')
        if not username:
            result = {'success': False, 'messages': '用户帐号名必须存在, 请发送用户名'}
            return Response(result, status=status.HTTP_400_BAD_REQUEST)
        if not password:
            result = {'success': False, 'messages': '密码必须存在, 请发送密码'}
            return Response(result, status=status.HTTP_400_BAD_REQUEST)
        user = User.objects.filter(username=username).first()
        if user:
            if not user.is_active or user.is_deleted:
                result = {'success': False, 'messages': '当前用户已禁用或删除, 请使用其他用户'}
                return Response(result, status=status.HTTP_403_FORBIDDEN)
            login_user = authenticate(username=username.strip(), password=password)
            if login_user is None:
                result = {'success': False, 'messages': '用户名:{}密码错误, 请输入正确密码'.format(username)}
                return Response(result, status=status.HTTP_403_FORBIDDEN)
        else:
            result = {'success': False, 'messages': '用户名:{}不存在或无效, 请输入正确用户'.format(username)}
            return Response(result, status=status.HTTP_403_FORBIDDEN)
        # 认证成功
        token = get_jwt_token(login_user)
        response_data = jwt_response_payload_handler(token, login_user, request)
        response = Response(response_data, status=status.HTTP_200_OK)
        action_log(request=request, user=request.user, action_type=AuthAction, old_instance=None,
                   instance=None, action_info=f'登录系统')
        return response
    
    
class Register(views.APIView):
    permission_classes = ()
    authentication_classes = ()

    def post(self, request, *args, **kwargs):
        username = request.data.get('username')
        password = request.data.get('password')
        email = request.data.get('email')
        reg_code = request.data.get('reg_code')
        if not username or not password or not email:
            result = {'success': False, 'messages': '用户帐号名/密码/邮箱必须存在'}
            return Response(result, status=status.HTTP_400_BAD_REQUEST)
        system_setting = SystemSetting.objects.filter(key='use_reg_code').first()
        if system_setting:
            use_reg_code = True if system_setting.value.lower() == 'true' else False
        else:
            use_reg_code = False
        reg_code_obj = RegisterCode.objects.filter(code=reg_code).first()
        if use_reg_code:
            if not reg_code:
                result = {'success': False, 'messages': '当前注册需要注册码, 请输入注册码'}
                return Response(result, status=status.HTTP_400_BAD_REQUEST)
            if not reg_code_obj:
                result = {'success': False, 'messages': '当前注册码不存在, 请输入正确注册码'}
                return Response(result, status=status.HTTP_400_BAD_REQUEST)
            if reg_code_obj.status == 0:
                result = {'success': False, 'messages': '当前注册码已无效, 请输入正确注册码'}
                return Response(result, status=status.HTTP_400_BAD_REQUEST)
            if reg_code_obj.all_cnt - reg_code_obj.used_cnt <= 0:
                result = {'success': False, 'messages': '当前注册码已无有效注册数量, 请输入正确注册码'}
                return Response(result, status=status.HTTP_400_BAD_REQUEST)
        user = User.objects.filter(username=username).first()
        if user:
            result = {'success': False, 'messages': '当前用户已经存在, 请勿重复注册'}
            return Response(result, status=status.HTTP_400_BAD_REQUEST)
        else:
            user = User.objects.create_user(username=username, password=password, nickname=username, email=email,
                                            register_code=reg_code_obj)
            if reg_code_obj and use_reg_code:
                reg_code_obj.used_cnt += 1
                reg_code_obj.save()
            action_log(request=request, user=user, action_type=AuthAction, old_instance=None,
                       instance=None, action_info=f'注册账号:{username}')
            result = {'success': True, 'messages': f'成功注册用户:{username}'}
            return Response(result, status=status.HTTP_200_OK)
        
        
class ForgetPassword(views.APIView):
    permission_classes = ()
    authentication_classes = ()

    def post(self, request, *args, **kwargs):
        username = request.data.get('username')
        email = request.data.get('email')
        if not username or not email:
            result = {'success': False, 'messages': '用户帐号名/邮箱必须存在'}
            return Response(result, status=status.HTTP_400_BAD_REQUEST)
        user = User.objects.filter(username=username).first()
        if user:
            if user.email != email:
                result = {'success': False, 'messages': f'当前邮箱与用户注册邮箱:{user.email[:5]}****不一致, 请重新输入'}
                return Response(result, status=status.HTTP_400_BAD_REQUEST)
            email_setting = get_email_setting()
            if not email_setting:
                result = {'success': False, 'messages': f'管理员尚未配置邮箱, 无法重置密码, 请联系管理员'}
                return Response(result, status=status.HTTP_400_BAD_REQUEST)
            email_code = EmailVerificationCode.objects.create(email_name=email, verification_type=20,
                                                              expired_time=datetime.now() + timedelta(hours=12),
                                                              creator=user)
            send_email(subject='重置密码', 
                       html_content=f'该邮件来自于DocShared\n'
                                    f'用于重置:{username}的密码, 验证码为:{email_code.verification_code}\n'
                                    f'请点击以下链接进行重置: http://www.baidu.com',
                       to_list=[email])
            result = {'success': True, 'messages': f'验证码已发送, 请前往邮箱查看, 并进行下一步'}
            return Response(result, status=status.HTTP_200_OK)
        else:
            result = {'success': False, 'messages': f'当前用户:{username}不存在, 请重新输入或注册新用户'}
            return Response(result, status=status.HTTP_400_BAD_REQUEST)
   

