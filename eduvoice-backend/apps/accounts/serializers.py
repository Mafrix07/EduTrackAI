from django.contrib.auth.models import User
from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer


class RegisterSerializer(serializers.Serializer):
    name = serializers.CharField(max_length=150)
    email = serializers.EmailField()
    password = serializers.CharField(min_length=8, write_only=True)

    def validate_email(self, value):
        if User.objects.filter(email=value).exists() or User.objects.filter(username=value).exists():
            raise serializers.ValidationError("Un compte avec cet email existe déjà.")
        return value

    def create(self, validated_data):
        return User.objects.create_user(
            username=validated_data["email"],
            email=validated_data["email"],
            first_name=validated_data["name"],
            password=validated_data["password"],
        )


class EduVoiceTokenSerializer(TokenObtainPairSerializer):
    """Accepts 'email' instead of 'username' and includes user info in the response."""

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.fields["email"] = self.fields.pop("username")

    def validate(self, attrs):
        attrs["username"] = attrs.pop("email")
        data = super().validate(attrs)
        data["user"] = {
            "id": self.user.pk,
            "name": self.user.first_name or self.user.username,
            "email": self.user.email,
        }
        return data
