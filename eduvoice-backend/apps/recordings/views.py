from rest_framework import serializers, viewsets
from .models import Recording


class RecordingSerializer(serializers.ModelSerializer):
    class Meta:
        model = Recording
        fields = "__all__"
        read_only_fields = ["id", "created_at", "status"]


class RecordingViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Recording.objects.all()
    serializer_class = RecordingSerializer
