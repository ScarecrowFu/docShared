from rest_framework import serializers
from doc_api.models import User


class UserBaseSerializer(serializers.ModelSerializer):
    """用户序列化, 用于其他序列化当中"""
    avatar = serializers.SerializerMethodField(read_only=True)

    def get_avatar(self, obj):
        if obj.avatar:
            return obj.avatar.url
        return ''

    class Meta:
        model = User
        fields = ('id', 'username', 'nickname', 'email', 'avatar')


class UserDetailSerializer(serializers.ModelSerializer):
    created_time = serializers.DateTimeField(format='%Y-%m-%d %H:%M:%S', read_only=True)
    last_login = serializers.DateTimeField(format='%Y-%m-%d %H:%M:%S', read_only=True)
    avatar = serializers.SerializerMethodField(read_only=True)

    def get_avatar(self, obj):
        if obj.avatar:
            return obj.avatar.url
        return ''

    class Meta:
        model = User
        exclude = ('password', 'is_deleted', 'groups', 'user_permissions')


class UserListSerializer(serializers.ModelSerializer):
    created_time = serializers.DateTimeField(format='%Y-%m-%d %H:%M:%S', read_only=True)

    class Meta:
        model = User
        fields = ('id', 'username', 'nickname', 'email', 'phone', 'gender', 'title', 'is_active', 'is_admin', 'created_time')


class UserActionSerializer(serializers.ModelSerializer):
    username = serializers.CharField(label='账号')
    password = serializers.CharField(label='密码', write_only=True, required=False)
    nickname = serializers.CharField(label='昵称')
    email = serializers.EmailField(label='邮箱')

    def create(self, validated_data):
        instance = super().create(validated_data)
        instance.set_password(instance.password)
        instance.save()
        return instance

    def update(self, instance, validated_data):
        validated_data.pop('password', None)
        return super().update(instance, validated_data)

    class Meta:
        model = User
        fields = '__all__'

