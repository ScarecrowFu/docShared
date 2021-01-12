from rest_framework_jwt.views import JSONWebTokenAPIView
from rest_framework import status, views
from rest_framework_jwt.serializers import JSONWebTokenSerializer
from doc_api.serializers.sys_manage_serializers import EmailVerificationCodeListSerializer
from rest_framework.response import Response
from doc_api.models import User, SystemSetting, RegisterCode, EmailVerificationCode
from django.contrib.auth import authenticate
from doc_api.utils.auth_helpers import get_jwt_token, jwt_response_payload_handler
from doc_api.settings.conf import AuthAction
from doc_api.utils.action_log_helpers import action_log
from doc_api.utils.email_helpers import send_email, get_email_setting
from datetime import datetime, timedelta
import pytz


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
            if not user.is_active:
                result = {'success': False, 'messages': '当前用户未激活, 若为新注册用户请查看邮箱进行激活, 或联系管理员'}
                return Response(result, status=status.HTTP_403_FORBIDDEN)
            if user.is_deleted:
                result = {'success': False, 'messages': '当前用户已删除, 请使用其他用户'}
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
        reg_code_setting = SystemSetting.objects.filter(key='use_reg_code').first()
        verify_register_setting = SystemSetting.objects.filter(key='verify_register').first()
        if reg_code_setting:
            use_reg_code = True if reg_code_setting.value.lower() == 'true' else False
        else:
            use_reg_code = False
        if verify_register_setting:
            verify_register = True if verify_register_setting.value.lower() == 'true' else False
        else:
            verify_register = False
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
            is_active = False if verify_register else True
            user = User.objects.create_user(username=username, password=password, nickname=username, email=email,
                                            register_code=reg_code_obj, is_active=is_active)
            if reg_code_obj and use_reg_code:
                reg_code_obj.used_cnt += 1
                reg_code_obj.save()
            action_log(request=request, user=user, action_type=AuthAction, old_instance=None,
                       instance=None, action_info=f'注册账号:{username}')
            if verify_register:
                email_code = EmailVerificationCode.objects.create(email_name=email, verification_type=10,
                                                                  expired_time=datetime.now() + timedelta(hours=12),
                                                                  creator=user)
                messages = f'验证邮件已经发送至注册邮箱, 请到邮箱查看验证码信息进行下一步'
                send_email(subject='DocShared 注册用户',
                           html_content=f'该邮件来自于DocShared<br>'
                                        f'用于注册用户:{username}, 验证码为:{email_code.verification_code}<br>'
                                        f'请点击以下链接进行下一步: <a href="http://90fyl.com/validation/{email_code.verification_code}"> http://90fyl.com/validation/{email_code.verification_code} </a>',
                           to_list=[email])
            else:
                messages = f'成功注册用户:{username}'
            result = {'success': True, 'messages': messages}
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
            send_email(subject='DocShared 忘记密码',
                       html_content=f'该邮件来自于DocShared<br>'
                                    f'用于重置:{username}的密码, 验证码为:{email_code.verification_code}<br>'
                                    f'请点击以下链接进行重置: <a href="http://90fyl.com/validation/{email_code.verification_code}"> http://90fyl.com/validation/{email_code.verification_code} </a>',
                       to_list=[email])
            action_log(request=request, user=user, action_type=AuthAction, old_instance=None,
                       instance=None, action_info=f'忘记密码:{username}')
            result = {'success': True, 'messages': f'验证码已发送, 请前往邮箱查看, 并进行下一步'}
            return Response(result, status=status.HTTP_200_OK)
        else:
            result = {'success': False, 'messages': f'当前用户:{username}不存在, 请重新输入或注册新用户'}
            return Response(result, status=status.HTTP_400_BAD_REQUEST)
        
        
class ReSetPassword(views.APIView):
    permission_classes = ()
    authentication_classes = ()

    def post(self, request, *args, **kwargs):
        code = request.data.get('code')
        new_password = request.data.get('password', None)
        email_code = EmailVerificationCode.objects.filter(verification_code=code).first()
        if not email_code:
            result = {'success': False, 'messages': '当前验证码不正确, 无法确认信息'}
            return Response(result, status=status.HTTP_400_BAD_REQUEST)
        if email_code.status == 0:
            result = {'success': False, 'messages': '当前验证码已使用或无效'}
            return Response(result, status=status.HTTP_400_BAD_REQUEST)
        if email_code.expired_time < pytz.UTC.localize(datetime.now()):
            result = {'success': False, 'messages': '当前验证码已经过期, 无法使用'}
            return Response(result, status=status.HTTP_400_BAD_REQUEST)
        if email_code.verification_type != 20:
            result = {'success': False, 'messages': '当前验证码不是用于重置密码, 请勿操作'}
            return Response(result, status=status.HTTP_400_BAD_REQUEST)
        if not new_password:
            return Response({'messages': '请输入新密码', 'success': False}, status=status.HTTP_400_BAD_REQUEST)
        user = email_code.creator
        user.set_password(new_password)
        user.save()
        email_code.status = 0
        email_code.save()
        action_log(request=request, user=request.user, action_type=AuthAction, old_instance=user,
                   instance=user, action_info=f'重置密码:{user.__str__()}')
        result = {'success': True, 'messages': f'用户:{user.username}已经重置密码, 可正常登录使用',
                  'results': EmailVerificationCodeListSerializer(email_code).data}
        return Response(result, status=status.HTTP_200_OK)
        
        
class Validation(views.APIView):
    permission_classes = ()
    authentication_classes = ()

    def get(self, request, *args, **kwargs):
        query_params = self.request.query_params
        code = query_params.get('code', '')
        email_code = EmailVerificationCode.objects.filter(verification_code=code).first()
        if not email_code:
            result = {'success': False, 'messages': '当前验证码不正确, 无法确认信息'}
            return Response(result, status=status.HTTP_400_BAD_REQUEST)
        if email_code.status == 0:
            result = {'success': False, 'messages': '当前验证码已使用或无效'}
            return Response(result, status=status.HTTP_400_BAD_REQUEST)
        if email_code.expired_time < pytz.UTC.localize(datetime.now()):
            result = {'success': False, 'messages': '当前验证码已经过期, 无法使用'}
            return Response(result, status=status.HTTP_400_BAD_REQUEST)
        if email_code.verification_type == 10:
            user = email_code.creator
            user.is_active = True
            user.save()
            email_code.status = 0
            email_code.save()
            result = {'success': True, 'messages': f'用户:{user.username}已经激活, 可正常登录使用',
                      'results': EmailVerificationCodeListSerializer(email_code).data}
            return Response(result, status=status.HTTP_200_OK)
        else:
            result = {'success': True, 'messages': f'当前验证码有效, 请进行下一步操作',
                      'results': EmailVerificationCodeListSerializer(email_code).data}
            return Response(result, status=status.HTTP_200_OK)
        
        
       

