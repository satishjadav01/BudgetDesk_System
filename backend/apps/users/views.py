from django.contrib.auth import get_user_model
from rest_framework import permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken

from .cookies import clear_auth_cookies, set_auth_cookies
from .serializers import (
    DashboardSummarySerializer,
    LoginSerializer,
    MonthlyMetricsSerializer,
    RegisterSerializer,
    UserSerializer,
)

User = get_user_model()


class RegisterView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        return Response(
            {"success": True, "message": "Registration successful.", "data": UserSerializer(user).data},
            status=status.HTTP_201_CREATED,
        )


class LoginView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = LoginSerializer(data=request.data, context={"request": request})
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data["user"]
        refresh = RefreshToken.for_user(user)
        response = Response(
            {"success": True, "message": "Login successful.", "data": UserSerializer(user).data},
            status=status.HTTP_200_OK,
        )
        set_auth_cookies(response, refresh.access_token, refresh)
        return response


class RefreshTokenView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        refresh_token = request.COOKIES.get("refresh_token")
        if not refresh_token:
            return Response(
                {"success": False, "message": "Refresh token missing.", "errors": {"detail": "Unauthorized"}},
                status=status.HTTP_401_UNAUTHORIZED,
            )
        try:
            token = RefreshToken(refresh_token)
            user = User.objects.get(id=token["user_id"])
            new_refresh = RefreshToken.for_user(user)
            response = Response({"success": True, "message": "Token refreshed."}, status=status.HTTP_200_OK)
            set_auth_cookies(response, new_refresh.access_token, new_refresh)
            return response
        except Exception:
            return Response(
                {"success": False, "message": "Invalid refresh token.", "errors": {"detail": "Unauthorized"}},
                status=status.HTTP_401_UNAUTHORIZED,
            )


class LogoutView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        response = Response({"success": True, "message": "Logged out."}, status=status.HTTP_200_OK)
        clear_auth_cookies(response)
        return response


class MeView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        return Response({"success": True, "data": UserSerializer(request.user).data}, status=status.HTTP_200_OK)


class DashboardSummaryView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        payload = DashboardSummarySerializer(DashboardSummarySerializer.build_for_user(request.user)).data
        return Response({"success": True, "data": payload}, status=status.HTTP_200_OK)


class MonthlyMetricsView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        year = int(request.query_params.get("year") or request.user.created_at.year)
        payload = MonthlyMetricsSerializer(
            MonthlyMetricsSerializer.build_for_user(request.user, year), many=True
        ).data
        return Response({"success": True, "data": payload}, status=status.HTTP_200_OK)
