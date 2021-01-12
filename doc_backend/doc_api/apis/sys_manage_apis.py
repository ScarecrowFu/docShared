from rest_framework import viewsets, mixins, filters, status
from rest_framework import permissions
from rest_framework.response import Response
from rest_framework.decorators import action
from doc_api.models import Announcement, RegisterCode, SystemSetting, EmailVerificationCode
from doc_api.filters.sys_manage_filters import AnnouncementParameterFilter, RegisterCodeParameterFilter, \
    EmailVerificationCodeParameterFilter
from doc_api.serializers.sys_manage_serializers import AnnouncementActionSerializer, AnnouncementDetailSerializer, \
    AnnouncementListSerializer
from doc_api.serializers.sys_manage_serializers import RegisterCodeActionSerializer, RegisterCodeDetailSerializer, \
    RegisterCodeListSerializer
from doc_api.serializers.sys_manage_serializers import SystemSettingActionSerializer, SystemSettingDetailSerializer, \
    SystemSettingListSerializer
from doc_api.serializers.sys_manage_serializers import EmailVerificationCodeActionSerializer, \
    EmailVerificationCodeDetailSerializer, EmailVerificationCodeListSerializer
from doc_api.settings.conf import WebsiteSet, BaseSet, EmailSet
from doc_api.settings.conf import VerificationType, RegisterCodeStatus
from doc_api.settings.conf import CreateAction, UpdateAction, DeleteAction
from doc_api.utils.action_log_helpers import action_log
from doc_api.utils.email_helpers import send_email


class AnnouncementViewSet(viewsets.ModelViewSet):
    """公告管理"""
    filter_backends = (filters.OrderingFilter, filters.SearchFilter, AnnouncementParameterFilter)
    search_fields = ('title',)
    ordering_fields = ('title', 'creator', 'created_time', 'is_publish')
    filterset_fields = ('creator', 'created_time', 'is_publish')
    queryset = Announcement.objects.order_by('-id').all()
    permission_classes = (permissions.IsAuthenticated, )

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        headers = self.get_success_headers(serializer.data)
        instance = Announcement.objects.get(pk=int(serializer.data['id']))
        action_log(request=request, user=request.user, action_type=CreateAction, old_instance=None,
                   instance=instance, action_info=f'新增公告:{instance.__str__()}')
        result = {'success': True, 'messages': f'新增公告:{instance.__str__()}',
                  'results': serializer.data}
        return Response(result, status=status.HTTP_200_OK, headers=headers)

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        result = {'success': True, 'messages': f'获取公告信息:{instance.__str__()}',
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
                   instance=instance, action_info=f'修改公告:{instance.__str__()}')
        result = {'success': True, 'messages': f'修改公告:{instance.__str__()}',
                  'results': serializer.data}
        return Response(result, status=status.HTTP_200_OK)

    def partial_update(self, request, *args, **kwargs):
        kwargs['partial'] = True
        return self.update(request, *args, **kwargs)

    def list(self, request, *args, **kwargs):
        query_params = self.request.query_params
        not_page = query_params.get('not_page', False)
        queryset = self.filter_queryset(self.get_queryset())
        if not_page and not_page.lower() != 'false':
            serializer = self.get_serializer(queryset, many=True)
            result = {'success': True, 'messages': '获取公告不分页数据',
                      'results': serializer.data}
            return Response(result, status=status.HTTP_200_OK)
        else:
            page = self.paginate_queryset(queryset)
            if page is not None:
                serializer = self.get_serializer(page, many=True)
                return self.get_paginated_response(serializer.data)
            serializer = self.get_serializer(queryset, many=True)
            result = {'success': True, 'messages': '获取公告不分页数据',
                      'results': serializer.data}
            return Response(result, status=status.HTTP_200_OK)

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        self.perform_destroy(instance)
        action_log(request=request, user=request.user, action_type=DeleteAction, old_instance=None,
                   instance=instance, action_info=f'删除公告:{instance.__str__()}')
        result = {'success': True, 'messages': f'删除公告:{instance.__str__()}'}
        return Response(result, status=status.HTTP_200_OK)

    @action(methods=['POST', 'DELETE'], detail=False)
    def bulk_delete(self, request, *args, **kwargs):
        # 批量删除
        deleted_objects_ids = request.data.get('deleted_objects', [])
        queryset = self.get_queryset()
        deleted_objects_names = []
        for deleted_object_id in deleted_objects_ids:
            instance = Announcement.objects.get(pk=int(deleted_object_id))
            deleted_objects_names.append(instance.__str__())
        deleted_objects = queryset.filter(id__in=deleted_objects_ids).all()
        deleted_objects.delete()
        action_log(request=request, user=request.user, action_type=DeleteAction, old_instance=None,
                   instance=None, action_info=f'批量删除公告:{deleted_objects_names}')
        result = {'success': True, 'messages': f'批量删除公告:{deleted_objects_names}'}
        return Response(result, status=status.HTTP_200_OK)

    def get_serializer_class(self):
        if self.action == 'list':
            return AnnouncementListSerializer
        elif self.action == 'retrieve':
            return AnnouncementDetailSerializer
        return AnnouncementActionSerializer


#################################################################################


class RegisterCodeViewSet(viewsets.ModelViewSet):
    """注册码管理"""
    filter_backends = (filters.OrderingFilter, filters.SearchFilter, RegisterCodeParameterFilter)
    search_fields = ('code',)
    ordering_fields = ('code', 'all_cnt', 'used_cnt', 'status')
    filterset_fields = ('creator', 'created_time', 'status')
    queryset = RegisterCode.objects.order_by('-id').all()
    permission_classes = (permissions.IsAuthenticated, )

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        headers = self.get_success_headers(serializer.data)
        instance = RegisterCode.objects.get(pk=int(serializer.data['id']))
        action_log(request=request, user=request.user, action_type=CreateAction, old_instance=None,
                   instance=instance, action_info=f'新增注册码:{instance.__str__()}')
        result = {'success': True, 'messages': f'新增注册码:{instance.__str__()}',
                  'results': serializer.data}
        return Response(result, status=status.HTTP_200_OK, headers=headers)

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        result = {'success': True, 'messages': f'获取注册码信息:{instance.__str__()}',
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
                   instance=instance, action_info=f'修改注册码:{instance.__str__()}')
        result = {'success': True, 'messages': f'修改注册码:{instance.__str__()}',
                  'results': serializer.data}
        return Response(result, status=status.HTTP_200_OK)

    def partial_update(self, request, *args, **kwargs):
        kwargs['partial'] = True
        return self.update(request, *args, **kwargs)

    def list(self, request, *args, **kwargs):
        query_params = self.request.query_params
        not_page = query_params.get('not_page', False)
        queryset = self.filter_queryset(self.get_queryset())
        if not_page and not_page.lower() != 'false':
            serializer = self.get_serializer(queryset, many=True)
            result = {'success': True, 'messages': '获取注册码不分页数据',
                      'results': serializer.data}
            return Response(result, status=status.HTTP_200_OK)
        else:
            page = self.paginate_queryset(queryset)
            if page is not None:
                serializer = self.get_serializer(page, many=True)
                return self.get_paginated_response(serializer.data)
            serializer = self.get_serializer(queryset, many=True)
            result = {'success': True, 'messages': '获取注册码不分页数据',
                      'results': serializer.data}
            return Response(result, status=status.HTTP_200_OK)

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        self.perform_destroy(instance)
        action_log(request=request, user=request.user, action_type=DeleteAction, old_instance=None,
                   instance=instance, action_info=f'删除注册码:{instance.__str__()}')
        result = {'success': True, 'messages': f'删除注册码:{instance.__str__()}'}
        return Response(result, status=status.HTTP_200_OK)

    @action(methods=['POST', 'DELETE'], detail=False)
    def bulk_delete(self, request, *args, **kwargs):
        # 批量删除
        deleted_objects_ids = request.data.get('deleted_objects', [])
        queryset = self.get_queryset()
        deleted_objects_names = []
        for deleted_object_id in deleted_objects_ids:
            instance = RegisterCode.objects.get(pk=int(deleted_object_id))
            deleted_objects_names.append(instance.__str__())
        deleted_objects = queryset.filter(id__in=deleted_objects_ids).all()
        deleted_objects.delete()
        action_log(request=request, user=request.user, action_type=DeleteAction, old_instance=None,
                   instance=None, action_info=f'批量删除注册码:{deleted_objects_names}')
        result = {'success': True, 'messages': f'批量删除注册码:{deleted_objects_names}'}
        return Response(result, status=status.HTTP_200_OK)

    @action(methods=['GET'], detail=False)
    def code_status(self, request, *args, **kwargs):
        result = {'success': True, 'messages': f'获取状态类别:', 'results': RegisterCodeStatus}
        return Response(result, status=status.HTTP_200_OK)

    def get_serializer_class(self):
        if self.action == 'list':
            return RegisterCodeListSerializer
        elif self.action == 'retrieve':
            return RegisterCodeDetailSerializer
        return RegisterCodeActionSerializer


#################################################################################


class EmailVerificationCodeViewSet(viewsets.ModelViewSet):
    """邮箱验证码管理"""
    filter_backends = (filters.OrderingFilter, filters.SearchFilter, EmailVerificationCodeParameterFilter)
    search_fields = ('email_name', 'verification_code')
    ordering_fields = ('email_name', 'verification_code', 'verification_type', 'expired_time', 'creator', 'created_time', 'status')
    filterset_fields = ('email_name', 'verification_code', 'verification_type', 'expired_time', 'creator', 'created_time', 'status')
    queryset = EmailVerificationCode.objects.order_by('-id').all()
    permission_classes = (permissions.IsAuthenticated, )

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        headers = self.get_success_headers(serializer.data)
        instance = EmailVerificationCode.objects.get(pk=int(serializer.data['id']))
        action_log(request=request, user=request.user, action_type=CreateAction, old_instance=None,
                   instance=instance, action_info=f'新增邮箱验证码:{instance.__str__()}')
        result = {'success': True, 'messages': f'新增邮箱验证码:{instance.__str__()}',
                  'results': serializer.data}
        return Response(result, status=status.HTTP_200_OK, headers=headers)

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        result = {'success': True, 'messages': f'获取邮箱验证码信息:{instance.__str__()}',
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
                   instance=instance, action_info=f'修改邮箱验证码:{instance.__str__()}')
        result = {'success': True, 'messages': f'修改邮箱验证码:{instance.__str__()}',
                  'results': serializer.data}
        return Response(result, status=status.HTTP_200_OK)

    def partial_update(self, request, *args, **kwargs):
        kwargs['partial'] = True
        return self.update(request, *args, **kwargs)

    def list(self, request, *args, **kwargs):
        query_params = self.request.query_params
        not_page = query_params.get('not_page', False)
        queryset = self.filter_queryset(self.get_queryset())
        if not_page and not_page.lower() != 'false':
            serializer = self.get_serializer(queryset, many=True)
            result = {'success': True, 'messages': '获取邮箱验证码不分页数据',
                      'results': serializer.data}
            return Response(result, status=status.HTTP_200_OK)
        else:
            page = self.paginate_queryset(queryset)
            if page is not None:
                serializer = self.get_serializer(page, many=True)
                return self.get_paginated_response(serializer.data)
            serializer = self.get_serializer(queryset, many=True)
            result = {'success': True, 'messages': '获取邮箱验证码不分页数据',
                      'results': serializer.data}
            return Response(result, status=status.HTTP_200_OK)

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        self.perform_destroy(instance)
        action_log(request=request, user=request.user, action_type=DeleteAction, old_instance=None,
                   instance=instance, action_info=f'删除邮箱验证码:{instance.__str__()}')
        result = {'success': True, 'messages': f'删除邮箱验证码:{instance.__str__()}'}
        return Response(result, status=status.HTTP_200_OK)

    @action(methods=['POST', 'DELETE'], detail=False)
    def bulk_delete(self, request, *args, **kwargs):
        # 批量删除
        deleted_objects_ids = request.data.get('deleted_objects', [])
        queryset = self.get_queryset()
        deleted_objects_names = []
        for deleted_object_id in deleted_objects_ids:
            instance = EmailVerificationCode.objects.get(pk=int(deleted_object_id))
            deleted_objects_names.append(instance.__str__())
        deleted_objects = queryset.filter(id__in=deleted_objects_ids).all()
        deleted_objects.delete()
        action_log(request=request, user=request.user, action_type=DeleteAction, old_instance=None,
                   instance=None, action_info=f'批量删除邮箱验证码:{deleted_objects_names}')
        result = {'success': True, 'messages': f'批量删除邮箱验证码:{deleted_objects_names}'}
        return Response(result, status=status.HTTP_200_OK)

    @action(methods=['GET'], detail=False)
    def verification_types(self, request, *args, **kwargs):
        # VerificationType
        result = {'success': True, 'messages': f'获取验证码类型', 'results': VerificationType}
        return Response(result, status=status.HTTP_200_OK)

    @action(methods=['GET'], detail=False)
    def code_status(self, request, *args, **kwargs):
        result = {'success': True, 'messages': f'获取状态类别:', 'results': RegisterCodeStatus}
        return Response(result, status=status.HTTP_200_OK)

    def get_serializer_class(self):
        if self.action == 'list':
            return EmailVerificationCodeListSerializer
        elif self.action == 'retrieve':
            return EmailVerificationCodeDetailSerializer
        return EmailVerificationCodeActionSerializer

##################################################################################


class SystemSettingViewSet(viewsets.GenericViewSet, mixins.ListModelMixin, mixins.RetrieveModelMixin):
    """
    系统设置
    """
    filter_backends = (filters.OrderingFilter, filters.SearchFilter,)
    search_fields = ('key', 'name', 'value', 'set_type',)
    ordering_fields = ('key', 'name', 'value', 'set_type', 'creator', 'created_time' )
    queryset = SystemSetting.objects.order_by('-id').all()
    permission_classes = (permissions.IsAuthenticated,)

    def list(self, request, *args, **kwargs):
        query_params = self.request.query_params
        not_page = query_params.get('not_page', False)
        queryset = self.filter_queryset(self.get_queryset())
        queryset = queryset.distinct()
        if not_page and not_page.lower() != 'false':
            serializer = self.get_serializer(queryset, many=True)
            result = {'success': True, 'messages': '获取系统设置',
                      'results': serializer.data}
            return Response(result, status=status.HTTP_200_OK)
        else:
            page = self.paginate_queryset(queryset)
            if page is not None:
                serializer = self.get_serializer(page, many=True)
                return self.get_paginated_response(serializer.data)

            serializer = self.get_serializer(queryset, many=True)
            result = {'success': True, 'messages': '获取系统设置',
                      'results': serializer.data}
            return Response(result, status=status.HTTP_200_OK)

    @action(methods=['POST'], detail=False)
    def test_email(self, request, *args, **kwargs):
        try:
            send_email(subject='DocShared 测试邮件', html_content='该邮件来自于DocShared, 用于测试邮箱配置是否正确, 请勿回复',
                       to_list=['fu_hurt@163.com'])
            result = {'success': True, 'messages': '邮箱设置可正常发送邮件'}
            return Response(result, status=status.HTTP_200_OK)
        except Exception as error:
            result = {'success': False, 'messages': f'无法发送邮件, 请检查邮箱设置是否正确: {error}'}
            return Response(result, status=status.HTTP_400_BAD_REQUEST)

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        result = {'success': True, 'messages': '获取系统设置信息:{}'.format(instance.__str__()),
                  'results': serializer.data}
        return Response(result, status=status.HTTP_200_OK)

    @action(methods=['GET', 'POST'], detail=False)
    def specify_set(self, request, *args, **kwargs):
        """获取个人操作日志"""
        if request.method == 'GET':
            query_params = self.request.query_params
            set_classify = query_params.get('set_classify', 'WebsiteSet')
            saving_settings = []
            if set_classify == 'WebsiteSet':
                saving_settings = WebsiteSet
            if set_classify == 'BaseSet':
                saving_settings = BaseSet
            if set_classify == 'EmailSet':
                saving_settings = EmailSet
            return_settings = []
            for saving_setting in saving_settings:
                system_setting = SystemSetting.objects.filter(key=saving_setting['key']).first()
                if system_setting:
                    saving_setting['value'] = system_setting.value
                else:
                    system_setting = SystemSetting.objects.create(key=saving_setting['key'],
                                                                  name=saving_setting['name'],
                                                                  value=saving_setting['value'],
                                                                  set_type=saving_setting['set_type'],
                                                                  description=saving_setting['description'],
                                                                  )
                return_settings.append(system_setting)
            serializer = self.get_serializer(return_settings, many=True)
            result = {'success': True, 'messages': '获取系统设置信息',
                      'results': serializer.data}
            return Response(result, status=status.HTTP_200_OK)
        else:
            saving_settings = request.data.get('settings', {})
            for key, value in saving_settings.items():
                system_setting = SystemSetting.objects.filter(key=key).first()
                if system_setting:
                    SystemSetting.objects.filter(key=key).update(value=value)
            result = {'success': True, 'messages': '保存系统设置'}
            return Response(result, status=status.HTTP_200_OK)

    def get_serializer_class(self):
        if self.action == 'retrieve':
            return SystemSettingDetailSerializer
        if self.action == 'list' or self.action == 'specify_set':
            return SystemSettingListSerializer
        return SystemSettingActionSerializer

