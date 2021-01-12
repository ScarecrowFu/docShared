from rest_framework import viewsets, mixins, filters, status
from rest_framework import permissions
from rest_framework.response import Response
from rest_framework.decorators import action
from doc_api.models import User, TeamGroup
from doc_api.serializers.user_serializers import UserListSerializer, UserActionSerializer, UserDetailSerializer
from doc_api.serializers.team_serializers import TeamGroupDetailSerializer, TeamGroupActionSerializer, \
    TeamGroupListSerializer
from doc_api.filters.user_filters import UserParameterFilter
from doc_api.utils.auth_helpers import get_jwt_token
from rest_framework_jwt.views import refresh_jwt_token
from doc_api.settings.conf import CreateAction, UpdateAction, DeleteAction, ActiveAction, DisableAction
from doc_api.utils.action_log_helpers import action_log


class UserViewSet(viewsets.ModelViewSet):
    """用户管理"""
    filter_backends = (filters.OrderingFilter, filters.SearchFilter, UserParameterFilter)
    search_fields = ('username', 'nickname', 'email', 'gender', 'phone', 'title', 'created_time')
    ordering_fields = ('username', 'nickname', 'email', 'phone', 'gender', 'title', 'is_active', 'is_admin', 'created_time')
    filterset_fields = ('username', 'nickname', 'email', 'phone', 'gender', 'title', 'is_active', 'is_admin', 'created_time', 'register_code')
    queryset = User.objects.filter(is_deleted=False).order_by('-id').all()
    permission_classes = (permissions.IsAuthenticated, )

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        username = request.data.get('username', '')
        if User.objects.filter(username=username).first():
            result = {'success': False, 'messages': f'用户:{username} 已经存在, 不能重复创建'}
            return Response(result, status=status.HTTP_400_BAD_REQUEST)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        headers = self.get_success_headers(serializer.data)
        instance = User.objects.get(pk=int(serializer.data['id']))
        action_log(request=request, user=request.user, action_type=CreateAction, old_instance=None,
                   instance=instance, action_info=f'新增用户:{instance.__str__()}')
        result = {'success': True, 'messages': f'新增用户:{instance.__str__()}',
                  'results': serializer.data}
        return Response(result, status=status.HTTP_200_OK, headers=headers)

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        result = {'success': True, 'messages': f'获取用户信息:{instance.__str__()}',
                  'results': serializer.data}
        return Response(result, status=status.HTTP_200_OK)

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        old_instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        if getattr(instance, '_prefetched_objects_cache', None):
            instance._prefetched_objects_cache = {}
        action_log(request=request, user=request.user, action_type=UpdateAction, old_instance=old_instance,
                   instance=instance, action_info=f'修改用户:{instance.__str__()}')
        result = {'success': True, 'messages': f'修改用户:{instance.__str__()}',
                  'results': serializer.data}
        return Response(result, status=status.HTTP_200_OK)

    def partial_update(self, request, *args, **kwargs):
        kwargs['partial'] = True
        return self.update(request, *args, **kwargs)

    def list(self, request, *args, **kwargs):
        query_params = self.request.query_params
        not_page = query_params.get('not_page', False)
        queryset = self.filter_queryset(self.get_queryset())
        queryset = queryset.distinct()
        if not_page and not_page.lower() != 'false':
            serializer = self.get_serializer(queryset, many=True)
            result = {'success': True, 'messages': '获取用户不分页数据',
                      'results': serializer.data}
            return Response(result, status=status.HTTP_200_OK)
        else:
            page = self.paginate_queryset(queryset)
            if page is not None:
                serializer = self.get_serializer(page, many=True)
                return self.get_paginated_response(serializer.data)
            serializer = self.get_serializer(queryset, many=True)
            result = {'success': True, 'messages': '获取用户不分页数据',
                      'results': serializer.data}
            return Response(result, status=status.HTTP_200_OK)

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        if instance == request.user:
            result = {'success': False,
                      'messages': f'用户:{instance.__str__()}为当前账号，不能删除自己!若要删除，请使用其他管理员账号登录删除此用户'}
            return Response(result, status=status.HTTP_400_BAD_REQUEST)
        self.perform_destroy(instance)
        action_log(request=request, user=request.user, action_type=DeleteAction, old_instance=None,
                   instance=instance, action_info=f'删除用户:{instance.__str__()}')
        result = {'success': True, 'messages': f'删除用户:{instance.__str__()}'}
        return Response(result, status=status.HTTP_200_OK)

    @action(methods=['post'], detail=True)
    def activation(self, request, *args, **kwargs):
        """禁用/启用用户"""
        old_instance = self.get_object()
        instance = self.get_object()
        active = request.data.get('active', True)
        if active:
            instance.is_active = True
            instance.save()
            action_log(request=request, user=request.user, action_type=ActiveAction, old_instance=old_instance,
                       instance=instance, action_info=f'启用用户:{instance.__str__()}')
            result = {'success': True, 'messages': f'启用用户:{instance.__str__()}'}
            return Response(result, status=status.HTTP_200_OK)
        else:
            if instance == request.user:
                result = {'success': False,
                          'messages': f'用户:{instance.__str__()}为当前账号，不能禁用自己'}
                return Response(result, status=status.HTTP_400_BAD_REQUEST)
            instance.is_active = False
            instance.save()
            action_log(request=request, user=request.user, action_type=DisableAction, old_instance=old_instance,
                       instance=instance, action_info=f'禁用用户:{instance.__str__()}')
            result = {'success': True, 'messages': f'禁用用户:{instance.__str__()}'}
            return Response(result, status=status.HTTP_200_OK)

    @action(methods=['post'], detail=True)
    def reset_password(self, request, *args, **kwargs):
        """修改/重置用户密码"""
        old_instance = self.get_object()
        instance = self.get_object()
        new_password = request.data.get('password', None)
        if not new_password:
            return Response({'messages': '请输入新密码', 'success': False}, status=status.HTTP_400_BAD_REQUEST)
        instance.set_password(new_password)
        instance.save()
        action_log(request=request, user=request.user, action_type=UpdateAction, old_instance=old_instance,
                   instance=instance, action_info=f'重置用户密码:{instance.__str__()}')
        return Response({'messages': f'重置用户密码:{instance.__str__()}', 'success': True})

    @action(methods=['post'], detail=False)
    def password(self, request, *args, **kwargs):
        """修改个人密码"""
        instance = self.request.user
        old_instance = self.request.user
        old_password = request.data.get('old_password')
        new_password = request.data.get('new_password')
        if instance.check_password(old_password):
            instance.set_password(new_password)
            instance.save()
            action_log(request=request, user=request.user, action_type=UpdateAction, old_instance=old_instance,
                       instance=instance, action_info=f'修改个人密码:{instance.__str__()}')
            return Response({'messages': f'修改个人密码:{instance.__str__()}', 'success': True})
        else:
            return Response({'messages': '原密码不正确', 'success': False}, status=status.HTTP_400_BAD_REQUEST)

    @action(methods=['get'], detail=False)
    def info(self, request, *args, **kwargs):
        instance = request.user
        serializer = self.get_serializer(instance)
        result = {'success': True, 'messages': f'获取用户个人信息:{instance.__str__()}',
                  'results': serializer.data}
        return Response(result, status=status.HTTP_200_OK)

    @action(methods=['post'], detail=False)
    def logout(self, request, *args, **kwargs):
        result = {'success': True, 'messages': '当前接口不提供登出功能, 由前端移除token进行登出'}
        return Response(result, status=status.HTTP_200_OK)

    @action(methods=['POST', 'DELETE'], detail=False)
    def bulk_delete(self, request, *args, **kwargs):
        # 批量删除
        deleted_objects_ids = request.data.get('deleted_objects', [])
        queryset = self.get_queryset()
        deleted_objects_names = []
        for deleted_object_id in deleted_objects_ids:
            instance = User.objects.get(pk=int(deleted_object_id))
            if instance == request.user:
                result = {'success': False,
                          'messages': f'用户:{instance.__str__()}为当前账号，不能删除自己!若要删除，请使用其他管理员账号登录删除此用户'}
                return Response(result, status=status.HTTP_400_BAD_REQUEST)
            deleted_objects_names.append(instance.__str__())
        deleted_objects = queryset.filter(id__in=deleted_objects_ids).all()
        deleted_objects.delete()
        action_log(request=request, user=request.user, action_type=DeleteAction, old_instance=None,
                   instance=None, action_info=f'批量删除用户:{deleted_objects_names}')
        result = {'success': True, 'messages': f'批量删除用户:{deleted_objects_names}'}
        return Response(result, status=status.HTTP_200_OK)

    @action(methods=['get', 'post'], detail=False)
    def token(self, request, *args, **kwargs):
        if request.method == 'GET':
            token = get_jwt_token(request.user)
            result = {'success': True, 'messages': f'获取用户个人token', 'results': {'token': token}}
            return Response(result, status=status.HTTP_200_OK)
        if request.method == 'POST':
            action_log(request=request, user=request.user, action_type=UpdateAction, old_instance=None,
                       instance=None, action_info=f'更新用户个人token')
            token = get_jwt_token(request.user)
            result = {'success': True, 'messages': f'更新用户个人token', 'results': {'token': token}}
            return Response(result, status=status.HTTP_200_OK)

    def get_serializer_class(self):
        if self.action == 'list':
            return UserListSerializer
        elif self.action == 'retrieve' or self.action == 'info':
            return UserDetailSerializer
        return UserActionSerializer


class TeamGroupViewSet(viewsets.ModelViewSet):
    """团队管理"""
    filter_backends = (filters.OrderingFilter, filters.SearchFilter,)
    search_fields = ('name', )
    ordering_fields = ('name',)
    queryset = TeamGroup.objects.order_by('-id').all()
    permission_classes = (permissions.IsAuthenticated, )

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        name = request.data.get('name', '')
        if TeamGroup.objects.filter(name=name).first():
            result = {'success': False, 'messages': f'团队:{name} 已经存在, 不能重复创建'}
            return Response(result, status=status.HTTP_400_BAD_REQUEST)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        headers = self.get_success_headers(serializer.data)
        instance = TeamGroup.objects.get(pk=int(serializer.data['id']))
        action_log(request=request, user=request.user, action_type=CreateAction, old_instance=None,
                   instance=instance, action_info=f'新增团队:{instance.__str__()}')
        result = {'success': True, 'messages': f'新增团队:{instance.__str__()}',
                  'results': serializer.data}
        return Response(result, status=status.HTTP_200_OK, headers=headers)

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        result = {'success': True, 'messages': f'获取团队信息:{instance.__str__()}',
                  'results': serializer.data}
        return Response(result, status=status.HTTP_200_OK)

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        old_instance = self.get_object()
        name = request.data.get('name', '')
        if name != instance.name and TeamGroup.objects.filter(name=name).first():
            result = {'success': False, 'messages': f'团队:{name} 已经存在, 不能修改成此名称'}
            return Response(result, status=status.HTTP_400_BAD_REQUEST)
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        if getattr(instance, '_prefetched_objects_cache', None):
            instance._prefetched_objects_cache = {}
        action_log(request=request, user=request.user, action_type=UpdateAction, old_instance=old_instance,
                   instance=instance, action_info=f'修改团队:{instance.__str__()}')
        result = {'success': True, 'messages': f'修改团队:{instance.__str__()}',
                  'results': serializer.data}
        return Response(result, status=status.HTTP_200_OK)

    def partial_update(self, request, *args, **kwargs):
        kwargs['partial'] = True
        return self.update(request, *args, **kwargs)

    def list(self, request, *args, **kwargs):
        query_params = self.request.query_params
        not_page = query_params.get('not_page', False)
        queryset = self.filter_queryset(self.get_queryset())
        queryset = queryset.distinct()
        if not_page and not_page.lower() != 'false':
            serializer = self.get_serializer(queryset, many=True)
            result = {'success': True, 'messages': '获取团队不分页数据',
                      'results': serializer.data}
            return Response(result, status=status.HTTP_200_OK)
        else:
            page = self.paginate_queryset(queryset)
            if page is not None:
                serializer = self.get_serializer(page, many=True)
                return self.get_paginated_response(serializer.data)
            serializer = self.get_serializer(queryset, many=True)
            result = {'success': True, 'messages': '获取团队不分页数据',
                      'results': serializer.data}
            return Response(result, status=status.HTTP_200_OK)

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        self.perform_destroy(instance)
        action_log(request=request, user=request.user, action_type=DeleteAction, old_instance=None,
                   instance=instance, action_info=f'删除团队:{instance.__str__()}')
        result = {'success': True, 'messages': f'删除团队:{instance.__str__()}'}
        return Response(result, status=status.HTTP_200_OK)

    @action(methods=['POST', 'DELETE'], detail=False)
    def bulk_delete(self, request, *args, **kwargs):
        # 批量删除
        deleted_objects_ids = request.data.get('deleted_objects', [])
        queryset = self.get_queryset()
        deleted_objects_names = []
        for deleted_object_id in deleted_objects_ids:
            instance = TeamGroup.objects.get(pk=int(deleted_object_id))
            deleted_objects_names.append(instance.__str__())
        deleted_objects = queryset.filter(id__in=deleted_objects_ids).all()
        deleted_objects.delete()
        action_log(request=request, user=request.user, action_type=DeleteAction, old_instance=None,
                   instance=None, action_info=f'批量删除团队:{deleted_objects_names}')
        result = {'success': True, 'messages': f'批量删除团队:{deleted_objects_names}'}
        return Response(result, status=status.HTTP_200_OK)

    def get_serializer_class(self):
        if self.action == 'list':
            return TeamGroupListSerializer
        elif self.action == 'retrieve':
            return TeamGroupDetailSerializer
        return TeamGroupActionSerializer