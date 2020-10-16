from django.db import models
from doc_api.settings.conf import CollectedDocMembersPermissions, CollectedDocPermissions
from doc_api.utils.base_helpers import dict_for_model_choices


class CollectedDoc(models.Model):
    name = models.CharField(max_length=255, verbose_name='文集名称')
    intro = models.CharField(max_length=255, null=True, blank=True, verbose_name='文集简介')
    # 10表示公开, 20表示私密, 30表示成员可见, 40表示访问码可见，默认公开
    perm = models.IntegerField(default=10, choices=dict_for_model_choices(CollectedDocPermissions),
                               verbose_name='文集权限值')
    # 当文集权限为10时，记录为空
    # 当文集权限为20时，记录为空
    # 当文集权限为30时，记录为文集成员数据库ID组成的字符串，逗号分割
    # 当文集权限为40时，记录为访问码
    perm_value = models.TextField(default='', null=True, blank=True, verbose_name='文集权限值')
    creator = models.ForeignKey('User', null=True, blank=True, on_delete=models.SET_NULL, verbose_name='创建者',
                                related_name='created_c_docs')
    created_time = models.DateTimeField(auto_now_add=True, verbose_name='创建日期')
    modified_time = models.DateTimeField(auto_now=True, verbose_name='修改日期')

    class Meta:
        db_table = 'collected_doc'
        verbose_name = '文集'
        verbose_name_plural = verbose_name

    def __str__(self):
        return self.name


class CollectedDocMember(models.Model):
    c_doc = models.ForeignKey('CollectedDoc', models.CASCADE, verbose_name='所属文集', related_name='members')
    member = models.ForeignKey('User', null=True, blank=True, on_delete=models.SET_NULL, verbose_name='成員',
                               related_name='c_doc_members')
    team_group = models.ForeignKey('TeamGroup', null=True, blank=True, on_delete=models.SET_NULL, verbose_name='团队',
                                   related_name='c_doc_teams')
    # 10表示普通成员(新建/修改/删除个人文档)
    # 20表示高级成员(新建/修改文集内所有文档+删除个人文档)
    # 30表示文集管理员(新建/修改/删除文集文档+修改文集信息)
    perm = models.IntegerField(default=10, choices=dict_for_model_choices(CollectedDocMembersPermissions),
                               verbose_name='成员协作权限')
    creator = models.ForeignKey('User', null=True, blank=True, on_delete=models.SET_NULL, verbose_name='创建者',
                                related_name='created_c_docs_members')
    created_time = models.DateTimeField(auto_now_add=True, verbose_name='创建日期')
    modified_time = models.DateTimeField(auto_now=True, verbose_name='修改日期')

    class Meta:
        db_table = 'collected_doc_member'
        verbose_name = '文集成员'
        verbose_name_plural = verbose_name

    def __str__(self):
        if self.member:
            return f'{self.c_doc.name}-{self.member.nickname}-{CollectedDocMembersPermissions[self.perm]}'
        if self.team_group:
            return f'{self.c_doc.name}-{self.team_group.name}-{CollectedDocMembersPermissions[self.perm]}'
        return f'{self.c_doc.name}-无成员-{CollectedDocMembersPermissions[self.perm]}'


class CollectedDocSetting(models.Model):
    c_doc = models.OneToOneField('CollectedDoc', models.CASCADE, verbose_name='所属文集', related_name='setting')
    allow_epub = models.BooleanField(default=False, verbose_name='允许导出EPUB')
    allow_pdf = models.BooleanField(default=False, verbose_name='允许导出PDF')
    allow_doc = models.BooleanField(default=False, verbose_name='允许导出Doc')
    allow_markdown = models.BooleanField(default=False, verbose_name='允许导出Markdown')

    class Meta:
        db_table = 'collected_doc_setting'
        verbose_name = '文集设置'
        verbose_name_plural = verbose_name

    def __str__(self):
        return self.c_doc.name