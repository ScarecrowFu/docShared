from django.conf.urls import url, include
from rest_framework import routers
from doc_api.apis import auth_apis, user_apis, c_doc_apis, doc_apis, file_apis, sys_manage_apis

router = routers.DefaultRouter()

router.register('users', user_apis.UserViewSet, basename='users')
router.register('team_groups', user_apis.TeamGroupViewSet, basename='team_groups')

router.register('collected_docs', c_doc_apis.CollectedDocViewSet, basename='collected_docs')
router.register('collected_doc_users', c_doc_apis.CollectedDocUserViewSet, basename='collected_doc_users')
router.register('collected_doc_teams', c_doc_apis.CollectedDocTeamViewSet, basename='collected_doc_teams')

router.register('docs', doc_apis.DocViewSet, basename='docs')
router.register('doc_templates', doc_apis.DocTemplateViewSet, basename='doc_templates')
router.register('doc_tags', doc_apis.DocTagViewSet, basename='doc_tags')

router.register('file_attachments', file_apis.FileAttachmentViewSet, basename='file_attachments')
router.register('file_groups', file_apis.FileGroupViewSet, basename='file_groups')

router.register('announcements', sys_manage_apis.AnnouncementViewSet, basename='announcements')
router.register('reg_codes', sys_manage_apis.RegisterCodeViewSet, basename='reg_codes')


urlpatterns = [
    url(r'^api-auth/', include('rest_framework.urls', namespace='rest_framework')),
    url(r'^', include(router.urls), name='api-index'),
    url(r'^auth/$', auth_apis.Authentication.as_view(), name='authentication'),
]