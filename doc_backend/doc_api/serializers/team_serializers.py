from rest_framework import serializers
from doc_api.models import TeamGroup
from doc_api.serializers.user_serializers import UserBaseSerializer


class TeamGroupBaseSerializer(serializers.ModelSerializer):
    members_cnt = serializers.SerializerMethodField(read_only=True)

    def get_members_cnt(self, obj):
        return obj.members.count()

    class Meta:
        model = TeamGroup
        fields = ('id', 'name', 'members_cnt')


class TeamGroupDetailSerializer(serializers.ModelSerializer):
    created_time = serializers.DateTimeField(format='%Y-%m-%d %H:%M:%S', read_only=True)
    modified_time = serializers.DateTimeField(format='%Y-%m-%d %H:%M:%S', read_only=True)
    members = UserBaseSerializer(many=True, read_only=True)
    creator = UserBaseSerializer(read_only=True)

    class Meta:
        model = TeamGroup
        fields = '__all__'


class TeamGroupListSerializer(serializers.ModelSerializer):
    created_time = serializers.DateTimeField(format='%Y-%m-%d %H:%M:%S', read_only=True)
    members_cnt = serializers.SerializerMethodField(read_only=True)
    creator = UserBaseSerializer(read_only=True)

    def get_members_cnt(self, obj):
        return obj.members.count()

    class Meta:
        model = TeamGroup
        fields = ('id', 'name', 'members_cnt', 'created_time', 'creator')


class TeamGroupActionSerializer(serializers.ModelSerializer):
    created_time = serializers.DateTimeField(format='%Y-%m-%d %H:%M:%S', read_only=True)
    modified_time = serializers.DateTimeField(format='%Y-%m-%d %H:%M:%S', read_only=True)
    creator = UserBaseSerializer(read_only=True)

    def create(self, validated_data):
        instance = super().create(validated_data)
        instance.creator = self.context['request'].user
        instance.save()
        return instance

    class Meta:
        model = TeamGroup
        fields = '__all__'

