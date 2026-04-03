from decimal import Decimal

from django.db.models import Sum
from django.db.models.functions import ExtractMonth
from rest_framework import serializers

from apps.expenses.models import Expense
from apps.invoices.models import Invoice

from .models import User


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)

    class Meta:
        model = User
        fields = ("id", "email", "full_name", "password")

    def create(self, validated_data):
        return User.objects.create_user(**validated_data)


class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)

    def validate(self, attrs):
        email = attrs.get("email")
        password = attrs.get("password")
        user = User.objects.filter(email__iexact=email).first()
        if not user or not user.check_password(password) or not user.is_active:
            raise serializers.ValidationError("Invalid email or password.")
        attrs["user"] = user
        return attrs


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ("id", "email", "full_name", "created_at")


class DashboardSummarySerializer(serializers.Serializer):
    total_income = serializers.DecimalField(max_digits=14, decimal_places=2)
    total_expenses = serializers.DecimalField(max_digits=14, decimal_places=2)
    profit = serializers.DecimalField(max_digits=14, decimal_places=2)

    @staticmethod
    def build_for_user(user):
        income = (
            Invoice.objects.filter(owner=user).aggregate(total=Sum("total_amount")).get("total")
            or Decimal("0.00")
        )
        expenses = (
            Expense.objects.filter(owner=user).aggregate(total=Sum("amount")).get("total")
            or Decimal("0.00")
        )
        return {
            "total_income": income,
            "total_expenses": expenses,
            "profit": income - expenses,
        }


class MonthlyMetricsSerializer(serializers.Serializer):
    month = serializers.IntegerField()
    income = serializers.DecimalField(max_digits=14, decimal_places=2)
    expenses = serializers.DecimalField(max_digits=14, decimal_places=2)

    @staticmethod
    def build_for_user(user, year):
        income_qs = (
            Invoice.objects.filter(owner=user, issue_date__year=year)
            .annotate(month=ExtractMonth("issue_date"))
            .values("month")
            .annotate(total=Sum("total_amount"))
        )
        expense_qs = (
            Expense.objects.filter(owner=user, expense_date__year=year)
            .annotate(month=ExtractMonth("expense_date"))
            .values("month")
            .annotate(total=Sum("amount"))
        )

        income_map = {row["month"]: row["total"] for row in income_qs}
        expense_map = {row["month"]: row["total"] for row in expense_qs}
        payload = []
        for month in range(1, 13):
            income = income_map.get(month) or Decimal("0.00")
            expenses = expense_map.get(month) or Decimal("0.00")
            payload.append({"month": month, "income": income, "expenses": expenses})
        return payload
