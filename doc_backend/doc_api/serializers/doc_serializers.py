from rest_framework import serializers
from doc_api.models import Doc, DocTag, DocTemplate
from doc_api.serializers.user_serializers import UserBaseSerializer
from doc_api.serializers.c_doc_serializers import CollectedDocBaseSerializer


class DocBaseSerializer(serializers.ModelSerializer):

    class Meta:
        model = Doc
        fields = ('id', 'title')


class DocTagBaseSerializer(serializers.ModelSerializer):

    class Meta:
        model = DocTag
        fields = ('id', 'name')


class DocDetailSerializer(serializers.ModelSerializer):
    c_doc = CollectedDocBaseSerializer(read_only=True)
    parent_doc = DocBaseSerializer(read_only=True)
    tags = DocTagBaseSerializer(read_only=True, many=True)
    created_time = serializers.DateTimeField(format='%Y-%m-%d %H:%M:%S', read_only=True)
    modified_time = serializers.DateTimeField(format='%Y-%m-%d %H:%M:%S', read_only=True)
    creator = UserBaseSerializer(read_only=True)

    class Meta:
        model = Doc
        fields = '__all__'


class DocListSerializer(serializers.ModelSerializer):
    created_time = serializers.DateTimeField(format='%Y-%m-%d %H:%M:%S', read_only=True)
    creator = UserBaseSerializer(read_only=True)

    class Meta:
        model = Doc
        fields = ('id', 'c_doc', 'parent_doc', 'title', 'created_time', 'status', 'creator')


class DocActionSerializer(serializers.ModelSerializer):
    created_time = serializers.DateTimeField(format='%Y-%m-%d %H:%M:%S', read_only=True)
    modified_time = serializers.DateTimeField(format='%Y-%m-%d %H:%M:%S', read_only=True)
    creator = UserBaseSerializer(read_only=True)

    def create(self, validated_data):
        instance = super().create(validated_data)
        instance.creator = self.context['request'].user
        instance.save()
        return instance

    class Meta:
        model = Doc
        fields = '__all__'


#########################################################################################################


class DocTemplateBaseSerializer(serializers.ModelSerializer):

    class Meta:
        model = DocTemplate
        fields = ('id', 'name')


class DocTemplateDetailSerializer(serializers.ModelSerializer):
    created_time = serializers.DateTimeField(format='%Y-%m-%d %H:%M:%S', read_only=True)
    modified_time = serializers.DateTimeField(format='%Y-%m-%d %H:%M:%S', read_only=True)
    creator = UserBaseSerializer(read_only=True)

    class Meta:
        model = DocTemplate
        fields = '__all__'


class DocTemplateListSerializer(serializers.ModelSerializer):
    created_time = serializers.DateTimeField(format='%Y-%m-%d %H:%M:%S', read_only=True)
    creator = UserBaseSerializer(read_only=True)

    class Meta:
        model = DocTemplate
        fields = ('id', 'name', 'created_time', 'creator')


class DocTemplateActionSerializer(serializers.ModelSerializer):
    created_time = serializers.DateTimeField(format='%Y-%m-%d %H:%M:%S', read_only=True)
    modified_time = serializers.DateTimeField(format='%Y-%m-%d %H:%M:%S', read_only=True)
    creator = UserBaseSerializer(read_only=True)

    def create(self, validated_data):
        instance = super().create(validated_data)
        instance.creator = self.context['request'].user
        instance.save()
        return instance

    class Meta:
        model = DocTemplate
        fields = '__all__'

