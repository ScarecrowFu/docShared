from rest_framework import serializers
from doc_api.models import FileGroup, FileAttachment
from doc_api.serializers.user_serializers import UserBaseSerializer


class FileGroupBaseSerializer(serializers.ModelSerializer):

    class Meta:
        model = FileGroup
        fields = ('id', 'name')


class FileGroupDetailSerializer(serializers.ModelSerializer):
    created_time = serializers.DateTimeField(format='%Y-%m-%d %H:%M:%S', read_only=True)
    modified_time = serializers.DateTimeField(format='%Y-%m-%d %H:%M:%S', read_only=True)
    creator = UserBaseSerializer(read_only=True)

    class Meta:
        model = FileGroup
        fields = '__all__'


class FileGroupListSerializer(serializers.ModelSerializer):
    created_time = serializers.DateTimeField(format='%Y-%m-%d %H:%M:%S', read_only=True)
    creator = UserBaseSerializer(read_only=True)

    class Meta:
        model = FileGroup
        fields = ('id', 'name', 'group_type', 'created_time', 'creator')


class FileGroupActionSerializer(serializers.ModelSerializer):
    created_time = serializers.DateTimeField(format='%Y-%m-%d %H:%M:%S', read_only=True)
    modified_time = serializers.DateTimeField(format='%Y-%m-%d %H:%M:%S', read_only=True)
    creator = UserBaseSerializer(read_only=True)

    def create(self, validated_data):
        instance = super().create(validated_data)
        instance.creator = self.context['request'].user
        instance.save()
        return instance

    class Meta:
        model = FileGroup
        fields = '__all__'


#########################################################################################################

class FileAttachmentBaseSerializer(serializers.ModelSerializer):

    class Meta:
        model = FileAttachment
        fields = ('id', 'file_name', 'file_path')


class FileAttachmentDetailSerializer(serializers.ModelSerializer):
    group = FileGroupBaseSerializer(read_only=True)
    created_time = serializers.DateTimeField(format='%Y-%m-%d %H:%M:%S', read_only=True)
    modified_time = serializers.DateTimeField(format='%Y-%m-%d %H:%M:%S', read_only=True)
    creator = UserBaseSerializer(read_only=True)

    class Meta:
        model = FileAttachment
        fields = '__all__'


class FileAttachmentListSerializer(serializers.ModelSerializer):
    created_time = serializers.DateTimeField(format='%Y-%m-%d %H:%M:%S', read_only=True)
    creator = UserBaseSerializer(read_only=True)

    class Meta:
        model = FileAttachment
        fields = ('id', 'group', 'file_name', 'file_path', 'file_source', 'file_type', 'file_size', 'creator', 'created_time')


class FileAttachmentActionSerializer(serializers.ModelSerializer):
    created_time = serializers.DateTimeField(format='%Y-%m-%d %H:%M:%S', read_only=True)
    modified_time = serializers.DateTimeField(format='%Y-%m-%d %H:%M:%S', read_only=True)
    creator = UserBaseSerializer(read_only=True)

    def create(self, validated_data):
        instance = super().create(validated_data)
        instance.creator = self.context['request'].user
        instance.save()
        return instance

    class Meta:
        model = FileAttachment
        fields = '__all__'

