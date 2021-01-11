from django.core.mail import EmailMessage
from email.header import make_header
from django.conf import settings
import os
from doc_api.models import SystemSetting
from doc_api.utils.app_log_helpers import api_logger


def get_email_setting():
    email_is_ssl = SystemSetting.objects.filter(key='email_is_ssl').first()
    email_host = SystemSetting.objects.filter(key='email_host').first()
    email_port = SystemSetting.objects.filter(key='email_port').first()
    email_host_user = SystemSetting.objects.filter(key='email_host_user').first()
    email_host_password = SystemSetting.objects.filter(key='email_host_password').first()
    email_from_title = SystemSetting.objects.filter(key='email_from_title').first()
    if not email_host or not email_port or not email_host_user or not email_host_password:
        return None
    email_is_ssl = True if email_is_ssl.value.lower() == 'true' else False
    email_host, email_port, email_host_user, email_host_password, email_from_title = \
        email_host.value,  email_port.value, email_host_user.value, email_host_password.value, email_from_title.value
    return {'email_is_ssl': email_is_ssl, 'email_host': email_host, 'email_port': email_port,
            'email_host_user': email_host_user, 'email_host_password': email_host_password,
            'email_from_title': email_from_title}


class SendHtmlEmail(object):
    """send html email"""
    def __init__(self, subject, html_content, to_list, fail_silently=False, attachment=None, cc=None):
        self.subject = subject  # 主题
        self.html_content = html_content
        if not isinstance(to_list, list):
            to_list = [to_list, ]
        self.to_list = to_list
        self.attachment = attachment
        self.fail_silently = fail_silently  # 默认发送异常不报错
        self.cc = cc

        email_setting = get_email_setting()
        if not email_setting:
            raise Exception(f'邮件对象初始化失败, 邮箱服务未配置!')
        print(email_setting)
        settings.EMAIL_USE_SSL = email_setting['email_is_ssl']
        settings.EMAIL_HOST = email_setting['email_host']
        settings.EMAIL_PORT = int(email_setting['email_port'])
        settings.EMAIL_HOST_USER = email_setting['email_host_user']
        settings.EMAIL_HOST_PASSWORD = email_setting['email_host_password']
        settings.DEFAULT_FROM_EMAIL = email_setting['email_host_user']

    def run(self):
        msg = EmailMessage(self.subject, self.html_content, to=self.to_list, cc=self.cc)
        msg.content_subtype = "html"  # Main content is now text/html
        if self.attachment:
            # 解决附件名称乱码: https://www.bbsmax.com/A/gVdnEoZ75W/
            for attachment in self.attachment:
                file_name = os.path.basename(attachment)
                msg.attach(make_header([(file_name, 'utf-8')]).encode('utf-8'), open(attachment, 'rb').read())
        msg.send(self.fail_silently)


def send_email(subject, html_content, to_list, fail_silently=False, attachment=None, cc=None):
    email_helper = SendHtmlEmail(subject, html_content, to_list, fail_silently, attachment, cc)
    email_helper.run()
