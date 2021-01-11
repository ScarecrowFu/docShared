from rest_framework import serializers
from doc_api.models import Announcement, RegisterCode, SystemSetting, EmailVerificationCode
from doc_api.serializers.user_serializers import UserBaseSerializer
from doc_api.utils.base_helpers import md_to_text


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
    desc = serializers.SerializerMethodField(read_only=True)

    def get_desc(self, obj):
        return md_to_text(obj.content)

    class Meta:
        model = Announcement
        fields = ('id', 'title', 'link', 'is_publish', 'creator', 'created_time', 'desc')


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


#########################################################################################################


class EmailVerificationCodeBaseSerializer(serializers.ModelSerializer):

    class Meta:
        model = EmailVerificationCode
        fields = ('id', 'email_name', 'verification_code')


class EmailVerificationCodeDetailSerializer(serializers.ModelSerializer):
    created_time = serializers.DateTimeField(format='%Y-%m-%d %H:%M:%S', read_only=True)
    modified_time = serializers.DateTimeField(format='%Y-%m-%d %H:%M:%S', read_only=True)
    # expired_time = serializers.DateTimeField(format='%Y-%m-%d %H:%M:%S', read_only=True)
    creator = UserBaseSerializer(read_only=True)

    class Meta:
        model = EmailVerificationCode
        fields = '__all__'


class EmailVerificationCodeListSerializer(serializers.ModelSerializer):
    created_time = serializers.DateTimeField(format='%Y-%m-%d %H:%M:%S', read_only=True)
    modified_time = serializers.DateTimeField(format='%Y-%m-%d %H:%M:%S', read_only=True)
    expired_time = serializers.DateTimeField(format='%Y-%m-%d %H:%M:%S', read_only=True)
    creator = UserBaseSerializer(read_only=True)

    class Meta:
        model = EmailVerificationCode
        fields = '__all__'


class EmailVerificationCodeActionSerializer(serializers.ModelSerializer):
    created_time = serializers.DateTimeField(format='%Y-%m-%d %H:%M:%S', read_only=True)
    modified_time = serializers.DateTimeField(format='%Y-%m-%d %H:%M:%S', read_only=True)
    creator = UserBaseSerializer(read_only=True)

    def create(self, validated_data):
        instance = super().create(validated_data)
        instance.creator = self.context['request'].user
        instance.save()
        return instance

    class Meta:
        model = EmailVerificationCode
        fields = '__all__'


#########################################################################################################


class SystemSettingBaseSerializer(serializers.ModelSerializer):

    class Meta:
        model = SystemSetting
        fields = ('id', 'key', 'name', 'value', 'set_type')


class SystemSettingDetailSerializer(serializers.ModelSerializer):
    created_time = serializers.DateTimeField(format='%Y-%m-%d %H:%M:%S', read_only=True)
    modified_time = serializers.DateTimeField(format='%Y-%m-%d %H:%M:%S', read_only=True)
    creator = UserBaseSerializer(read_only=True)
    value = serializers.CharField(read_only=True)

    def get_value(self, obj):
        try:
            if obj.set_type == 30:
                return int(obj.value)
            if obj.set_type == 40:
                return round(float(obj.value))
            if obj.set_type == 50:
                return list(obj.value)
            if obj.set_type == 60:
                if obj.lower() == 'true':
                    return True
                else:
                    return False
            if obj.set_type == 70:
                return dict(obj.value)
            return obj.value
        except Exception as error:
            return obj.value

    class Meta:
        model = SystemSetting
        fields = '__all__'


class SystemSettingListSerializer(serializers.ModelSerializer):
    created_time = serializers.DateTimeField(format='%Y-%m-%d %H:%M:%S', read_only=True)
    creator = UserBaseSerializer(read_only=True)
    value = serializers.SerializerMethodField(read_only=True)

    def get_value(self, obj):
        try:
            if obj.set_type == 30:
                return int(obj.value)
            if obj.set_type == 40:
                return round(float(obj.value))
            if obj.set_type == 50:
                return list(obj.value)
            if obj.set_type == 60:
                if obj.value.lower() == 'true':
                    return True
                else:
                    return False
            if obj.set_type == 70:
                return dict(obj.value)
            return obj.value
        except Exception as error:
            return obj.value

    class Meta:
        model = SystemSetting
        fields = ('id', 'key', 'name', 'value', 'description', 'set_type', 'created_time', 'creator')


class SystemSettingActionSerializer(serializers.ModelSerializer):
    created_time = serializers.DateTimeField(format='%Y-%m-%d %H:%M:%S', read_only=True)
    modified_time = serializers.DateTimeField(format='%Y-%m-%d %H:%M:%S', read_only=True)
    creator = UserBaseSerializer(read_only=True)

    def create(self, validated_data):
        instance = super().create(validated_data)
        instance.creator = self.context['request'].user
        instance.save()
        return instance

    class Meta:
        model = SystemSetting
        fields = '__all__'