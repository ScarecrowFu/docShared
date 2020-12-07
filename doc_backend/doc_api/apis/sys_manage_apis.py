from rest_framework import viewsets, mixins, filters, status
from rest_framework import permissions
from rest_framework.response import Response
from rest_framework.decorators import action
from doc_api.models import Announcement, RegisterCode, SystemSetting
from doc_api.filters.sys_manage_filters import AnnouncementParameterFilter, RegisterCodeParameterFilter
from doc_api.serializers.sys_manage_serializers import AnnouncementActionSerializer, AnnouncementDetailSerializer, \
    AnnouncementListSerializer
from doc_api.serializers.sys_manage_serializers import RegisterCodeActionSerializer, RegisterCodeDetailSerializer, \
    RegisterCodeListSerializer
from doc_api.serializers.sys_manage_serializers import SystemSettingActionSerializer, SystemSettingDetailSerializer, \
    SystemSettingListSerializer
from doc_api.settings.conf import WebsiteSet, BaseSet, EmailSet


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
        # todo 记录操作日志
        result = {'success': True, 'messages': f'新增公告:{instance.__str__()}',
                  'results': serializer.data}
        return Response(result, status=status.HTTP_200_OK, headers=headers)

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        result = {'success': True, 'messages': f'获取公告信息:{instance.__str__()}!',
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
        # todo 记录操作日志
        result = {'success': True, 'messages': f'修改公告:{instance.__str__()}!',
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
            result = {'success': True, 'messages': '获取公告不分页数据!',
                      'results': serializer.data}
            return Response(result, status=status.HTTP_200_OK)
        else:
            page = self.paginate_queryset(queryset)
            if page is not None:
                serializer = self.get_serializer(page, many=True)
                return self.get_paginated_response(serializer.data)
            serializer = self.get_serializer(queryset, many=True)
            result = {'success': True, 'messages': '获取公告不分页数据!',
                      'results': serializer.data}
            return Response(result, status=status.HTTP_200_OK)

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        self.perform_destroy(instance)
        # todo 记录操作日志
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
        # todo 记录操作日志
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
        # todo 记录操作日志
        result = {'success': True, 'messages': f'新增注册码:{instance.__str__()}',
                  'results': serializer.data}
        return Response(result, status=status.HTTP_200_OK, headers=headers)

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        result = {'success': True, 'messages': f'获取注册码信息:{instance.__str__()}!',
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
        # todo 记录操作日志
        result = {'success': True, 'messages': f'修改注册码:{instance.__str__()}!',
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
            result = {'success': True, 'messages': '获取注册码不分页数据!',
                      'results': serializer.data}
            return Response(result, status=status.HTTP_200_OK)
        else:
            page = self.paginate_queryset(queryset)
            if page is not None:
                serializer = self.get_serializer(page, many=True)
                return self.get_paginated_response(serializer.data)
            serializer = self.get_serializer(queryset, many=True)
            result = {'success': True, 'messages': '获取注册码不分页数据!',
                      'results': serializer.data}
            return Response(result, status=status.HTTP_200_OK)

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        self.perform_destroy(instance)
        # todo 记录操作日志
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
        # todo 记录操作日志
        result = {'success': True, 'messages': f'批量删除注册码:{deleted_objects_names}'}
        return Response(result, status=status.HTTP_200_OK)

    def get_serializer_class(self):
        if self.action == 'list':
            return RegisterCodeListSerializer
        elif self.action == 'retrieve':
            return RegisterCodeDetailSerializer
        return RegisterCodeActionSerializer


##################################################################################


class SystemSettingViewSet(viewsets.GenericViewSet, mixins.ListModelMixin, mixins.RetrieveModelMixin):
    """
    系统设置
    """
    filter_backends = (filters.OrderingFilter, filters.SearchFilter,)
    search_fields = ('key', 'name', 'value', 'set_type',)
    ordering_fields = ('key', 'name', 'value', 'set_type', 'creator', 'created_time' )
    queryset = SystemSetting.objects.filter(is_deleted=False).order_by('-id').all()
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

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        result = {'success': True, 'messages': '获取系统设置信息:{}!'.format(instance.__str__()),
                  'results': serializer.data}
        return Response(result, status=status.HTTP_200_OK)

    @action(methods=['GET', 'POST'], detail=False)
    def specify_set(self, request, *args, **kwargs):
        """获取个人操作日志"""
        if request.method == 'GET':
            query_params = self.request.query_params
            set_type = query_params.get('set_type', 'WebsiteSet')
            saving_settings = []
            if set_type == 'set_type':
                saving_settings = WebsiteSet
            if set_type == 'BaseSet':
                saving_settings = BaseSet
            if set_type == 'BaseSet':
                saving_settings = EmailSet
            result = {'success': True, 'messages': '获取系统设置信息:{}!',  'results': saving_settings}
            return Response(result, status=status.HTTP_200_OK)
        else:
            saving_settings = request.data.get('settings', [])
            for saving_setting in saving_settings:
                system_setting = SystemSetting.objects.filter(key=saving_setting['key']).first()
                if system_setting:
                    SystemSetting.objects.filter(key=saving_setting['key']).update(value=saving_setting['value'],
                                                                                   name=saving_setting['name'],
                                                                                   set_type=saving_setting['set_type'],
                                                                                   )
                else:
                    SystemSetting.objects.create(key=saving_setting['key'],
                                                 name=saving_setting['name'],
                                                 value=saving_setting['value'],
                                                 set_type=saving_setting['set_type'],
                                                 )
            result = {'success': True, 'messages': '保存系統设置'}
            return Response(result, status=status.HTTP_200_OK)

    def get_serializer_class(self):
        if self.action == 'retrieve':
            return SystemSettingDetailSerializer
        if self.action == 'list':
            return SystemSettingListSerializer
        return SystemSettingActionSerializer

