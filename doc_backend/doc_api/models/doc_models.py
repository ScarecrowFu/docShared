from django.db import models
from doc_api.settings.conf import DocStatus
from doc_api.utils.base_helpers import dict_for_model_choices


class DocTag(models.Model):
    name = models.CharField(max_length=255, verbose_name='标签名称')
    creator = models.ForeignKey('User', null=True, blank=True, on_delete=models.SET_NULL, verbose_name='创建者',
                                related_name='created_doc_tags')
    created_time = models.DateTimeField(auto_now_add=True, verbose_name='创建日期')
    modified_time = models.DateTimeField(auto_now=True, verbose_name='修改日期')

    class Meta:
        db_table = 'doc_tag'
        verbose_name = '文档标签'
        verbose_name_plural = verbose_name

    def __str__(self):
        return self.name


class Doc(models.Model):
    c_doc = models.ForeignKey('CollectedDoc', null=True, blank=True,  on_delete=models.SET_NULL,
                              verbose_name='所属文集', related_name='docs')
    # 记录所属上级文档，支持文档树结构
    parent_doc = models.ForeignKey('Doc', null=True, blank=True,  on_delete=models.SET_NULL,
                                   verbose_name='上级文档', related_name='child_docs')
    title = models.CharField(max_length=255, verbose_name='文档标题')
    # 记录修改时上一次的文档内容
    pre_content = models.TextField(default='', null=True, blank=True, verbose_name='编辑内容')
    content = models.TextField(default='', null=True, blank=True, verbose_name='文档内容')
    # 文档排序值，默认99
    sort = models.IntegerField(default=99, verbose_name='排序值')
    tags = models.ManyToManyField('DocTag', blank=True, verbose_name='标签')
    creator = models.ForeignKey('User', null=True, blank=True, on_delete=models.SET_NULL, verbose_name='创建者',
                                related_name='created_docs')
    created_time = models.DateTimeField(auto_now_add=True, verbose_name='创建日期')
    modified_time = models.DateTimeField(auto_now=True, verbose_name='修改日期')
    # 10表示草稿状态，20表示发布状态，30表示删除状态
    status = models.IntegerField(default=10, choices=dict_for_model_choices(DocStatus), verbose_name='文档状态')
    is_deleted = models.BooleanField(default=False, verbose_name='已删除')

    class Meta:
        db_table = 'doc'
        verbose_name = '文档'
        verbose_name_plural = verbose_name

    def __str__(self):
        return self.title


class DocHistory(models.Model):
    doc = models.ForeignKey('Doc', null=True, blank=True,  on_delete=models.SET_NULL,
                            verbose_name='所属文档', related_name='histories')
    content = models.TextField(default='', null=True, blank=True, verbose_name='文档内容')
    creator = models.ForeignKey('User', null=True, blank=True, on_delete=models.SET_NULL, verbose_name='创建者',
                                related_name='created_doc_histories')
    created_time = models.DateTimeField(auto_now_add=True, verbose_name='创建日期')
    modified_time = models.DateTimeField(auto_now=True, verbose_name='修改日期')

    class Meta:
        db_table = 'doc_history'
        verbose_name = '文档历史'
        verbose_name_plural = verbose_name

    def __str__(self):
        return self.doc.title


class DocTemplate(models.Model):
    name = models.CharField(max_length=255, verbose_name='模板名称')
    content = models.TextField(default='', null=True, blank=True, verbose_name='模板内容')
    creator = models.ForeignKey('User', null=True, blank=True, on_delete=models.SET_NULL, verbose_name='创建者',
                                related_name='created_doc_templates')
    created_time = models.DateTimeField(auto_now_add=True, verbose_name='创建日期')
    modified_time = models.DateTimeField(auto_now=True, verbose_name='修改日期')

    class Meta:
        db_table = 'doc_template'
        verbose_name = '文档模板'
        verbose_name_plural = verbose_name

    def __str__(self):
        return self.name
