from django.db import models
from doc_api.settings.conf import FileSource, FileType
from doc_api.utils.base_helpers import dict_for_model_choices


class FileGroup(models.Model):
    name = models.CharField(max_length=255, verbose_name='分组名称')
    # 10表示附件, 20表示图片
    group_type = models.IntegerField(default=10, choices=dict_for_model_choices(FileType), verbose_name="分组类型")
    creator = models.ForeignKey('User', null=True, blank=True, on_delete=models.SET_NULL, verbose_name='创建者',
                                related_name='created_file_groups')
    created_time = models.DateTimeField(auto_now_add=True, verbose_name='创建日期')
    modified_time = models.DateTimeField(auto_now=True, verbose_name='修改日期')

    class Meta:
        db_table = 'file_group'
        verbose_name = '素材分组'
        verbose_name_plural = verbose_name

    def __str__(self):
        return self.name


class FileAttachment(models.Model):
    group = models.ForeignKey('FileGroup', null=True, blank=True, on_delete=models.SET_NULL, verbose_name='素材分组',
                              related_name='files')
    file_name = models.CharField(max_length=250, verbose_name='素材名称')
    file_path = models.CharField(max_length=250, verbose_name='素材路径')
    file_size = models.CharField(max_length=250, null=True, blank=True, verbose_name='素材大小')
    # 10表示上传  20表示离线下载  30表示系统生成
    file_source = models.IntegerField(default=10, choices=dict_for_model_choices(FileSource), verbose_name="素材来源")
    # 离线下载时记录链接
    download_url = models.CharField(max_length=250, null=True, blank=True, verbose_name='素材链接')
    # 10表示附件, 20表示图片
    file_type = models.IntegerField(default=10, choices=dict_for_model_choices(FileType), verbose_name="素材类型")
    creator = models.ForeignKey('User', null=True, blank=True, on_delete=models.SET_NULL, verbose_name='创建者',
                                related_name='created_file_attachments')
    created_time = models.DateTimeField(auto_now_add=True, verbose_name='创建日期')
    modified_time = models.DateTimeField(auto_now=True, verbose_name='修改日期')

    class Meta:
        db_table = 'file_attachment'
        verbose_name = '文件素材'
        verbose_name_plural = verbose_name

    def __str__(self):
        return self.file_name