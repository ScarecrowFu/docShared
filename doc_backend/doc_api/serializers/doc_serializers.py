from rest_framework import serializers
from doc_api.models import Doc, DocTag, DocTemplate, DocHistory
from doc_api.serializers.user_serializers import UserBaseSerializer
from doc_api.serializers.c_doc_serializers import CollectedDocBaseSerializer
from doc_api.utils.base_helpers import md_to_text


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


class DocHistorySerializer(serializers.ModelSerializer):
    doc = DocBaseSerializer(read_only=True)
    creator = UserBaseSerializer(read_only=True)
    created_time = serializers.DateTimeField(format='%Y-%m-%d %H:%M:%S', read_only=True)

    class Meta:
        model = DocHistory
        fields = ('id', 'created_time', 'creator', 'doc')


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
    member_perm = serializers.SerializerMethodField(read_only=True)
    content_text = serializers.SerializerMethodField(read_only=True)

    def get_child_docs(self, obj):
        child = []
        for child_doc in Doc.objects.filter(parent_doc=obj):
            print(f'{obj} has chind_doc :{child_doc}')
            _child_docs = self.get_child_docs(child_doc)
            if len(_child_docs) > 0:
                child_doc_item = {'id': child_doc.id, 'title': child_doc.title, 'child_docs':  _child_docs, 'created_time': child_doc.created_time.strftime('%Y-%m-%d %H:%M:%S')}
                child.append(child_doc_item)
            else:
                child_doc_item = {'id': child_doc.id, 'title': child_doc.title, 'child_docs': [], 'created_time': child_doc.created_time.strftime('%Y-%m-%d %H:%M:%S')}
                child.append(child_doc_item)
        return child

    def get_member_perm(self, obj):
        user = self.context['request'].user
        if not user.is_anonymous:
            if obj.creator == user or user.is_admin:
                return 30  # 文集管理员
            perms = [0]
            user_perms = obj.c_doc.users.filter(user=user).values_list('perm', flat=True)
            if user_perms:
                perms.append(max(user_perms))
            user_member_teams = obj.c_doc.teams.filter(c_doc_team_users__user=user).all()
            for user_member_team in user_member_teams:
                team_perms = user_member_team.c_doc_team_users.filter(user=user).values_list('perm', flat=True)
                if team_perms:
                    perms.append(max(team_perms))
            return max(perms)
        return 0

    def get_content_text(self, obj):
        return md_to_text(obj.content)

    class Meta:
        model = Doc
        fields = ('id', 'c_doc', 'parent_doc', 'child_docs', 'title', 'created_time', 'status', 'creator', 'sort', 'member_perm', 'content_text')


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
                tag = DocTag.objects.create(name=tag_name, creator=user)
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
                tag = DocTag.objects.create(name=tag_name, creator=user)
            instance.tags.add(tag)
        instance.save()
        return instance

    class Meta:
        model = Doc
        fields = '__all__'