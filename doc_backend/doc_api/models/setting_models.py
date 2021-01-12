from django.db import models
from doc_api.settings.conf import SettingType, VerificationType
from doc_api.utils.base_helpers import dict_for_model_choices
import random


class SystemSetting(models.Model):
    key = models.CharField(max_length=255, unique=True, verbose_name='key')
    name = models.CharField(max_length=255, verbose_name='名称')
    value = models.CharField(max_length=255, verbose_name='内容')
    set_type = models.IntegerField(default=10, choices=dict_for_model_choices(SettingType), verbose_name='类型')
    description = models.TextField(blank=True, verbose_name="描述")
    creator = models.ForeignKey('User', null=True, blank=True, on_delete=models.SET_NULL, verbose_name='创建者',
                                related_name='created_settings')
    created_time = models.DateTimeField(auto_now_add=True, verbose_name='创建日期')
    modified_time = models.DateTimeField(auto_now=True, verbose_name='修改日期')

    class Meta:
        db_table = 'system_setting'
        verbose_name = '系统设置'
        verbose_name_plural = verbose_name

    def __str__(self):
        return f'{self.key}-{self.name}-{self.value}'


class EmailVerificationCode(models.Model):
    email_name = models.EmailField(verbose_name='电子邮箱')
    # 10为注册, 20为忘记密码
    verification_type = models.IntegerField(default=10, choices=dict_for_model_choices(VerificationType),
                                            verbose_name='验证码类型')
    verification_code = models.CharField(max_length=10, verbose_name='验证码')
    expired_time = models.DateTimeField(verbose_name='过期时间')
    # 状态：0表示不可用，10表示有效，默认为10
    status = models.IntegerField(default=10, verbose_name='验证码状态')
    creator = models.ForeignKey('User', null=True, blank=True, on_delete=models.SET_NULL, verbose_name='创建者',
                                related_name='created_email_codes')
    created_time = models.DateTimeField(auto_now_add=True, verbose_name='创建日期')
    modified_time = models.DateTimeField(auto_now=True, verbose_name='修改日期')

    def __str__(self):
        return '{}:{}'.format(self.verification_type, self.email_name)

    def save(self, *args, **kwargs):
        if not self.id:
            code_str = '0123456789qwertyuiopasdfghjklzxcvbnmQWERTYUIOPASDFGHJKLZXCVBNM'
            random_code = ''.join(random.sample(code_str, k=10))
            random_code_used = EmailVerificationCode.objects.filter(verification_code=random_code).count()
            if random_code_used > 0:  # 已存在此注册码，继续生成一个注册码
                is_code = False
                while is_code is False:
                    random_code = ''.join(random.sample(code_str, k=10))
                    random_code_used = EmailVerificationCode.objects.filter(verification_code=random_code).count()
                    if random_code_used > 0:  # 已存在此注册码，继续生成一个注册码
                        is_code = False
                    else:  # 数据库中不存在此注册码，跳出循环
                        is_code = True
            self.verification_code = random_code
        super(EmailVerificationCode, self).save(*args, **kwargs)

    class Meta:
        db_table = 'email_verification_code'
        verbose_name = '电子邮件验证码'
        verbose_name_plural = verbose_name


class RegisterCode(models.Model):
    code = models.CharField(max_length=10, unique=True, null=True, blank=True, verbose_name='注册邀请码')
    # 注册码的有效注册数量，表示注册码最多能够被使用多少次，默认为1
    all_cnt = models.IntegerField(default=1, verbose_name='有效注册数量')
    # 注册码的已使用数量，其值小于等于有效注册数量，默认为0
    used_cnt = models.IntegerField(default=0, verbose_name='已使用数量')
    # 注册码状态：0表示不可用，10表示有效，默认为10
    status = models.IntegerField(default=10, verbose_name='注册码状态')
    creator = models.ForeignKey('User', null=True, blank=True, on_delete=models.SET_NULL, verbose_name='创建者',
                                related_name='created_register_codes')
    created_time = models.DateTimeField(auto_now_add=True, verbose_name='创建日期')
    modified_time = models.DateTimeField(auto_now=True, verbose_name='修改日期')

    def save(self, *args, **kwargs):
        if not self.id:
            code_str = '0123456789qwertyuiopasdfghjklzxcvbnmQWERTYUIOPASDFGHJKLZXCVBNM'
            random_code = ''.join(random.sample(code_str, k=10))
            random_code_used = RegisterCode.objects.filter(code=random_code).count()
            if random_code_used > 0:  # 已存在此注册码，继续生成一个注册码
                is_code = False
                while is_code is False:
                    random_code = ''.join(random.sample(code_str, k=10))
                    random_code_used = RegisterCode.objects.filter(code=random_code).count()
                    if random_code_used > 0:  # 已存在此注册码，继续生成一个注册码
                        is_code = False
                    else:  # 数据库中不存在此注册码，跳出循环
                        is_code = True
            self.code = random_code
        super(RegisterCode, self).save(*args, **kwargs)

    def __str__(self):
        return self.code

    class Meta:
        db_table = 'register_code'
        verbose_name = '注册邀请码'
        verbose_name_plural = verbose_name


class Announcement(models.Model):
    title = models.CharField(max_length=255, verbose_name='公告标题')
    content = models.TextField(null=True, blank=True, verbose_name='公告内容')
    link = models.URLField(null=True, blank=True, verbose_name='跳转链接')
    is_publish = models.BooleanField(default=False, verbose_name='是否发布')
    creator = models.ForeignKey('User', null=True, blank=True, on_delete=models.SET_NULL, verbose_name='创建者',
                                related_name='created_announcements')
    created_time = models.DateTimeField(auto_now_add=True, verbose_name='创建日期')
    modified_time = models.DateTimeField(auto_now=True, verbose_name='修改日期')

    class Meta:
        db_table = 'announcement'
        verbose_name = '公告管理'
        verbose_name_plural = '公告管理'

    def __str__(self):
        return self.title



