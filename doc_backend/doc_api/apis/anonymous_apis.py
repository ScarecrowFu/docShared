from rest_framework import viewsets, mixins, filters, status
from rest_framework.response import Response
from rest_framework.decorators import action
from doc_api.models import Doc, CollectedDoc
from doc_api.serializers.doc_serializers import DocListSerializer, DocDetailSerializer, DocActionSerializer
from doc_api.serializers.c_doc_serializers import CollectedDocListSerializer, CollectedDocActionSerializer, CollectedDocDetailSerializer
from doc_api.settings.conf import DocStatus
from doc_api.filters.doc_filters import DocParameterFilter
from doc_api.filters.c_doc_filters import CollectedDocOrderingFilter, CollectedDocParameterFilter
from doc_api.settings.conf import CollectedDocPermissions, CollectedDocMembersPermissions
from django.db.models import Q
from doc_api.utils.md_helpers import extract_toc


class AnonymousCollectedDocViewSet(viewsets.GenericViewSet, mixins.ListModelMixin, mixins.RetrieveModelMixin):
    """
    匿名游客访问接口
    """
    filter_backends = (CollectedDocOrderingFilter, filters.SearchFilter, CollectedDocParameterFilter)
    search_fields = ('name', )
    ordering_fields = ('name', 'intro', 'perm', 'creator', 'created_time', 'docs_cnt')
    filterset_fields = ('perm', 'creator',  'created_time')
    queryset = CollectedDoc.objects.order_by('-id').all()
    permission_classes = ()
    authentication_classes = ()

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        result = {'success': True, 'messages': f'获取文集信息:{instance.__str__()}!',
                  'results': serializer.data}
        return Response(result, status=status.HTTP_200_OK)

    def list(self, request, *args, **kwargs):
        query_params = self.request.query_params
        not_page = query_params.get('not_page', False)
        queryset = self.filter_queryset(self.get_queryset())
        # 仅仅可查看公开的
        queryset = queryset.filter(Q(perm=10) | Q(perm=20))
        queryset = queryset.distinct()
        if not_page and not_page.lower() != 'false':
            serializer = self.get_serializer(queryset, many=True)
            result = {'success': True, 'messages': '获取文集不分页数据!',
                      'results': serializer.data}
            return Response(result, status=status.HTTP_200_OK)
        else:
            page = self.paginate_queryset(queryset)
            if page is not None:
                serializer = self.get_serializer(page, many=True)
                return self.get_paginated_response(serializer.data)
            serializer = self.get_serializer(queryset, many=True)
            result = {'success': True, 'messages': '获取文集不分页数据!',
                      'results': serializer.data}
            return Response(result, status=status.HTTP_200_OK)

    @action(methods=['GET'], detail=False)
    def permission_types(self, request, *args, **kwargs):
        result = {'success': True, 'messages': f'获取文集权限分类:',
                  'results': {key: value for key, value in CollectedDocPermissions.items() if key <= 20}}
        return Response(result, status=status.HTTP_200_OK)

    @action(methods=['POST'], detail=True)
    def valid_perm_value(self, request, *args, **kwargs):
        instance = self.get_object()
        perm_value = request.data.get('perm_value', None)
        if perm_value == instance.perm_value:
            result = {'success': True, 'messages': f'当前访问码正确'}
            return Response(result, status=status.HTTP_200_OK)
        else:
            result = {'success': False, 'messages': f'当前访问码不正确, 无法浏览'}
            return Response(result, status=status.HTTP_400_BAD_REQUEST)

    def get_serializer_class(self):
        if self.action == 'list':
            return CollectedDocListSerializer
        elif self.action == 'retrieve':
            return CollectedDocDetailSerializer
        return CollectedDocActionSerializer


class AnonymousDocViewSet(viewsets.GenericViewSet, mixins.ListModelMixin, mixins.RetrieveModelMixin):
    """
    匿名游客访问接口
    """
    filter_backends = (filters.OrderingFilter, filters.SearchFilter, DocParameterFilter)
    search_fields = ('c_doc__name', 'title',)
    ordering_fields = ('c_doc__name', 'title',)
    filterset_fields = ('creator', 'created_time', 'c_doc', 'status', 'is_deleted')
    queryset = Doc.objects.order_by('-id').all()
    permission_classes = ()
    authentication_classes = ()

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        result = {'success': True, 'messages': f'获取文档信息:{instance.__str__()}!',
                  'results': serializer.data}
        return Response(result, status=status.HTTP_200_OK)

    def list(self, request, *args, **kwargs):
        query_params = self.request.query_params
        not_page = query_params.get('not_page', '')
        tree = query_params.get('tree', '')
        queryset = self.filter_queryset(self.get_queryset())
        if tree.lower() == 'true':
            queryset = queryset.filter(parent_doc=None)
        queryset = queryset.distinct()
        if not_page and not_page.lower() != 'false':
            serializer = self.get_serializer(queryset, many=True)
            result = {'success': True, 'messages': '获取文档不分页数据!',
                      'results': serializer.data}
            return Response(result, status=status.HTTP_200_OK)
        else:
            page = self.paginate_queryset(queryset)
            if page is not None:
                serializer = self.get_serializer(page, many=True)
                return self.get_paginated_response(serializer.data)
            serializer = self.get_serializer(queryset, many=True)
            result = {'success': True, 'messages': '获取文档不分页数据!',
                      'results': serializer.data}
            return Response(result, status=status.HTTP_200_OK)

    @action(methods=['GET'], detail=False)
    def doc_status(self, request, *args, **kwargs):
        result = {'success': True, 'messages': f'获取文档状态类别:', 'results': DocStatus}
        return Response(result, status=status.HTTP_200_OK)

    @action(methods=['GET'], detail=True)
    def doc_toc(self, request, *args, **kwargs):
        instance = self.get_object()
        toc = extract_toc(instance.content)
        result = {'success': True, 'messages': f'获取当前文档:{instance.title}的目录信息', 'results': toc}
        return Response(result, status=status.HTTP_200_OK)

    def get_serializer_class(self):
        if self.action == 'list':
            return DocListSerializer
        elif self.action == 'retrieve':
            return DocDetailSerializer
        return DocActionSerializer
