from django.conf.urls import url, include
from rest_framework import routers
from doc_api.apis import auth_apis, user_apis, c_doc_apis

router = routers.DefaultRouter()

router.register('users', user_apis.UserViewSet, basename='users')
router.register('team_groups', user_apis.TeamGroupViewSet, basename='team_groups')
router.register('collected_docs', c_doc_apis.CollectedDocViewSet, basename='collected_docs')
router.register('collected_doc_users', c_doc_apis.CollectedDocUserViewSet, basename='collected_doc_users')
router.register('collected_doc_teams', c_doc_apis.CollectedDocTeamViewSet, basename='collected_doc_teams')


urlpatterns = [
    url(r'^api-auth/', include('rest_framework.urls', namespace='rest_framework')),
    url(r'^', include(router.urls), name='api-index'),
    url(r'^auth/$', auth_apis.Authentication.as_view(), name='authentication'),
]