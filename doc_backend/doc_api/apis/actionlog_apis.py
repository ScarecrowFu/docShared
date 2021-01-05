from rest_framework import viewsets, mixins, filters, status
from rest_framework import permissions
from rest_framework.response import Response
from rest_framework.decorators import action
from doc_api.models import ActionLog
from doc_api.serializers.actionlog_serializers import ActionLogDetailSerializer, ActionLogSerializer
from doc_api.filters.action_log_filters import ActionLogParameterFilter
from doc_api.settings.conf import ActionType


class ActionLogViewSet(viewsets.GenericViewSet, mixins.ListModelMixin, mixins.RetrieveModelMixin):
    """
    显示日志
    """
    filter_backends = (filters.OrderingFilter, filters.SearchFilter, ActionLogParameterFilter)
    search_fields = ('action_info', 'remote_ip')
    ordering_fields = ('user', 'remote_ip', 'created_time', 'action_type')
    filterset_fields = ('user', 'action_type', 'created_time')
    queryset = ActionLog.objects.order_by('-id').all()
    permission_classes = (permissions.IsAuthenticated,)

    def list(self, request, *args, **kwargs):
        query_params = self.request.query_params
        not_page = query_params.get('not_page', False)
        personal = query_params.get('personal', '')
        queryset = self.filter_queryset(self.get_queryset())
        if personal.lower() == 'true':
            queryset = queryset.filter(user=request.user)
        queryset = queryset.distinct()
        if not_page and not_page.lower() != 'false':
            serializer = self.get_serializer(queryset, many=True)
            result = {'success': True, 'messages': '成功获取日志不分页数据!',
                      'results': serializer.data}
            return Response(result, status=status.HTTP_200_OK)
        else:
            page = self.paginate_queryset(queryset)
            if page is not None:
                serializer = self.get_serializer(page, many=True)
                return self.get_paginated_response(serializer.data)

            serializer = self.get_serializer(queryset, many=True)
            result = {'success': True, 'messages': '成功获取日志不分页数据!',
                      'results': serializer.data}
            return Response(result, status=status.HTTP_200_OK)

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        result = {'success': True, 'messages': '成功获取日志信息:{}!'.format(instance.__str__()),
                  'results': serializer.data}
        return Response(result, status=status.HTTP_200_OK)

    @action(methods=['GET'], detail=False)
    def action_types(self, request, *args, **kwargs):
        result = {'success': True, 'messages': f'获取操作分类', 'results': ActionType}
        return Response(result, status=status.HTTP_200_OK)

    def get_serializer_class(self):
        if self.action == 'retrieve':
            return ActionLogDetailSerializer
        return ActionLogSerializer
