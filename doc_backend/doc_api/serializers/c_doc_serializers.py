from rest_framework import serializers
from doc_api.models import CollectedDoc, CollectedDocUser, CollectedDocTeam, CollectedDocTeamUser, CollectedDocSetting, User
from doc_api.serializers.user_serializers import UserBaseSerializer
from doc_api.serializers.team_serializers import TeamGroupBaseSerializer


class CollectedDocBaseSerializer(serializers.ModelSerializer):

    class Meta:
        model = CollectedDoc
        fields = ('id', 'name', 'intro')


class CollectedDocDetailSerializer(serializers.ModelSerializer):
    created_time = serializers.DateTimeField(format='%Y-%m-%d %H:%M:%S', read_only=True)
    modified_time = serializers.DateTimeField(format='%Y-%m-%d %H:%M:%S', read_only=True)
    creator = UserBaseSerializer(read_only=True)
    member_perm = serializers.SerializerMethodField(read_only=True)

    def get_member_perm(self, obj):
        user = self.context['request'].user
        if not user.is_anonymous:
            if obj.creator == user or user.is_admin:
                return 30  # 文集管理员
            perms = [0]
            user_perms = obj.users.filter(user=user).values_list('perm', flat=True)
            if user_perms:
                perms.append(max(user_perms))
            user_member_teams = obj.teams.filter(c_doc_team_users__user=user).all()
            for user_member_team in user_member_teams:
                team_perms = user_member_team.c_doc_team_users.filter(user=user).values_list('perm', flat=True)
                if team_perms:
                    perms.append(max(team_perms))
            return max(perms)
        else:
            return 0

    class Meta:
        model = CollectedDoc
        fields = '__all__'


class CollectedDocListSerializer(serializers.ModelSerializer):
    created_time = serializers.DateTimeField(format='%Y-%m-%d %H:%M:%S', read_only=True)
    creator = UserBaseSerializer(read_only=True)
    docs_cnt = serializers.SerializerMethodField(read_only=True)
    member_perm = serializers.SerializerMethodField(read_only=True)
    latest_doc = serializers.SerializerMethodField(read_only=True)

    def get_docs_cnt(self, obj):
        return obj.docs.count()

    def get_member_perm(self, obj):
        user = self.context['request'].user
        if not user.is_anonymous:
            if obj.creator == user or user.is_admin:
                return 30  # 文集管理员
            perms = [0]
            user_perms = obj.users.filter(user=user).values_list('perm', flat=True)
            if user_perms:
                perms.append(max(user_perms))
            user_member_teams = obj.teams.filter(c_doc_team_users__user=user).all()
            for user_member_team in user_member_teams:
                team_perms = user_member_team.c_doc_team_users.filter(user=user).values_list('perm', flat=True)
                if team_perms:
                    perms.append(max(team_perms))
            return max(perms)
        else:
            return 0

    def get_latest_doc(self, obj):
        doc = obj.docs.filter(status=20, is_deleted=False).order_by('-created_time').first()
        if doc:
            return {'id': doc.id, 'title': doc.title}
        else:
            return None

    class Meta:
        model = CollectedDoc
        fields = ('id', 'name', 'intro', 'docs_cnt', 'perm', 'created_time', 'creator', 'member_perm', 'latest_doc')


class CollectedDocActionSerializer(serializers.ModelSerializer):
    created_time = serializers.DateTimeField(format='%Y-%m-%d %H:%M:%S', read_only=True)
    modified_time = serializers.DateTimeField(format='%Y-%m-%d %H:%M:%S', read_only=True)
    creator = UserBaseSerializer(read_only=True)

    def create(self, validated_data):
        instance = super().create(validated_data)
        instance.creator = self.context['request'].user
        instance.save()
        return instance

    class Meta:
        model = CollectedDoc
        fields = '__all__'


######################################################################################################


class CollectedDocUserListSerializer(serializers.ModelSerializer):
    created_time = serializers.DateTimeField(format='%Y-%m-%d %H:%M:%S', read_only=True)
    c_doc = CollectedDocBaseSerializer(read_only=True)
    user = UserBaseSerializer(read_only=True)

    class Meta:
        model = CollectedDocUser
        fields = ('id', 'c_doc', 'user', 'perm', 'created_time')


class CollectedDocUserDetailSerializer(serializers.ModelSerializer):
    created_time = serializers.DateTimeField(format='%Y-%m-%d %H:%M:%S', read_only=True)
    modified_time = serializers.DateTimeField(format='%Y-%m-%d %H:%M:%S', read_only=True)
    c_doc = CollectedDocBaseSerializer(read_only=True)
    user = UserBaseSerializer(read_only=True)
    creator = UserBaseSerializer(read_only=True)

    class Meta:
        model = CollectedDocUser
        fields = '__all__'


class CollectedDocUserActionSerializer(serializers.ModelSerializer):
    created_time = serializers.DateTimeField(format='%Y-%m-%d %H:%M:%S', read_only=True)
    modified_time = serializers.DateTimeField(format='%Y-%m-%d %H:%M:%S', read_only=True)
    creator = UserBaseSerializer(read_only=True)

    def create(self, validated_data):
        instance = super().create(validated_data)
        instance.creator = self.context['request'].user
        instance.save()
        return instance

    class Meta:
        model = CollectedDocUser
        fields = '__all__'


#################################################################################################

class CollectedDocTeamUserBaseSerializer(serializers.ModelSerializer):
    user = UserBaseSerializer(read_only=True)

    class Meta:
        model = CollectedDocTeamUser
        fields = ('id', 'user', 'perm')


class CollectedDocTeamListSerializer(serializers.ModelSerializer):
    created_time = serializers.DateTimeField(format='%Y-%m-%d %H:%M:%S', read_only=True)
    c_doc = CollectedDocBaseSerializer(read_only=True)
    team_group = TeamGroupBaseSerializer(read_only=True)
    members_cnt = serializers.SerializerMethodField(read_only=True)

    def get_members_cnt(self, obj):
        return obj.team_group.members.count()

    class Meta:
        model = CollectedDocTeam
        fields = ('id', 'c_doc', 'team_group', 'created_time', 'members_cnt')


class CollectedDocTeamDetailSerializer(serializers.ModelSerializer):
    created_time = serializers.DateTimeField(format='%Y-%m-%d %H:%M:%S', read_only=True)
    modified_time = serializers.DateTimeField(format='%Y-%m-%d %H:%M:%S', read_only=True)
    creator = UserBaseSerializer(read_only=True)
    c_doc = CollectedDocBaseSerializer(read_only=True)
    team_group = TeamGroupBaseSerializer(read_only=True)

    members = serializers.SerializerMethodField(read_only=True)
    members_cnt = serializers.SerializerMethodField(read_only=True)

    def get_members_cnt(self, obj):
        return obj.team_group.members.count()

    def get_members(self, obj):
        return CollectedDocTeamUserBaseSerializer(obj.c_doc_team_users.all(), many=True).data

    class Meta:
        model = CollectedDocTeam
        fields = '__all__'


def update_team_members(instance, members):
    team_members = instance.team_group.members.all()
    if not members:
        members = [{'id': team_member.id,  'perm': 10} for team_member in team_members]
    for member in members:
        user_id = int(member['id'])
        perm = int(member['perm'])
        if not perm:
            perm = 10
        user = User.objects.get(pk=user_id)
        if user in team_members:
            c_doc_team_user = CollectedDocTeamUser.objects.filter(c_doc_team=instance, user=user).first()
            if c_doc_team_user:
                c_doc_team_user.perm = perm
                c_doc_team_user.save()
            else:
                CollectedDocTeamUser.objects.create(c_doc_team=instance, user=user, perm=perm)


class CollectedDocTeamActionSerializer(serializers.ModelSerializer):
    created_time = serializers.DateTimeField(format='%Y-%m-%d %H:%M:%S', read_only=True)
    modified_time = serializers.DateTimeField(format='%Y-%m-%d %H:%M:%S', read_only=True)
    creator = UserBaseSerializer(read_only=True)
    members = serializers.JSONField(required=False, write_only=True)

    def create(self, validated_data):
        members = validated_data.pop('members', None)
        instance = super().create(validated_data)
        instance.creator = self.context['request'].user
        instance.save()
        update_team_members(instance, members)
        return instance

    def update(self, instance, validated_data):
        members = validated_data.pop('members', None)
        instance = super().update(instance, validated_data)
        update_team_members(instance, members)
        return instance

    class Meta:
        model = CollectedDocTeam
        fields = '__all__'


class CollectedDocSettingSerializer(serializers.ModelSerializer):
    id = serializers.SerializerMethodField(read_only=True)
    name = serializers.SerializerMethodField(read_only=True)
    intro = serializers.SerializerMethodField(read_only=True)

    def get_id(self, obj):
        return obj.c_doc.id

    def get_name(self, obj):
        return obj.c_doc.name

    def get_intro(self, obj):
        return obj.c_doc.intro

    class Meta:
        model = CollectedDocSetting
        fields = ('id', 'name', 'intro', 'allow_epub', 'allow_pdf', 'allow_doc', 'allow_markdown')
