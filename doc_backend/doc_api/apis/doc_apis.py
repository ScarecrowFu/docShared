from rest_framework import viewsets, mixins, filters, status
from rest_framework import permissions
from rest_framework.response import Response
from rest_framework.decorators import action
from doc_api.models import Doc


class DocViewSet(viewsets.ModelViewSet):
    """文集管理"""
    filter_backends = (filters.OrderingFilter, filters.SearchFilter)
    search_fields = ('c_doc__name', 'team_group__name',)
    ordering_fields = ('c_doc__name', 'team_group__name',)
    queryset = Doc.objects.order_by('-id').all()
    permission_classes = (permissions.IsAuthenticated, )

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        c_doc_id = request.data.get('c_doc', False)
        team_group_id = request.data.get('team_group', False)
        c_doc_team = CollectedDocTeam.objects.filter(c_doc__id=int(c_doc_id), team_group__id=int(team_group_id)).first()
        if c_doc_team:
            result = {'success': False, 'messages': f'文集团队成员:{c_doc_team.__str__()}已经存在, 请勿重复创建'}
            return Response(result, status=status.HTTP_400_BAD_REQUEST)
        self.perform_create(serializer)
        headers = self.get_success_headers(serializer.data)
        instance = CollectedDocTeam.objects.get(pk=int(serializer.data['id']))
        # todo 记录操作日志
        result = {'success': True, 'messages': f'新增文集团队成员:{instance.__str__()}',
                  'results': serializer.data}
        return Response(result, status=status.HTTP_200_OK, headers=headers)

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        result = {'success': True, 'messages': f'获取文集用户团队信息:{instance.__str__()}!',
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
        result = {'success': True, 'messages': f'修改文集团队成员:{instance.__str__()}!',
                  'results': serializer.data}
        return Response(result, status=status.HTTP_200_OK)

    def partial_update(self, request, *args, **kwargs):
        kwargs['partial'] = True
        return self.update(request, *args, **kwargs)

    def list(self, request, *args, **kwargs):
        query_params = self.request.query_params
        not_page = query_params.get('not_page', False)
        c_doc_id = query_params.get('c_doc', False)
        queryset = self.filter_queryset(self.get_queryset())
        if c_doc_id:
            c_doc = CollectedDoc.objects.get(pk=c_doc_id)
            queryset = queryset.filter(c_doc=c_doc)
        queryset = queryset.distinct()
        if not_page and not_page.lower() != 'false':
            serializer = self.get_serializer(queryset, many=True)
            result = {'success': True, 'messages': '获取文集团队成员不分页数据!',
                      'results': serializer.data}
            return Response(result, status=status.HTTP_200_OK)
        else:
            page = self.paginate_queryset(queryset)
            if page is not None:
                serializer = self.get_serializer(page, many=True)
                return self.get_paginated_response(serializer.data)
            serializer = self.get_serializer(queryset, many=True)
            result = {'success': True, 'messages': '获取文集团队成员不分页数据!',
                      'results': serializer.data}
            return Response(result, status=status.HTTP_200_OK)

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        self.perform_destroy(instance)
        # todo 记录操作日志
        result = {'success': True, 'messages': f'删除文集团队成员:{instance.__str__()}'}
        return Response(result, status=status.HTTP_200_OK)

    @action(methods=['POST', 'DELETE'], detail=False)
    def bulk_delete(self, request, *args, **kwargs):
        # 批量删除
        deleted_objects_ids = request.data.get('deleted_objects', [])
        queryset = self.get_queryset()
        deleted_objects_names = []
        for deleted_object_id in deleted_objects_ids:
            instance = CollectedDocTeam.objects.get(pk=int(deleted_object_id))
            deleted_objects_names.append(instance.__str__())
        deleted_objects = queryset.filter(id__in=deleted_objects_ids).all()
        deleted_objects.delete()
        # todo 记录操作日志
        result = {'success': True, 'messages': f'批量删除文集团队成员:{deleted_objects_names}'}
        return Response(result, status=status.HTTP_200_OK)

    def get_serializer_class(self):
        if self.action == 'list':
            return CollectedDocTeamListSerializer
        elif self.action == 'retrieve':
            return CollectedDocTeamDetailSerializer
        return CollectedDocTeamActionSerializer
