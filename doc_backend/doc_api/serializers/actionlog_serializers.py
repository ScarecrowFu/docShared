from django.contrib.contenttypes.models import ContentType
from rest_framework import serializers
import json
from doc_api.models import ActionLog
from doc_api.serializers.user_serializers import UserBaseSerializer


class ActionLogSerializer(serializers.ModelSerializer):
    """操作日志记录"""
    user = UserBaseSerializer(read_only=True, label='所属用户')
    content_object = serializers.SerializerMethodField(read_only=True, label='操作对象')
    created_time = serializers.DateTimeField(format='%Y-%m-%d %H:%M:%S', read_only=True, label='创建时间')

    def get_content_object(self, obj):
        if obj.content_object:
            content_type = ContentType.objects.get_for_model(obj.content_object)
            return {'id': obj.content_object.id, 'name': str(obj.content_object), 'model': content_type.model}
        else:
            return ''

    class Meta:
        model = ActionLog
        fields = ('id', 'user', 'content_object', 'action_type', 'action_info', 'remote_ip', 'created_time')


class ActionLogDetailSerializer(serializers.ModelSerializer):
    """操作日志记录"""
    user = UserBaseSerializer(read_only=True, label='所属用户')
    content_object = serializers.SerializerMethodField(read_only=True, label='操作对象')
    object_changes = serializers.SerializerMethodField(read_only=True, label='修改内容')
    created_time = serializers.DateTimeField(format='%Y-%m-%d %H:%M:%S', read_only=True, label='创建时间')

    def get_content_object(self, obj):
        if obj.content_object:
            content_type = ContentType.objects.get_for_model(obj.content_object)
            return {'id': obj.content_object.id, 'name': str(obj.content_object), 'model': content_type.model}
        else:
            return ''

    def get_object_changes(self, obj):
        if obj.object_changes:
            return json.loads(obj.object_changes)
        else:
            return ''

    class Meta:
        model = ActionLog
        fields = ('id', 'user', 'content_object', 'action_type', 'action_info', 'object_changes', 'remote_ip', 'created_time')