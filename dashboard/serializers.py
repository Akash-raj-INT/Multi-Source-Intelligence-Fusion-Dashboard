from rest_framework import serializers
from .models import IntelligencePoint


class IntelligencePointSerializer(serializers.ModelSerializer):
    image_url = serializers.SerializerMethodField()

    class Meta:
        model = IntelligencePoint
        fields = [
            'id', 'title', 'description',
            'latitude', 'longitude', 'source_type',
            'image', 'image_url', 'timestamp'
        ]
        extra_kwargs = {
            'image': {'write_only': True, 'required': False}
        }

    def get_image_url(self, obj):
        if obj.image:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.image.url)
            return obj.image.url
        return None
