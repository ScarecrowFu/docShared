from django.db import models
from doc_api.settings.conf import CollectedDocMembersPermissions, CollectedDocPermissions
from doc_api.utils.base_helpers import dict_for_model_choices
from django.db.models.signals import post_save
from django.dispatch import receiver


class CollectedDoc(models.Model):
    name = models.CharField(max_length=255, verbose_name='文集名称')
    intro = models.CharField(max_length=255, null=True, blank=True, verbose_name='文集简介')
    # 10表示公开, 20表示访问码可见, 30表示成员可见, 40表示私密，默认公开
    perm = models.IntegerField(default=10, choices=dict_for_model_choices(CollectedDocPermissions),
                               verbose_name='文集权限值')
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


class CollectedDocUser(models.Model):
    c_doc = models.ForeignKey('CollectedDoc', models.CASCADE, verbose_name='所属文集', related_name='users')
    user = models.ForeignKey('User', null=True, blank=True, on_delete=models.SET_NULL, verbose_name='成員',
                             related_name='c_doc_users')
    # 10表示普通成员(新建/修改/删除个人文档)
    # 20表示高级成员(新建/修改文集内所有文档+删除个人文档)
    # 30表示文集管理员(新建/修改/删除文集文档+修改文集信息)
    perm = models.IntegerField(default=10, choices=dict_for_model_choices(CollectedDocMembersPermissions),
                               verbose_name='成员协作权限')
    creator = models.ForeignKey('User', null=True, blank=True, on_delete=models.SET_NULL, verbose_name='创建者',
                                related_name='created_c_docs_users')
    created_time = models.DateTimeField(auto_now_add=True, verbose_name='创建日期')
    modified_time = models.DateTimeField(auto_now=True, verbose_name='修改日期')

    class Meta:
        db_table = 'collected_doc_user'
        verbose_name = '文集成员(用户)权限'
        verbose_name_plural = verbose_name

    def __str__(self):
        return f'{self.c_doc.name}-{self.user.nickname}-{CollectedDocMembersPermissions[self.perm]}'


class CollectedDocTeam(models.Model):
    c_doc = models.ForeignKey('CollectedDoc', models.CASCADE, verbose_name='所属文集', related_name='teams')
    team_group = models.ForeignKey('TeamGroup', null=True, blank=True, on_delete=models.SET_NULL, verbose_name='团队',
                                   related_name='c_doc_teams')
    creator = models.ForeignKey('User', null=True, blank=True, on_delete=models.SET_NULL, verbose_name='创建者',
                                related_name='created_c_docs_teams')
    created_time = models.DateTimeField(auto_now_add=True, verbose_name='创建日期')
    modified_time = models.DateTimeField(auto_now=True, verbose_name='修改日期')

    class Meta:
        db_table = 'collected_doc_team'
        verbose_name = '文集成员(团队)'
        verbose_name_plural = verbose_name

    def __str__(self):
        return f'{self.c_doc.name}-{self.team_group.name}'


class CollectedDocTeamUser(models.Model):
    c_doc_team = models.ForeignKey('CollectedDocTeam', models.CASCADE, verbose_name='所属文件团队成员',
                                   related_name='c_doc_team_users')
    user = models.ForeignKey('User', null=True, blank=True, on_delete=models.SET_NULL, verbose_name='成員',
                             related_name='c_doc_team_users_perms')
    # 10表示普通成员(新建/修改/删除个人文档)
    # 20表示高级成员(新建/修改文集内所有文档+删除个人文档)
    # 30表示文集管理员(新建/修改/删除文集文档+修改文集信息)
    perm = models.IntegerField(default=10, choices=dict_for_model_choices(CollectedDocMembersPermissions),
                               verbose_name='成员协作权限')
    creator = models.ForeignKey('User', null=True, blank=True, on_delete=models.SET_NULL, verbose_name='创建者',
                                related_name='created_c_docs_team_users')
    created_time = models.DateTimeField(auto_now_add=True, verbose_name='创建日期')
    modified_time = models.DateTimeField(auto_now=True, verbose_name='修改日期')

    class Meta:
        db_table = 'collected_doc_team_user'
        verbose_name = '文集成员(团队)权限'
        verbose_name_plural = verbose_name

    def __str__(self):
        return f'{self.c_doc_team.__str__()}-{self.user.nickname}-{CollectedDocMembersPermissions[self.perm]}'


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


@receiver(post_save, sender=CollectedDoc)
def create_setting(sender, instance, created, **kwargs):
    if created:
        CollectedDocSetting.objects.create(c_doc=instance)

