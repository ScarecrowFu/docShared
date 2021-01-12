from rest_framework import viewsets, mixins, filters, status
from rest_framework import permissions
from rest_framework.response import Response
from rest_framework.decorators import action
from doc_api.models import Doc, DocTemplate, DocTag, DocHistory
from doc_api.serializers.doc_serializers import DocListSerializer, DocDetailSerializer, DocActionSerializer
from doc_api.serializers.doc_serializers import DocTagListSerializer, DocTagDetailSerializer, DocTagActionSerializer
from doc_api.serializers.doc_serializers import DocTemplateListSerializer, DocTemplateDetailSerializer, \
    DocTemplateActionSerializer, DocHistorySerializer
from doc_api.settings.conf import DocStatus
from doc_api.filters.doc_filters import DocParameterFilter, DocTagParameterFilter, DocTemplateParameterFilter
from django.db.models import Q
from doc_api.settings.conf import CreateAction, UpdateAction, DeleteAction, RecoverAction
from doc_api.utils.action_log_helpers import action_log


class DocViewSet(viewsets.ModelViewSet):
    """
    文档管理
    """
    filter_backends = (filters.OrderingFilter, filters.SearchFilter, DocParameterFilter)
    search_fields = ('c_doc__name', 'title',)
    ordering_fields = ('c_doc', 'title', 'created_time', 'parent_doc', 'status', 'sort')
    filterset_fields = ('creator', 'created_time', 'c_doc', 'status', 'is_deleted')
    queryset = Doc.objects.order_by('-id').all()
    permission_classes = (permissions.IsAuthenticated, )

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        headers = self.get_success_headers(serializer.data)
        instance = Doc.objects.get(pk=int(serializer.data['id']))
        # 保存最新一次记录
        instance.pre_content = instance.content
        instance.save()
        action_log(request=request, user=request.user, action_type=CreateAction, old_instance=None, instance=instance,
                   action_info=f'新增文档:{instance.__str__()}')
        result = {'success': True, 'messages': f'新增文档:{instance.__str__()}',
                  'results': serializer.data}
        return Response(result, status=status.HTTP_200_OK, headers=headers)

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        result = {'success': True, 'messages': f'获取文档信息:{instance.__str__()}',
                  'results': serializer.data}
        return Response(result, status=status.HTTP_200_OK)

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        parent_doc_id = request.data.get('parent_doc', None)
        instance = self.get_object()
        old_instance = self.get_object()
        if parent_doc_id and int(parent_doc_id) == instance.id:
            result = {'success': False, 'messages': f'上级文档不能为当前文档自身'}
            return Response(result, status=status.HTTP_400_BAD_REQUEST)
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        if getattr(instance, '_prefetched_objects_cache', None):
            instance._prefetched_objects_cache = {}
        # 保存最新一次记录
        instance.pre_content = old_instance.content
        instance.save()
        # 历史记录
        DocHistory.objects.create(doc=instance, content=instance.pre_content, creator=request.user)
        action_log(request=request, user=request.user, action_type=UpdateAction, old_instance=old_instance,
                   instance=instance, action_info=f'修改文档:{instance.__str__()}')
        result = {'success': True, 'messages': f'修改文档:{instance.__str__()}',
                  'results': serializer.data}
        return Response(result, status=status.HTTP_200_OK)

    def partial_update(self, request, *args, **kwargs):
        kwargs['partial'] = True
        return self.update(request, *args, **kwargs)

    def list(self, request, *args, **kwargs):
        query_params = self.request.query_params
        not_page = query_params.get('not_page', '')
        tree = query_params.get('tree', '')
        personal = query_params.get('personal', '')
        cooperate = query_params.get('cooperate', '')
        queryset = self.filter_queryset(self.get_queryset())
        if tree.lower() == 'true':
            queryset = queryset.filter(parent_doc=None)
        if personal.lower() == 'true':
            queryset = queryset.filter(creator=request.user)
        if cooperate.lower() == 'true':
            queryset = queryset.exclude(creator=request.user). \
                filter(Q(c_doc__users__user=request.user) | Q(c_doc__teams__team_group__members=request.user))
        queryset = queryset.distinct()
        if not_page and not_page.lower() != 'false':
            serializer = self.get_serializer(queryset, many=True)
            result = {'success': True, 'messages': '获取文档不分页数据',
                      'results': serializer.data}
            return Response(result, status=status.HTTP_200_OK)
        else:
            page = self.paginate_queryset(queryset)
            if page is not None:
                serializer = self.get_serializer(page, many=True)
                return self.get_paginated_response(serializer.data)
            serializer = self.get_serializer(queryset, many=True)
            result = {'success': True, 'messages': '获取文档不分页数据',
                      'results': serializer.data}
            return Response(result, status=status.HTTP_200_OK)

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        clear = request.data.get('clear', False)
        if clear:
            self.perform_destroy(instance)
            messages = f'清空文档:{instance.__str__()}'
        else:
            instance.is_deleted = True
            instance.save()
            messages = f'删除文档:{instance.__str__()}'
        action_log(request=request, user=request.user, action_type=DeleteAction, old_instance=None,
                   instance=instance, action_info=messages)
        result = {'success': True, 'messages': messages}
        return Response(result, status=status.HTTP_200_OK)

    @action(methods=['POST', 'DELETE'], detail=False)
    def bulk_delete(self, request, *args, **kwargs):
        # 批量删除
        deleted_objects_ids = request.data.get('deleted_objects', [])
        clear = request.data.get('clear', False)
        queryset = self.get_queryset()
        deleted_objects_names = []
        for deleted_object_id in deleted_objects_ids:
            instance = Doc.objects.get(pk=int(deleted_object_id))
            deleted_objects_names.append(instance.__str__())
        deleted_objects = queryset.filter(id__in=deleted_objects_ids)
        if clear:
            deleted_objects.delete()
            messages = f'批量清空文档:{deleted_objects_names}'
        else:
            deleted_objects.update(is_deleted=True)
            messages = f'批量删除文档:{deleted_objects_names}'
        action_log(request=request, user=request.user, action_type=DeleteAction, old_instance=None,
                   instance=None, action_info=messages)
        result = {'success': True, 'messages': messages}
        return Response(result, status=status.HTTP_200_OK)

    @action(methods=['GET'], detail=False)
    def doc_status(self, request, *args, **kwargs):
        result = {'success': True, 'messages': f'获取文档状态类别:', 'results': DocStatus}
        return Response(result, status=status.HTTP_200_OK)

    @action(methods=['POST'], detail=True)
    def recover(self, request, *args, **kwargs):
        instance = self.get_object()
        instance.is_deleted = False
        instance.save()
        # self.perform_destroy(instance)
        action_log(request=request, user=request.user, action_type=RecoverAction, old_instance=None,
                   instance=instance, action_info=f'还原文档:{instance.__str__()}')
        result = {'success': True, 'messages': f'还原文档:{instance.__str__()}'}
        return Response(result, status=status.HTTP_200_OK)

    @action(methods=['POST'], detail=False)
    def bulk_recover(self, request, *args, **kwargs):
        # 批量删除
        recover_objects_ids = request.data.get('recover_objects', [])
        queryset = self.get_queryset()
        recover_objects_names = []
        for recover_objects_id in recover_objects_ids:
            instance = Doc.objects.get(pk=int(recover_objects_id))
            recover_objects_names.append(instance.__str__())
        recover_objects = queryset.filter(id__in=recover_objects_ids)
        recover_objects.update(is_deleted=False)
        action_log(request=request, user=request.user, action_type=RecoverAction, old_instance=None,
                   instance=None, action_info=f'批量还原文档:{recover_objects_names}')
        result = {'success': True, 'messages': f'批量还原文档:{recover_objects_names}'}
        return Response(result, status=status.HTTP_200_OK)

    @action(methods=['GET'], detail=True)
    def history_list(self, request, *args, **kwargs):
        instance = self.get_object()
        history_docs = DocHistory.objects.filter(doc=instance).order_by('-created_time').all()
        serializer = self.get_serializer(history_docs, many=True)
        result = {'success': True, 'messages': '获取文档历史记录不分页数据',
                  'results': serializer.data}
        return Response(result, status=status.HTTP_200_OK)

    @action(methods=['GET'], detail=True)
    def history_detail(self, request, *args, **kwargs):
        instance = self.get_object()
        query_params = self.request.query_params
        history_id = query_params.get('history_id', '')
        history_doc = DocHistory.objects.get(pk=int(history_id))

        result = {'success': True, 'messages': '获取文档历史揭露不分页数据',
                  'results': {
                      'current_content': instance.content,
                      'content': history_doc.content}
                  }
        return Response(result, status=status.HTTP_200_OK)

    def get_serializer_class(self):
        if self.action == 'list':
            return DocListSerializer
        elif self.action == 'retrieve':
            return DocDetailSerializer
        elif self.action == 'history_list':
            return DocHistorySerializer
        return DocActionSerializer


class DocTemplateViewSet(viewsets.ModelViewSet):
    """文档模板管理"""
    filter_backends = (filters.OrderingFilter, filters.SearchFilter, DocTemplateParameterFilter)
    search_fields = ('name',)
    ordering_fields = ('name', 'creator', 'created_time')
    filterset_fields = ('creator', 'created_time')
    queryset = DocTemplate.objects.order_by('-id').all()
    permission_classes = (permissions.IsAuthenticated, )

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        headers = self.get_success_headers(serializer.data)
        instance = DocTemplate.objects.get(pk=int(serializer.data['id']))
        action_log(request=request, user=request.user, action_type=CreateAction, old_instance=None,
                   instance=instance, action_info=f'新增文档模板:{instance.__str__()}')
        result = {'success': True, 'messages': f'新增文档模板:{instance.__str__()}',
                  'results': serializer.data}
        return Response(result, status=status.HTTP_200_OK, headers=headers)

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        result = {'success': True, 'messages': f'获取文档模板信息:{instance.__str__()}',
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
                   instance=instance, action_info=f'修改文档模板:{instance.__str__()}')
        result = {'success': True, 'messages': f'修改文档模板:{instance.__str__()}',
                  'results': serializer.data}
        return Response(result, status=status.HTTP_200_OK)

    def partial_update(self, request, *args, **kwargs):
        kwargs['partial'] = True
        return self.update(request, *args, **kwargs)

    def list(self, request, *args, **kwargs):
        query_params = self.request.query_params
        not_page = query_params.get('not_page', False)
        queryset = self.filter_queryset(self.get_queryset())
        personal = query_params.get('personal', '')
        options = query_params.get('options', '')
        if personal.lower() == 'true':
            queryset = queryset.filter(creator=request.user)
        if options.lower() == 'true':
            queryset = queryset.filter(creator=request.user)
        if not_page and not_page.lower() != 'false':
            serializer = self.get_serializer(queryset, many=True)
            result = {'success': True, 'messages': '获取文档模板不分页数据',
                      'results': serializer.data}
            return Response(result, status=status.HTTP_200_OK)
        else:
            page = self.paginate_queryset(queryset)
            if page is not None:
                serializer = self.get_serializer(page, many=True)
                return self.get_paginated_response(serializer.data)
            serializer = self.get_serializer(queryset, many=True)
            result = {'success': True, 'messages': '获取文档模板不分页数据',
                      'results': serializer.data}
            return Response(result, status=status.HTTP_200_OK)

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        self.perform_destroy(instance)
        action_log(request=request, user=request.user, action_type=DeleteAction, old_instance=None,
                   instance=instance, action_info=f'删除文档模板:{instance.__str__()}')
        result = {'success': True, 'messages': f'删除文档模板:{instance.__str__()}'}
        return Response(result, status=status.HTTP_200_OK)

    @action(methods=['POST', 'DELETE'], detail=False)
    def bulk_delete(self, request, *args, **kwargs):
        # 批量删除
        deleted_objects_ids = request.data.get('deleted_objects', [])
        queryset = self.get_queryset()
        deleted_objects_names = []
        for deleted_object_id in deleted_objects_ids:
            instance = DocTemplate.objects.get(pk=int(deleted_object_id))
            deleted_objects_names.append(instance.__str__())
        deleted_objects = queryset.filter(id__in=deleted_objects_ids).all()
        deleted_objects.delete()
        action_log(request=request, user=request.user, action_type=DeleteAction, old_instance=None,
                   instance=None, action_info=f'批量删除文档模板:{deleted_objects_names}')
        result = {'success': True, 'messages': f'批量删除文档模板:{deleted_objects_names}'}
        return Response(result, status=status.HTTP_200_OK)

    def get_serializer_class(self):
        if self.action == 'list':
            return DocTemplateListSerializer
        elif self.action == 'retrieve':
            return DocTemplateDetailSerializer
        return DocTemplateActionSerializer


class DocTagViewSet(viewsets.ModelViewSet):
    """文档标签管理"""
    filter_backends = (filters.OrderingFilter, filters.SearchFilter, DocTagParameterFilter)
    search_fields = ('name',)
    ordering_fields = ('name', 'creator', 'created_time')
    filterset_fields = ('creator', 'created_time')
    queryset = DocTag.objects.order_by('-id').all()
    permission_classes = (permissions.IsAuthenticated, )

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        name = request.data.get('name', False)
        doc_tag = DocTag.objects.filter(name=name, creator=request.user).first()
        if doc_tag:
            result = {'success': False, 'messages': f'你已创建标签:{doc_tag.__str__()} 请勿重复创建'}
            return Response(result, status=status.HTTP_400_BAD_REQUEST)
        self.perform_create(serializer)
        headers = self.get_success_headers(serializer.data)
        instance = DocTag.objects.get(pk=int(serializer.data['id']))
        action_log(request=request, user=request.user, action_type=CreateAction, old_instance=None,
                   instance=instance, action_info=f'新增文档标签:{instance.__str__()}')
        result = {'success': True, 'messages': f'新增文档标签:{instance.__str__()}',
                  'results': serializer.data}
        return Response(result, status=status.HTTP_200_OK, headers=headers)

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        result = {'success': True, 'messages': f'获取文档标签信息:{instance.__str__()}',
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
                   instance=instance, action_info=f'修改文档标签:{instance.__str__()}')
        result = {'success': True, 'messages': f'修改文档标签:{instance.__str__()}',
                  'results': serializer.data}
        return Response(result, status=status.HTTP_200_OK)

    def partial_update(self, request, *args, **kwargs):
        kwargs['partial'] = True
        return self.update(request, *args, **kwargs)

    def list(self, request, *args, **kwargs):
        query_params = self.request.query_params
        not_page = query_params.get('not_page', False)
        queryset = self.filter_queryset(self.get_queryset())
        personal = query_params.get('personal', '')
        options = query_params.get('options', '')
        if personal.lower() == 'true':
            queryset = queryset.filter(creator=request.user)
        if options.lower() == 'true':
            queryset = queryset.filter(creator=request.user)
        if not_page and not_page.lower() != 'false':
            serializer = self.get_serializer(queryset, many=True)
            result = {'success': True, 'messages': '获取文档标签不分页数据',
                      'results': serializer.data}
            return Response(result, status=status.HTTP_200_OK)
        else:
            page = self.paginate_queryset(queryset)
            if page is not None:
                serializer = self.get_serializer(page, many=True)
                return self.get_paginated_response(serializer.data)
            serializer = self.get_serializer(queryset, many=True)
            result = {'success': True, 'messages': '获取文档标签不分页数据',
                      'results': serializer.data}
            return Response(result, status=status.HTTP_200_OK)

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        self.perform_destroy(instance)
        action_log(request=request, user=request.user, action_type=DeleteAction, old_instance=None,
                   instance=instance, action_info=f'删除文档标签:{instance.__str__()}')
        result = {'success': True, 'messages': f'删除文档标签:{instance.__str__()}'}
        return Response(result, status=status.HTTP_200_OK)

    @action(methods=['POST', 'DELETE'], detail=False)
    def bulk_delete(self, request, *args, **kwargs):
        # 批量删除
        deleted_objects_ids = request.data.get('deleted_objects', [])
        queryset = self.get_queryset()
        deleted_objects_names = []
        for deleted_object_id in deleted_objects_ids:
            instance = DocTag.objects.get(pk=int(deleted_object_id))
            deleted_objects_names.append(instance.__str__())
        deleted_objects = queryset.filter(id__in=deleted_objects_ids).all()
        deleted_objects.delete()
        action_log(request=request, user=request.user, action_type=DeleteAction, old_instance=None,
                   instance=None, action_info=f'批量删除文档标签:{deleted_objects_names}')
        result = {'success': True, 'messages': f'批量删除文档标签:{deleted_objects_names}'}
        return Response(result, status=status.HTTP_200_OK)

    def get_serializer_class(self):
        if self.action == 'list':
            return DocTagListSerializer
        elif self.action == 'retrieve':
            return DocTagDetailSerializer
        return DocTagActionSerializer
