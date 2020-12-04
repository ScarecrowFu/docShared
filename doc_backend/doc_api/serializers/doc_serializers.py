from rest_framework import serializers
from doc_api.models import Doc, DocTag, DocTemplate
from doc_api.serializers.user_serializers import UserBaseSerializer
from doc_api.serializers.c_doc_serializers import CollectedDocBaseSerializer


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


#########################################################################################################

class DocTagBaseSerializer(serializers.ModelSerializer):

    class Meta:
        model = DocTag
        fields = ('id', 'name')


class DocTagDetailSerializer(serializers.ModelSerializer):
    created_time = serializers.DateTimeField(format='%Y-%m-%d %H:%M:%S', read_only=True)
    modified_time = serializers.DateTimeField(format='%Y-%m-%d %H:%M:%S', read_only=True)
    creator = UserBaseSerializer(read_only=True)

    class Meta:
        model = DocTag
        fields = '__all__'


class DocTagListSerializer(serializers.ModelSerializer):
    created_time = serializers.DateTimeField(format='%Y-%m-%d %H:%M:%S', read_only=True)
    creator = UserBaseSerializer(read_only=True)

    class Meta:
        model = DocTag
        fields = ('id', 'name', 'created_time', 'creator')


class DocTagActionSerializer(serializers.ModelSerializer):
    created_time = serializers.DateTimeField(format='%Y-%m-%d %H:%M:%S', read_only=True)
    modified_time = serializers.DateTimeField(format='%Y-%m-%d %H:%M:%S', read_only=True)
    creator = UserBaseSerializer(read_only=True)

    def create(self, validated_data):
        instance = super().create(validated_data)
        instance.creator = self.context['request'].user
        instance.save()
        return instance

    class Meta:
        model = DocTag
        fields = '__all__'


#########################################################################################################

class DocBaseSerializer(serializers.ModelSerializer):

    class Meta:
        model = Doc
        fields = ('id', 'title')


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
    c_doc = CollectedDocBaseSerializer(read_only=True)
    parent_doc = DocBaseSerializer(read_only=True)
    created_time = serializers.DateTimeField(format='%Y-%m-%d %H:%M:%S', read_only=True)
    creator = UserBaseSerializer(read_only=True)
    child_docs = serializers.SerializerMethodField(read_only=True)

    def get_child_docs(self, obj):
        child = []
        for child_doc in Doc.objects.filter(parent_doc=obj):
            child_doc_item = {'id': child_doc.id, 'title': child_doc.title, 'child_docs': []}
            _child_docs = self.get_child_docs(child_doc)
            if len(_child_docs) > 0:
                child_doc_item['child_docs'] = _child_docs
            child.append(child_doc_item)
        return child

    class Meta:
        model = Doc
        fields = ('id', 'c_doc', 'parent_doc', 'child_docs', 'title', 'created_time', 'status', 'creator')


class DocActionSerializer(serializers.ModelSerializer):
    created_time = serializers.DateTimeField(format='%Y-%m-%d %H:%M:%S', read_only=True)
    modified_time = serializers.DateTimeField(format='%Y-%m-%d %H:%M:%S', read_only=True)
    creator = UserBaseSerializer(read_only=True)
    tags = serializers.ListField(write_only=True, required=False)

    def create(self, validated_data):
        user = self.context['request'].user
        tags = validated_data.pop('tags', [])
        instance = super().create(validated_data)
        instance.creator = user
        for tag_name in tags:
            tag = DocTag.objects.filter(name=tag_name, creator=user).first()
            if not tag:
                DocTag.objects.create(name=tag_name, creator=user)
            instance.tags.add(tag)
        instance.save()
        return instance

    def update(self, instance, validated_data):
        user = self.context['request'].user
        tags = validated_data.pop('tags', [])
        instance = super().update(instance, validated_data)
        instance.tags.clear()
        for tag_name in tags:
            tag = DocTag.objects.filter(name=tag_name, creator=user).first()
            if not tag:
                DocTag.objects.create(name=tag_name, creator=user)
            instance.tags.add(tag)
        return instance

    class Meta:
        model = Doc
        fields = '__all__'