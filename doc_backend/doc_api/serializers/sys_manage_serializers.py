from rest_framework import serializers
from doc_api.models import Announcement, RegisterCode
from doc_api.serializers.user_serializers import UserBaseSerializer
import random


class AnnouncementBaseSerializer(serializers.ModelSerializer):

    class Meta:
        model = Announcement
        fields = ('id', 'title')


class AnnouncementDetailSerializer(serializers.ModelSerializer):
    created_time = serializers.DateTimeField(format='%Y-%m-%d %H:%M:%S', read_only=True)
    modified_time = serializers.DateTimeField(format='%Y-%m-%d %H:%M:%S', read_only=True)
    creator = UserBaseSerializer(read_only=True)

    class Meta:
        model = Announcement
        fields = '__all__'


class AnnouncementListSerializer(serializers.ModelSerializer):
    created_time = serializers.DateTimeField(format='%Y-%m-%d %H:%M:%S', read_only=True)
    creator = UserBaseSerializer(read_only=True)

    class Meta:
        model = Announcement
        fields = ('id', 'title', 'link', 'is_publish', 'creator', 'created_time')


class AnnouncementActionSerializer(serializers.ModelSerializer):
    created_time = serializers.DateTimeField(format='%Y-%m-%d %H:%M:%S', read_only=True)
    modified_time = serializers.DateTimeField(format='%Y-%m-%d %H:%M:%S', read_only=True)
    creator = UserBaseSerializer(read_only=True)

    def create(self, validated_data):
        instance = super().create(validated_data)
        instance.creator = self.context['request'].user
        instance.save()
        return instance

    class Meta:
        model = Announcement
        fields = '__all__'


#########################################################################################################


class RegisterCodeBaseSerializer(serializers.ModelSerializer):

    class Meta:
        model = RegisterCode
        fields = ('id', 'code')


class RegisterCodeDetailSerializer(serializers.ModelSerializer):
    created_time = serializers.DateTimeField(format='%Y-%m-%d %H:%M:%S', read_only=True)
    modified_time = serializers.DateTimeField(format='%Y-%m-%d %H:%M:%S', read_only=True)
    creator = UserBaseSerializer(read_only=True)

    class Meta:
        model = RegisterCode
        fields = '__all__'


class RegisterCodeListSerializer(serializers.ModelSerializer):
    created_time = serializers.DateTimeField(format='%Y-%m-%d %H:%M:%S', read_only=True)
    creator = UserBaseSerializer(read_only=True)

    class Meta:
        model = RegisterCode
        fields = ('id', 'code', 'all_cnt', 'used_cnt', 'status', 'creator', 'created_time')


class RegisterCodeActionSerializer(serializers.ModelSerializer):
    created_time = serializers.DateTimeField(format='%Y-%m-%d %H:%M:%S', read_only=True)
    modified_time = serializers.DateTimeField(format='%Y-%m-%d %H:%M:%S', read_only=True)
    creator = UserBaseSerializer(read_only=True)

    def create(self, validated_data):
        instance = super().create(validated_data)
        instance.creator = self.context['request'].user
        instance.save()
        return instance

    class Meta:
        model = RegisterCode
        fields = '__all__'