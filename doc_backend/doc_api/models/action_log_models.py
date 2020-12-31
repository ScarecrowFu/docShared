from django.conf import settings
from django.contrib.contenttypes.models import ContentType
from django.db import models
from django.db.models import QuerySet, Q
from django.utils.encoding import smart_text
from django.utils.translation import ugettext_lazy as _
from django.utils.functional import cached_property
from django.contrib.contenttypes.fields import GenericForeignKey
import json
from django.utils import timezone
from doc_api.settings.conf import ActionType
from doc_api.utils.base_helpers import dict_for_model_choices


class ActionLogManager(models.Manager):

    def get_for_model(self, model):
        if not issubclass(model, models.Model):
            return self.none()

        ct = ContentType.objects.get_for_model(model)

        return self.filter(content_type=ct)

    def get_for_objects(self, queryset):
        if not isinstance(queryset, QuerySet) or queryset.count() == 0:
            return self.none()

        content_type = ContentType.objects.get_for_model(queryset.model)
        primary_keys = queryset.values_list(queryset.model._meta.pk.name, flat=True)
        return self.filter(content_type=content_type).filter(Q(object_pk__in=primary_keys)).distinct()


class ActionLog(models.Model):

    content_type = models.ForeignKey(
        'contenttypes.ContentType', related_name='+',
        verbose_name="对象类型",
        blank=True, null=True, on_delete=models.SET_NULL
    )
    object_id = models.BigIntegerField(
        verbose_name="对象ID",
        blank=True, null=True, db_index=True
    )
    content_object = GenericForeignKey('content_type', 'object_id')
    object_changes = models.TextField(blank=True, null=True, verbose_name="改变详情")
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, verbose_name="所属用户",
        blank=True, null=True,
        on_delete=models.SET_NULL, related_name='action_logs'
    )
    action_type = models.PositiveSmallIntegerField(verbose_name="操作类型", blank=True, null=True,
                                                   choices=dict_for_model_choices(ActionType))

    action_info = models.TextField(verbose_name="操作详情", blank=True, null=True)
    remote_ip = models.GenericIPAddressField(
        verbose_name="请求IP地址", blank=True, null=True
    )
    created_time = models.DateTimeField(default=timezone.now, verbose_name="创建日期")
    deleted = models.BooleanField(default=False, verbose_name="是否删除")

    objects = ActionLogManager()

    class Meta:
        verbose_name = "操作日志"
        verbose_name_plural = "操作日志"

    def __str__(self):
        if self.action_type:
            return _("Logged action, type: {action}, id: {id}").format(
                action=self.get_action_display(),
                id=self.id
            )
        else:
            return _("Logged action, id: {id}").format(id=self.id)

    def get_action_display(self):
        return ActionType.get(self.action_type, 'Not provided')

    def get_edited_object(self):
        """Returns the edited object represented by this log entry"""
        return self.content_type.get_object_for_this_type(pk=self.object_id)

    @cached_property
    def object_url(self):
        try:
            url = self.content_object.get_absolute_url()
        except AttributeError:
            url = "#"
        return url

    @property
    def changes_dict(self):
        try:
            return json.loads(self.object_changes)
        except ValueError:
            return {}

    @property
    def changes_str(self, colon=': ', arrow=smart_text(' \u2192 '), separator='; '):
        substrings = []
        for field, values in self.changes_dict().items():
            substring = smart_text('{field_name:s}{colon:s}{old:s}{arrow:s}{new:s}').format(
                field_name=field,
                colon=colon,
                old=values[0],
                arrow=arrow,
                new=values[1],
            )
            substrings.append(substring)
        return separator.join(substrings)
