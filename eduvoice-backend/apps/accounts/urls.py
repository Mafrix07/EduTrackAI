from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from .views import RegisterView, EduVoiceTokenView, UserMeView

urlpatterns = [
    path("auth/register/", RegisterView.as_view(), name="auth-register"),
    path("auth/token/", EduVoiceTokenView.as_view(), name="auth-token"),
    path("auth/token/refresh/", TokenRefreshView.as_view(), name="auth-token-refresh"),
    path("auth/me/", UserMeView.as_view(), name="auth-me"),
]
