from django.conf.urls import url, include
from rest_framework import routers
from doc_api.apis import auth_apis, user_apis, c_doc_apis, doc_apis, file_apis, sys_manage_apis, anonymous_apis, \
    actionlog_apis, statistics_apis

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

router.register('action_logs', actionlog_apis.ActionLogViewSet, basename='action_logs')
router.register('announcements', sys_manage_apis.AnnouncementViewSet, basename='announcements')
router.register('reg_codes', sys_manage_apis.RegisterCodeViewSet, basename='reg_codes')
router.register('email_codes', sys_manage_apis.EmailVerificationCodeViewSet, basename='email_codes')
router.register('sys_set', sys_manage_apis.SystemSettingViewSet, basename='sys_set')

router.register('anonymous_c_docs', anonymous_apis.AnonymousCollectedDocViewSet, basename='anonymous_c_docs')
router.register('anonymous_docs', anonymous_apis.AnonymousDocViewSet, basename='anonymous_docs')
router.register('anonymous_set', anonymous_apis.SystemSettingViewSet, basename='anonymous_set')


urlpatterns = [
    url(r'^api-auth/', include('rest_framework.urls', namespace='rest_framework')),
    url(r'^', include(router.urls), name='api-index'),
    url(r'^auth/$', auth_apis.Authentication.as_view(), name='authentication'),
    url(r'^register/$', auth_apis.Register.as_view(), name='register'),
    url(r'^forget_password/$', auth_apis.ForgetPassword.as_view(), name='forget_password'),
    url(r'^reset_password/$', auth_apis.ReSetPassword.as_view(), name='reset_password'),
    url(r'^validation/$', auth_apis.Validation.as_view(), name='validation'),
    url(r'^dashboard_statistics/$', statistics_apis.DashboardStatisticsViewSet.as_view(), name='dashboard_statistics'),
]