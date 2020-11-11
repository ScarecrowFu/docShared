from rest_framework import serializers
from doc_api.models import CollectedDoc
from doc_api.serializers.user_serializers import UserBaseSerializer


class CollectedDocDetailSerializer(serializers.ModelSerializer):
    created_time = serializers.DateTimeField(format='%Y-%m-%d %H:%M:%S', read_only=True)
    modified_time = serializers.DateTimeField(format='%Y-%m-%d %H:%M:%S', read_only=True)
    creator = UserBaseSerializer(read_only=True)

    class Meta:
        model = CollectedDoc
        fields = '__all__'


class CollectedDocListSerializer(serializers.ModelSerializer):
    created_time = serializers.DateTimeField(format='%Y-%m-%d %H:%M:%S', read_only=True)
    creator = UserBaseSerializer(read_only=True)
    docs_cnt = serializers.SerializerMethodField(read_only=True)

    def get_docs_cnt(self, obj):
        return obj.docs.count()

    class Meta:
        model = CollectedDoc
        fields = ('id', 'name', 'intro', 'docs_cnt', 'perm', 'created_time', 'creator')


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

