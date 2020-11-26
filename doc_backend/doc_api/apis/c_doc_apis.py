from rest_framework import viewsets, mixins, filters, status
from rest_framework import permissions
from rest_framework.response import Response
from rest_framework.decorators import action
from doc_api.models import CollectedDoc, CollectedDocUser, CollectedDocTeam
from doc_api.serializers.c_doc_serializers import CollectedDocListSerializer, CollectedDocDetailSerializer, \
    CollectedDocActionSerializer
from doc_api.serializers.c_doc_serializers import CollectedDocUserListSerializer, CollectedDocUserDetailSerializer, \
    CollectedDocUserActionSerializer
from doc_api.serializers.c_doc_serializers import CollectedDocTeamListSerializer, CollectedDocTeamDetailSerializer,\
    CollectedDocTeamActionSerializer
from doc_api.settings.conf import CollectedDocPermissions, CollectedDocMembersPermissions
from doc_api.filters.c_doc_filters import CollectedDocOrderingFilter, CollectedDocParameterFilter


class CollectedDocViewSet(viewsets.ModelViewSet):
    """文集管理"""
    filter_backends = (CollectedDocOrderingFilter, filters.SearchFilter, CollectedDocParameterFilter)
    search_fields = ('name', )
    ordering_fields = ('name', 'intro', 'perm', 'creator', 'created_time', 'docs_cnt')
    filterset_fields = ('perm', 'creator',  'created_time')
    queryset = CollectedDoc.objects.order_by('-id').all()
    permission_classes = (permissions.IsAuthenticated, )

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        headers = self.get_success_headers(serializer.data)
        instance = CollectedDoc.objects.get(pk=int(serializer.data['id']))
        # todo 记录操作日志
        result = {'success': True, 'messages': f'新增文集:{instance.__str__()}',
                  'results': serializer.data}
        return Response(result, status=status.HTTP_200_OK, headers=headers)

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        result = {'success': True, 'messages': f'获取文集信息:{instance.__str__()}!',
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
        result = {'success': True, 'messages': f'修改文集:{instance.__str__()}!',
                  'results': serializer.data}
        return Response(result, status=status.HTTP_200_OK)

    def partial_update(self, request, *args, **kwargs):
        kwargs['partial'] = True
        return self.update(request, *args, **kwargs)

    def list(self, request, *args, **kwargs):
        query_params = self.request.query_params
        not_page = query_params.get('not_page', False)
        queryset = self.filter_queryset(self.get_queryset())
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

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        self.perform_destroy(instance)
        # todo 记录操作日志
        result = {'success': True, 'messages': f'删除文集:{instance.__str__()}'}
        return Response(result, status=status.HTTP_200_OK)

    @action(methods=['POST', 'DELETE'], detail=False)
    def bulk_delete(self, request, *args, **kwargs):
        # 批量删除
        deleted_objects_ids = request.data.get('deleted_objects', [])
        queryset = self.get_queryset()
        deleted_objects_names = []
        for deleted_object_id in deleted_objects_ids:
            instance = CollectedDoc.objects.get(pk=int(deleted_object_id))
            deleted_objects_names.append(instance.__str__())
        deleted_objects = queryset.filter(id__in=deleted_objects_ids).all()
        deleted_objects.delete()
        # todo 记录操作日志
        result = {'success': True, 'messages': f'批量删除文集:{deleted_objects_names}'}
        return Response(result, status=status.HTTP_200_OK)

    @action(methods=['GET'], detail=False)
    def permission_types(self, request, *args, **kwargs):
        result = {'success': True, 'messages': f'获取文集权限分类:', 'results': CollectedDocPermissions}
        return Response(result, status=status.HTTP_200_OK)

    @action(methods=['GET'], detail=False)
    def member_permission_types(self, request, *args, **kwargs):
        result = {'success': True, 'messages': f'获取文集成员权限分类:', 'results': CollectedDocMembersPermissions}
        return Response(result, status=status.HTTP_200_OK)

    # @action(methods=['GET', 'POST'], detail=True)
    # def members(self, request, *args, **kwargs):
    #     instance = self.get_object()
    #     if request.method == 'GET':
    #         users = instance.users.all()
    #         teams = instance.teams.all()
    #         users_serializer = CollectedDocUserSerializer(users, many=True)
    #         teams_serializer = CollectedDocTeamSerializer(teams, many=True)
    #         result = {'success': True, 'messages': f'获取文集成员:',
    #                   'results': {'id': instance.id, 'name': instance.name, 'intro': instance.intro,
    #                               'users': users_serializer.data, 'teams': teams_serializer.data}}
    #         return Response(result, status=status.HTTP_200_OK)
    #     if request.method == 'POST':
    #         print(request.data)
    #         members_type = request.data.get('members_type', None)
    #         c_doc_user = request.data.get('user', {})
    #         c_doc_team = request.data.get('team', [])
    #         if members_type == 'user':
    #             user = User.objects.get(pk=int(c_doc_user['user']))
    #             c_doc_user_obj = CollectedDocUser.objects.filter(c_doc=instance, user=user).first()
    #             print(c_doc_user)
    #             print(c_doc_user_obj)
    #             if c_doc_user_obj:
    #                 c_doc_user_obj.perm = c_doc_user['perm']
    #                 c_doc_user_obj.save()
    #             else:
    #                 c_doc_user_obj = CollectedDocUser.objects.create(c_doc=instance, user=user, perm=c_doc_user['perm'])
    #             serializer = CollectedDocUserSerializer(c_doc_user_obj)
    #             result = {'success': True, 'messages': f'成功保存成员权限:', 'results': serializer.data}
    #             return Response(result, status=status.HTTP_200_OK)
    #         elif members_type == 'team':
    #             result = {'success': True, 'messages': f'成功保存成员权限:', 'results': {}}
    #             return Response(result, status=status.HTTP_200_OK)
    #         else:
    #             result = {'success': True, 'messages': f'成功保存成员权限:', 'results': {}}
    #             return Response(result, status=status.HTTP_200_OK)

    def get_serializer_class(self):
        if self.action == 'list':
            return CollectedDocListSerializer
        elif self.action == 'retrieve':
            return CollectedDocDetailSerializer
        return CollectedDocActionSerializer


class CollectedDocUserViewSet(viewsets.ModelViewSet):
    """文集用户成员"""
    filter_backends = (filters.OrderingFilter, filters.SearchFilter)
    search_fields = ('c_doc__name', 'user_username', 'user_nickname', 'perm')
    ordering_fields = ('c_doc__name', 'user_username', 'user_nickname', 'perm')
    queryset = CollectedDocUser.objects.order_by('-id').all()
    permission_classes = (permissions.IsAuthenticated, )

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        c_doc_id = request.data.get('c_doc', False)
        user_id = request.data.get('user', False)
        print(c_doc_id, user_id)
        c_doc_user = CollectedDocUser.objects.filter(c_doc__id=int(c_doc_id), user__id=int(user_id)).first()
        if c_doc_user:
            result = {'success': False, 'messages': f'文集用户成员:{c_doc_user.__str__()}已经存在, 请勿重复创建'}
            return Response(result, status=status.HTTP_400_BAD_REQUEST)
        self.perform_create(serializer)
        headers = self.get_success_headers(serializer.data)
        instance = CollectedDocUser.objects.get(pk=int(serializer.data['id']))
        # todo 记录操作日志
        result = {'success': True, 'messages': f'新增文集用户成员:{instance.__str__()}',
                  'results': serializer.data}
        return Response(result, status=status.HTTP_200_OK, headers=headers)

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        result = {'success': True, 'messages': f'获取文集用户成员信息:{instance.__str__()}!',
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
        result = {'success': True, 'messages': f'修改文集用户成员:{instance.__str__()}!',
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
            result = {'success': True, 'messages': '获取文集用户成员不分页数据!',
                      'results': serializer.data}
            return Response(result, status=status.HTTP_200_OK)
        else:
            page = self.paginate_queryset(queryset)
            if page is not None:
                serializer = self.get_serializer(page, many=True)
                return self.get_paginated_response(serializer.data)
            serializer = self.get_serializer(queryset, many=True)
            result = {'success': True, 'messages': '获取文集用户成员不分页数据!',
                      'results': serializer.data}
            return Response(result, status=status.HTTP_200_OK)

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        self.perform_destroy(instance)
        # todo 记录操作日志
        result = {'success': True, 'messages': f'删除文集用户成员:{instance.__str__()}'}
        return Response(result, status=status.HTTP_200_OK)

    @action(methods=['POST', 'DELETE'], detail=False)
    def bulk_delete(self, request, *args, **kwargs):
        # 批量删除
        deleted_objects_ids = request.data.get('deleted_objects', [])
        queryset = self.get_queryset()
        deleted_objects_names = []
        for deleted_object_id in deleted_objects_ids:
            instance = CollectedDocUser.objects.get(pk=int(deleted_object_id))
            deleted_objects_names.append(instance.__str__())
        deleted_objects = queryset.filter(id__in=deleted_objects_ids).all()
        deleted_objects.delete()
        # todo 记录操作日志
        result = {'success': True, 'messages': f'批量删除文集用户成员:{deleted_objects_names}'}
        return Response(result, status=status.HTTP_200_OK)

    def get_serializer_class(self):
        if self.action == 'list':
            return CollectedDocUserListSerializer
        elif self.action == 'retrieve':
            return CollectedDocUserDetailSerializer
        return CollectedDocUserActionSerializer


class CollectedDocTeamViewSet(viewsets.ModelViewSet):
    """文集团队成员"""
    filter_backends = (filters.OrderingFilter, filters.SearchFilter)
    search_fields = ('c_doc__name', 'team_group__name',)
    ordering_fields = ('c_doc__name', 'team_group__name',)
    queryset = CollectedDocTeam.objects.order_by('-id').all()
    permission_classes = (permissions.IsAuthenticated, )

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
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
        queryset = self.filter_queryset(self.get_queryset())
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
