'''
用戶数据库模型
'''
from django.db import models
from django.contrib.auth.models import BaseUserManager, AbstractBaseUser, PermissionsMixin


# 上传文件目录
def upload_avatar_path(instance, filename):
    file_path = 'avatar/{username}/{filename}'.format(
        username=instance.username,
        filename=filename
    )
    return file_path


class UserManager(BaseUserManager):
    '''
    用户管理
    '''
    def create_user(self, username, password, **extra_fields):
        # username 是唯一标识，没有会报错
        if not username:
            raise ValueError('Users must have an username')

        user = self.model(
            username=username,
            **extra_fields
        )
        user.is_superuser = False
        user.set_password(password)  # 检测密码合理性
        user.save(using=self._db)  # 保存密码
        return user

    def create_superuser(self, username, password, **extra_fields):
        user = self.create_user(username=username,
                                password=password, **extra_fields)
        user.is_admin = True  # 比创建用户多的一个字段
        user.is_superuser = True
        user.save(using=self._db)
        return user


class User(AbstractBaseUser, PermissionsMixin):
    username = models.CharField(max_length=255, unique=True, db_index=True, verbose_name='帐号')
    nickname = models.CharField(max_length=255, verbose_name='昵称')
    email = models.EmailField(max_length=255, verbose_name='邮箱')
    avatar = models.ImageField(default='avatar/default_avatar.jpg', upload_to=upload_avatar_path,
                               blank=True, null=True, verbose_name='头像')
    phone = models.CharField(max_length=255, blank=True, null=True, verbose_name='手机号码')
    gender = models.CharField(max_length=10, default='男', null=True, blank=True, verbose_name='性别')
    age = models.CharField(max_length=10, null=True, blank=True, verbose_name='年龄')
    title = models.CharField(max_length=255, blank=True, null=True, verbose_name='岗位职称')
    address = models.CharField(max_length=255, null=True, blank=True, verbose_name='地址')
    intro = models.TextField(blank=True, null=True, verbose_name='简介')
    created_time = models.DateTimeField(auto_now_add=True, verbose_name='创建日期')
    modified_time = models.DateTimeField(auto_now=True, verbose_name='修改日期')
    is_deleted = models.BooleanField(default=False, verbose_name='是否已经删除')
    is_active = models.BooleanField(default=True, verbose_name='是否可用')
    is_admin = models.BooleanField(default=False, verbose_name='是否系统管理员')
    register_code = models.ForeignKey('RegisterCode', null=True, blank=True, on_delete=models.SET_NULL,
                                      verbose_name='使用的注册码')
    USERNAME_FIELD = 'username'  # 必须有一个唯一标识--USERNAME_FIELD
    EMAIL_FIELD = 'email'
    REQUIRED_FIELDS = ['email']

    def save(self, *args, **kwargs):
        if not self.nickname:
            self.nickname = self.username
        super(User, self).save(*args, **kwargs)

    def __str__(self):
        return f'{self.nickname}({self.username})'

    @property
    def is_staff(self):
        return self.is_admin

    class Meta:
        db_table = 'user'
        verbose_name = '用户'
        verbose_name_plural = verbose_name

    objects = UserManager()


class TeamGroup(models.Model):
    name = models.CharField(max_length=255, verbose_name='团队名称')
    members = models.ManyToManyField('User', blank=True, verbose_name='团队成员', related_name='team_groups')
    creator = models.ForeignKey('User', null=True, blank=True, on_delete=models.SET_NULL, verbose_name='创建者',
                                related_name='created_team_groups')
    created_time = models.DateTimeField(auto_now_add=True, verbose_name='创建日期')
    modified_time = models.DateTimeField(auto_now=True, verbose_name='修改日期')

    class Meta:
        db_table = 'team_group'
        verbose_name = '团队'
        verbose_name_plural = verbose_name

    def __str__(self):
        return self.name
