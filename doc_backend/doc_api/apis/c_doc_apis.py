from rest_framework import viewsets, mixins, filters, status
from rest_framework import permissions
from rest_framework.response import Response
from rest_framework.decorators import action
from doc_api.models import CollectedDoc, CollectedDocUser, CollectedDocTeam, CollectedDocSetting, User
from doc_api.serializers.c_doc_serializers import CollectedDocListSerializer, CollectedDocDetailSerializer, \
    CollectedDocActionSerializer
from doc_api.serializers.c_doc_serializers import CollectedDocUserListSerializer, CollectedDocUserDetailSerializer, \
    CollectedDocUserActionSerializer
from doc_api.serializers.c_doc_serializers import CollectedDocTeamListSerializer, CollectedDocTeamDetailSerializer, \
    CollectedDocTeamActionSerializer
from doc_api.settings.conf import CollectedDocPermissions, CollectedDocMembersPermissions
from doc_api.filters.c_doc_filters import CollectedDocOrderingFilter, CollectedDocParameterFilter
from django.db.models import Q
from doc_api.utils.report_helpers import ReportMD
from django.conf import settings
from doc_api.settings.conf import CreateAction, UpdateAction, DeleteAction, RecoverAction
from doc_api.utils.action_log_helpers import action_log


class CollectedDocViewSet(viewsets.ModelViewSet):
    """
    文集管理
    """
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
        action_log(request=request, user=request.user, action_type=CreateAction, old_instance=None,
                   instance=instance, action_info=f'新增文集:{instance.__str__()}')
        result = {'success': True, 'messages': f'新增文集:{instance.__str__()}',
                  'results': serializer.data}
        return Response(result, status=status.HTTP_200_OK, headers=headers)

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        result = {'success': True, 'messages': f'获取文集信息:{instance.__str__()}',
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
                   instance=instance, action_info=f'修改文集:{instance.__str__()}')
        result = {'success': True, 'messages': f'修改文集:{instance.__str__()}',
                  'results': serializer.data}
        return Response(result, status=status.HTTP_200_OK)

    def partial_update(self, request, *args, **kwargs):
        kwargs['partial'] = True
        return self.update(request, *args, **kwargs)

    def list(self, request, *args, **kwargs):
        query_params = self.request.query_params
        not_page = query_params.get('not_page', False)
        personal = query_params.get('personal', '')  # 个人中心需由此字段获取仅仅个人的数据
        cooperate = query_params.get('cooperate', '')  # 协作文集, 即非本人新增，但为成员的文集
        options = query_params.get('options', '')  # 作为新建文档时的选项返回
        queryset = self.filter_queryset(self.get_queryset())
        if personal.lower() == 'true':
            queryset = queryset.filter(creator=request.user)
        if cooperate.lower() == 'true':
            queryset = queryset.exclude(creator=request.user).\
                filter(Q(users__user=request.user) | Q(teams__team_group__members=request.user))
        if options.lower() == 'true':
            queryset = queryset.filter(Q(users__user=request.user) |
                                       Q(teams__team_group__members=request.user) |
                                       Q(creator=request.user))
        queryset = queryset.distinct()
        if not_page and not_page.lower() != 'false':
            serializer = self.get_serializer(queryset, many=True)
            result = {'success': True, 'messages': '获取文集不分页数据',
                      'results': serializer.data}
            return Response(result, status=status.HTTP_200_OK)
        else:
            page = self.paginate_queryset(queryset)
            if page is not None:
                serializer = self.get_serializer(page, many=True)
                return self.get_paginated_response(serializer.data)
            serializer = self.get_serializer(queryset, many=True)
            result = {'success': True, 'messages': '获取文集不分页数据',
                      'results': serializer.data}
            return Response(result, status=status.HTTP_200_OK)

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        self.perform_destroy(instance)
        action_log(request=request, user=request.user, action_type=DeleteAction, old_instance=None,
                   instance=instance, action_info=f'删除文集:{instance.__str__()}')
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
        action_log(request=request, user=request.user, action_type=DeleteAction, old_instance=None,
                   instance=None, action_info=f'批量删除文集:{deleted_objects_names}')
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

    @action(methods=['GET', 'POST'], detail=True)
    def export_set(self, request, *args, **kwargs):
        # 导出设置
        instance = self.get_object()
        c_doc_set = CollectedDocSetting.objects.filter(c_doc=instance).first()
        if request.method == 'GET':
            export_set = []
            if c_doc_set:
                if c_doc_set.allow_epub: export_set.append('allow_epub')
                if c_doc_set.allow_pdf: export_set.append('allow_pdf')
                if c_doc_set.allow_doc: export_set.append('allow_doc')
                if c_doc_set.allow_markdown: export_set.append('allow_markdown')
            results = {'id': instance.id, 'name': instance.name, 'intro': instance.intro,
                       'export_set': export_set}
            result = {'success': True, 'messages': f'获取文集设置:', 'results':results}
            return Response(result, status=status.HTTP_200_OK)
        if request.method == 'POST':
            if c_doc_set:
                CollectedDocSetting.objects.filter(c_doc=instance).update(**request.data)
            else:
                CollectedDocSetting.objects.create(c_doc=instance, **request.data)
            result = {'success': True, 'messages': f'修改文集设置:'}
            return Response(result, status=status.HTTP_200_OK)

    @action(methods=['POST'], detail=True)
    def export_file(self, request, *args, **kwargs):
        instance = self.get_object()
        doc_status = request.data.get('status', '')
        export_type = request.data.get('export_type', 'md')
        doc_status = [int(d_status) for d_status in doc_status.split(',')]
        report_md = ReportMD(c_doc_id=instance.id, status=doc_status)
        report_file = report_md.work()
        report_file = report_file.replace(settings.MEDIA_ROOT, '')
        result = {'success': True, 'messages': f'导出文集:{instance.__str__()}', 'results': f'media{report_file}'}
        return Response(result, status=status.HTTP_200_OK)

    @action(methods=['POST'], detail=True)
    def transfer(self, request, *args, **kwargs):
        instance = self.get_object()
        transfer_user_id = request.data.get('transfer_user', None)
        password = request.data.get('password', None)
        if request.user.check_password(password):
            transfer_user = User.objects.get(pk=int(transfer_user_id))
            instance.creator = transfer_user
            instance.save()
            result = {'success': True, 'messages': f'转让当前文集给:{transfer_user.nickname}'}
            return Response(result, status=status.HTTP_200_OK)
        else:
            result = {'success': False, 'messages': f'当前密码不正确, 无法转让'}
            return Response(result, status=status.HTTP_400_BAD_REQUEST)

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
        c_doc_user = CollectedDocUser.objects.filter(c_doc__id=int(c_doc_id), user__id=int(user_id)).first()
        if c_doc_user:
            result = {'success': False, 'messages': f'文集用户成员:{c_doc_user.__str__()}已经存在, 请勿重复创建'}
            return Response(result, status=status.HTTP_400_BAD_REQUEST)
        self.perform_create(serializer)
        headers = self.get_success_headers(serializer.data)
        instance = CollectedDocUser.objects.get(pk=int(serializer.data['id']))
        action_log(request=request, user=request.user, action_type=CreateAction, old_instance=None,
                   instance=instance, action_info=f'新增文集用户成员:{instance.__str__()}')
        result = {'success': True, 'messages': f'新增文集用户成员:{instance.__str__()}',
                  'results': serializer.data}
        return Response(result, status=status.HTTP_200_OK, headers=headers)

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        result = {'success': True, 'messages': f'获取文集用户成员信息:{instance.__str__()}',
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
                   instance=instance, action_info=f'修改文集用户成员:{instance.__str__()}')
        result = {'success': True, 'messages': f'修改文集用户成员:{instance.__str__()}',
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
            result = {'success': True, 'messages': '获取文集用户成员不分页数据',
                      'results': serializer.data}
            return Response(result, status=status.HTTP_200_OK)
        else:
            page = self.paginate_queryset(queryset)
            if page is not None:
                serializer = self.get_serializer(page, many=True)
                return self.get_paginated_response(serializer.data)
            serializer = self.get_serializer(queryset, many=True)
            result = {'success': True, 'messages': '获取文集用户成员不分页数据',
                      'results': serializer.data}
            return Response(result, status=status.HTTP_200_OK)

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        self.perform_destroy(instance)
        action_log(request=request, user=request.user, action_type=DeleteAction, old_instance=None,
                   instance=instance, action_info=f'删除文集用户成员:{instance.__str__()}')
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
        action_log(request=request, user=request.user, action_type=DeleteAction, old_instance=None,
                   instance=None, action_info=f'批量删除文集用户成员:{deleted_objects_names}')
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
        c_doc_id = request.data.get('c_doc', False)
        team_group_id = request.data.get('team_group', False)
        c_doc_team = CollectedDocTeam.objects.filter(c_doc__id=int(c_doc_id), team_group__id=int(team_group_id)).first()
        if c_doc_team:
            result = {'success': False, 'messages': f'文集团队成员:{c_doc_team.__str__()}已经存在, 请勿重复创建'}
            return Response(result, status=status.HTTP_400_BAD_REQUEST)
        self.perform_create(serializer)
        headers = self.get_success_headers(serializer.data)
        instance = CollectedDocTeam.objects.get(pk=int(serializer.data['id']))
        action_log(request=request, user=request.user, action_type=CreateAction, old_instance=None,
                   instance=instance, action_info=f'新增文集团队成员:{instance.__str__()}')
        result = {'success': True, 'messages': f'新增文集团队成员:{instance.__str__()}',
                  'results': serializer.data}
        return Response(result, status=status.HTTP_200_OK, headers=headers)

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        result = {'success': True, 'messages': f'获取文集用户团队信息:{instance.__str__()}',
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
                   instance=instance, action_info=f'修改文集团队成员:{instance.__str__()}')
        result = {'success': True, 'messages': f'修改文集团队成员:{instance.__str__()}',
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
            result = {'success': True, 'messages': '获取文集团队成员不分页数据',
                      'results': serializer.data}
            return Response(result, status=status.HTTP_200_OK)
        else:
            page = self.paginate_queryset(queryset)
            if page is not None:
                serializer = self.get_serializer(page, many=True)
                return self.get_paginated_response(serializer.data)
            serializer = self.get_serializer(queryset, many=True)
            result = {'success': True, 'messages': '获取文集团队成员不分页数据',
                      'results': serializer.data}
            return Response(result, status=status.HTTP_200_OK)

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        self.perform_destroy(instance)
        action_log(request=request, user=request.user, action_type=DeleteAction, old_instance=None,
                   instance=instance, action_info=f'删除文集团队成员:{instance.__str__()}')
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
        action_log(request=request, user=request.user, action_type=DeleteAction, old_instance=None,
                   instance=None, action_info=f'批量删除文集团队成员:{deleted_objects_names}')
        result = {'success': True, 'messages': f'批量删除文集团队成员:{deleted_objects_names}'}
        return Response(result, status=status.HTTP_200_OK)

    def get_serializer_class(self):
        if self.action == 'list':
            return CollectedDocTeamListSerializer
        elif self.action == 'retrieve':
            return CollectedDocTeamDetailSerializer
        return CollectedDocTeamActionSerializer
