from rest_framework_jwt.views import JSONWebTokenAPIView
from rest_framework import status
from rest_framework_jwt.serializers import JSONWebTokenSerializer
from rest_framework.response import Response
from doc_api.models.user_models import User
from django.contrib.auth import authenticate
from doc_api.utils.auth_helpers import get_jwt_token, jwt_response_payload_handler


class Authentication(JSONWebTokenAPIView):
    def post(self, request, *args, **kwargs):
        username = request.data.get('username')
        password = request.data.get('password')
        if not username:
            result = {'success': False, 'messages': '用户帐号名必须存在, 请发送用户名!'}
            return Response(result, status=status.HTTP_400_BAD_REQUEST)
        if not password:
            result = {'success': False, 'messages': '密码必须存在, 请发送密码!'}
            return Response(result, status=status.HTTP_400_BAD_REQUEST)
        user = User.objects.filter(username=username).first()
        if user:
            if not user.is_active or user.is_deleted:
                result = {'success': False, 'messages': '当前用户已禁用或删除, 请使用其他用户!'}
                return Response(result, status=status.HTTP_403_FORBIDDEN)
            login_user = authenticate(username=username.strip(), password=password)
            if login_user is None:
                result = {'success': False, 'messages': '用户名:{}密码错误, 请输入正确密码!'.format(username)}
                return Response(result, status=status.HTTP_403_FORBIDDEN)
        else:
            result = {'success': False, 'messages': '用户名:{}不存在或无效, 请输入正确用户!'.format(username)}
            return Response(result, status=status.HTTP_403_FORBIDDEN)
        # 认证成功
        token = get_jwt_token(login_user)
        response_data = jwt_response_payload_handler(token, login_user, request)
        response = Response(response_data, status=status.HTTP_200_OK)
        # todo: 操作日志记录
        return response
    serializer_class = JSONWebTokenSerializer
