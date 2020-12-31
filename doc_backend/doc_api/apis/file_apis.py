from rest_framework import viewsets, mixins, filters, status
from rest_framework import permissions
from rest_framework.response import Response
from rest_framework.decorators import action
from doc_api.models import FileGroup, FileAttachment
from doc_api.filters.file_filters import FileGroupParameterFilter, FileAttachmentParameterFilter
from doc_api.serializers.file_serializers import FileGroupActionSerializer, FileGroupDetailSerializer, \
    FileGroupListSerializer
from doc_api.serializers.file_serializers import FileAttachmentActionSerializer, FileAttachmentDetailSerializer, \
    FileAttachmentListSerializer
from django.core.files.storage import default_storage
from django.conf import settings
from django.core.files.base import ContentFile
import os
import shutil
from doc_api.utils.base_helpers import check_md5_sum, create_or_get_directory
from doc_api.settings.conf import FileType
import time
from doc_api.settings.conf import CreateAction, UpdateAction, DeleteAction, UploadAction
from doc_api.utils.action_log_helpers import action_log


class FileGroupViewSet(viewsets.ModelViewSet):
    """素材分组管理"""
    filter_backends = (filters.OrderingFilter, filters.SearchFilter, FileGroupParameterFilter)
    search_fields = ('name',)
    ordering_fields = ('name', 'group_type', 'creator', 'created_time')
    filterset_fields = ('group_type', 'creator', 'created_time')
    queryset = FileGroup.objects.order_by('-id').all()
    permission_classes = (permissions.IsAuthenticated, )

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        headers = self.get_success_headers(serializer.data)
        instance = FileGroup.objects.get(pk=int(serializer.data['id']))
        action_log(request=request, user=request.user, action_type=CreateAction, old_instance=None,
                   instance=instance, action_info=f'新增素材分组:{instance.__str__()}')
        result = {'success': True, 'messages': f'新增素材分组:{instance.__str__()}',
                  'results': serializer.data}
        return Response(result, status=status.HTTP_200_OK, headers=headers)

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        result = {'success': True, 'messages': f'获取素材分组信息:{instance.__str__()}',
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
                   instance=instance, action_info=f'修改素材分组:{instance.__str__()}')
        result = {'success': True, 'messages': f'修改素材分组:{instance.__str__()}',
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
        if personal.lower() == 'true':
            queryset = queryset.filter(creator=request.user)
        if not_page and not_page.lower() != 'false':
            serializer = self.get_serializer(queryset, many=True)
            result = {'success': True, 'messages': '获取素材分组不分页数据',
                      'results': serializer.data}
            return Response(result, status=status.HTTP_200_OK)
        else:
            page = self.paginate_queryset(queryset)
            if page is not None:
                serializer = self.get_serializer(page, many=True)
                return self.get_paginated_response(serializer.data)
            serializer = self.get_serializer(queryset, many=True)
            result = {'success': True, 'messages': '获取素材分组不分页数据',
                      'results': serializer.data}
            return Response(result, status=status.HTTP_200_OK)

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        self.perform_destroy(instance)
        action_log(request=request, user=request.user, action_type=DeleteAction, old_instance=None,
                   instance=instance, action_info=f'删除素材分组:{instance.__str__()}')
        result = {'success': True, 'messages': f'删除素材分组:{instance.__str__()}'}
        return Response(result, status=status.HTTP_200_OK)

    @action(methods=['POST', 'DELETE'], detail=False)
    def bulk_delete(self, request, *args, **kwargs):
        # 批量删除
        deleted_objects_ids = request.data.get('deleted_objects', [])
        queryset = self.get_queryset()
        deleted_objects_names = []
        for deleted_object_id in deleted_objects_ids:
            instance = FileGroup.objects.get(pk=int(deleted_object_id))
            deleted_objects_names.append(instance.__str__())
        deleted_objects = queryset.filter(id__in=deleted_objects_ids).all()
        deleted_objects.delete()
        action_log(request=request, user=request.user, action_type=DeleteAction, old_instance=None,
                   instance=None, action_info=f'批量删除素材分组:{deleted_objects_names}')
        result = {'success': True, 'messages': f'批量删除素材分组:{deleted_objects_names}'}
        return Response(result, status=status.HTTP_200_OK)

    def get_serializer_class(self):
        if self.action == 'list':
            return FileGroupListSerializer
        elif self.action == 'retrieve':
            return FileGroupDetailSerializer
        return FileGroupActionSerializer


class FileAttachmentViewSet(viewsets.ModelViewSet):
    """素材管理"""
    filter_backends = (filters.OrderingFilter, filters.SearchFilter, FileAttachmentParameterFilter)
    search_fields = ('file_name',)
    ordering_fields = ('group', 'file_name', 'file_path', 'file_source', 'file_url', 'file_type', 'creator', 'created_time')
    filterset_fields = ('group', 'file_type', 'creator', 'created_time')
    queryset = FileAttachment.objects.order_by('-id').all()
    permission_classes = (permissions.IsAuthenticated, )

    def create(self, request, *args, **kwargs):
        """
        简化版大文件上传接口, 同时可处理大文件上传, 但不支持断点续传
        """
        chunk_file = request.data.get('chunk_file', None)  # 分块文件
        chunk_md5 = request.data.get('chunk_md5', None)  # 分块文件MD5
        chunk_index = request.data.get('chunk_index', None)  # 分块文件顺序
        chunks_num = request.data.get('chunks_num', None)  # 完整文件分块数目,用于确定当前分块是否已经全部上传完毕
        file_name = request.data.get('file_name', None)  # 完整文件的文件名称,用于所有分块上传完毕后合并的名称
        file_md5 = request.data.get('file_md5', None)  # 完整文件的文件md5,用于确定文件合并后是否正确
        group_id = request.data.get('group', None)
        file_type = request.data.get('file_type', None)
        if not chunk_file or not chunk_index or not chunks_num or not file_name:
            result = {'success': False,
                      'messages': '上传失败, 缺少指定参数值: chunk_file/chunk_index/chunks_num/file_name'}
            return Response(result, status=status.HTTP_400_BAD_REQUEST)

        file_type_name = FileType.get(int(file_type), 'default')
        try:
            group = FileGroup.objects.get(pk=int(group_id))
            group_name = group.name
        except:
            group = None
            group_name = 'None'
        file_path = f'{file_type_name}/{request.user.username}/{group_name}'
        base_path = create_or_get_directory(f'{settings.MEDIA_ROOT}/{file_path}')
        base_chunk_path = create_or_get_directory(f'{base_path}/{file_name}-tmp')
        chunk_path = os.path.join(base_chunk_path, f'{file_name}.part{chunk_index}')
        # default_storage不会覆盖文件, 若文件存在, 删除后重新上传
        if default_storage.exists(chunk_path):
            default_storage.delete(chunk_path)
        # 保存
        default_storage.save(chunk_path, ContentFile(chunk_file.read()))
        # 验证分块MD5是否正确
        if chunk_md5:
            chunk_file_md5 = check_md5_sum(file_name=chunk_path)
            # 保存的分块文件内容不一致
            if chunk_file_md5 != chunk_md5:
                result = {'success': False, 'messages': '文件上传发生错误, md5值不一致',
                          'results': {'upload_md5': chunk_md5, 'save_md5': chunk_file_md5}}
                return Response(result, status=status.HTTP_400_BAD_REQUEST)
        if int(chunk_index) == int(chunks_num):
            uploaded = True
            save_file_path = os.path.join(base_path, file_name)
            # 文件已经存在, 添加时间戳
            if os.path.exists(save_file_path):
                save_file_path = os.path.join(base_path, f'{int(time.time())}-{file_name}')
            with open(save_file_path, 'wb') as uploaded_file:
                for index in range(int(chunks_num)):
                    chunk_file = os.path.join(base_chunk_path, f'{file_name}.part{index + 1}')
                    try:
                        chunk_file = open(chunk_file, 'rb')  # 按序打开每个分片
                        uploaded_file.write(chunk_file.read())  # 读取分片内容写入新文件
                        chunk_file.close()
                    except Exception as error:
                        print(f'合并文件:{file_name} form {base_chunk_path}失败:{error}')
                        uploaded = False
                        # 检查合并后的MD5
            uploaded_file_md5 = check_md5_sum(save_file_path)
            if uploaded_file_md5 != file_md5:
                uploaded = False
            if uploaded:
                attachment = FileAttachment.objects.create(group=group, file_name=file_name,
                                                           file_path=os.path.join(file_path, file_name),
                                                           file_size=os.path.getsize(save_file_path),
                                                           file_type=file_type, creator=request.user)
                shutil.rmtree(base_chunk_path)
                action_log(request=request, user=request.user, action_type=UploadAction, old_instance=None,
                           instance=attachment, action_info=f'上传素材:{attachment.__str__()}')
                serializer = self.get_serializer(attachment)
                results = serializer.data
                results['uploaded'] = True
                result = {'success': True, 'messages': f'新增素材:{attachment.__str__()}', 'results': results}
                return Response(result, status=status.HTTP_200_OK)
            else:
                result = {'success': False, 'messages': '合并文件失败, 请重新上传'}
                return Response(result, status=status.HTTP_400_BAD_REQUEST)
        else:
            result = {'success': True, 'messages': f'成功上传文件:{file_name}, 分块:{chunk_index}',
                      'results': {'uploaded': False, 'chunk_index': chunk_index, 'file_name': file_name, }
                      }
            return Response(result, status=status.HTTP_200_OK)

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        result = {'success': True, 'messages': f'获取素材信息:{instance.__str__()}',
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
                   instance=instance, action_info=f'修改素材:{instance.__str__()}')
        result = {'success': True, 'messages': f'修改素材:{instance.__str__()}',
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
        if personal.lower() == 'true':
            queryset = queryset.filter(creator=request.user)
        if not_page and not_page.lower() != 'false':
            serializer = self.get_serializer(queryset, many=True)
            result = {'success': True, 'messages': '获取素材不分页数据',
                      'results': serializer.data}
            return Response(result, status=status.HTTP_200_OK)
        else:
            page = self.paginate_queryset(queryset)
            if page is not None:
                serializer = self.get_serializer(page, many=True)
                return self.get_paginated_response(serializer.data)
            serializer = self.get_serializer(queryset, many=True)
            result = {'success': True, 'messages': '获取素材不分页数据',
                      'results': serializer.data}
            return Response(result, status=status.HTTP_200_OK)

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        file_path = instance.file_path
        file_save_path = os.path.join(settings.MEDIA_ROOT, file_path)
        try:
            os.remove(file_save_path)
        except:
            pass
        self.perform_destroy(instance)
        action_log(request=request, user=request.user, action_type=DeleteAction, old_instance=None,
                   instance=instance, action_info=f'删除素材:{instance.__str__()}')
        result = {'success': True, 'messages': f'删除素材:{instance.__str__()}'}
        return Response(result, status=status.HTTP_200_OK)

    @action(methods=['POST', 'DELETE'], detail=False)
    def bulk_delete(self, request, *args, **kwargs):
        # 批量删除
        deleted_objects_ids = request.data.get('deleted_objects', [])
        queryset = self.get_queryset()
        deleted_objects_names = []
        for deleted_object_id in deleted_objects_ids:
            instance = FileAttachment.objects.get(pk=int(deleted_object_id))
            file_path = instance.file_path
            file_save_path = os.path.join(settings.MEDIA_ROOT, file_path)
            try:
                os.remove(file_save_path)
            except:
                pass
            self.perform_destroy(instance)
            deleted_objects_names.append(instance.__str__())
        deleted_objects = queryset.filter(id__in=deleted_objects_ids).all()
        deleted_objects.delete()
        action_log(request=request, user=request.user, action_type=DeleteAction, old_instance=None,
                   instance=None, action_info=f'批量删除素材:{deleted_objects_names}')
        result = {'success': True, 'messages': f'批量删除素材:{deleted_objects_names}'}
        return Response(result, status=status.HTTP_200_OK)

    def get_serializer_class(self):
        if self.action == 'list':
            return FileAttachmentListSerializer
        elif self.action == 'retrieve':
            return FileAttachmentDetailSerializer
        return FileAttachmentActionSerializer
