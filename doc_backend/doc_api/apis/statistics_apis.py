from rest_framework import viewsets, mixins, filters, status, views
from rest_framework.response import Response
from rest_framework.decorators import action
from doc_api.models import Doc, CollectedDoc, User, TeamGroup, FileAttachment
from doc_api.serializers.doc_serializers import DocListSerializer, DocDetailSerializer, DocActionSerializer
from doc_api.serializers.c_doc_serializers import CollectedDocListSerializer, CollectedDocActionSerializer, CollectedDocDetailSerializer
from doc_api.serializers.sys_manage_serializers import SystemSettingActionSerializer, SystemSettingDetailSerializer, \
    SystemSettingListSerializer
from doc_api.settings.conf import WebsiteSet, BaseSet, EmailSet
from doc_api.settings.conf import DocStatus
from doc_api.filters.doc_filters import DocParameterFilter
from doc_api.filters.c_doc_filters import CollectedDocOrderingFilter, CollectedDocParameterFilter
from doc_api.settings.conf import CollectedDocPermissions, CollectedDocMembersPermissions
from django.db.models import Q
from doc_api.utils.md_helpers import extract_toc
from rest_framework import permissions


class DashboardStatisticsViewSet(views.APIView):
    """
    首页接口
    """
    permission_classes = (permissions.IsAuthenticated,)

    def get(self, request, *args, **kwargs):
        query_params = self.request.query_params
        personal = query_params.get('personal', '')
        c_doc_total = CollectedDoc.objects
        doc_total = Doc.objects.filter(is_deleted=False)
        user_total = User.objects.filter(is_active=True, is_deleted=False)
        team_total = TeamGroup.objects
        attachment_total = FileAttachment.objects.filter(file_type=10)
        image_total = FileAttachment.objects.filter(file_type=20)
        if personal.lower() == 'true':
            c_doc_total = c_doc_total.filter(creator=request.user)
            doc_total = doc_total.filter(creator=request.user)
            attachment_total = attachment_total.filter(creator=request.user)
            image_total = image_total.filter(creator=request.user)
            results = {
                'c_doc_total': c_doc_total.distinct().count(),
                'doc_total': doc_total.distinct().count(),
                'attachment_total': attachment_total.distinct().count(),
                'image_total': image_total.distinct().count(),
            }
        else:
            results = {
                'c_doc_total': c_doc_total.distinct().count(),
                'doc_total': doc_total.distinct().count(),
                'attachment_total': attachment_total.distinct().count(),
                'image_total': image_total.distinct().count(),
                'user_total': user_total.distinct().count(),
                'team_total': team_total.distinct().count(),
            }

        result = {'success': True, 'messages': f'统计信息',
                  'results': results}
        return Response(result, status=status.HTTP_200_OK)
