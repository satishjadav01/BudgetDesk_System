from datetime import datetime

import django_filters

from .models import Expense


class ExpenseFilter(django_filters.FilterSet):
    date_from = django_filters.DateFilter(field_name="expense_date", lookup_expr="gte")
    date_to = django_filters.DateFilter(field_name="expense_date", lookup_expr="lte")
    month = django_filters.NumberFilter(method="filter_month")

    class Meta:
        model = Expense
        fields = ["category", "date_from", "date_to", "month"]

    def filter_month(self, queryset, name, value):
        year = datetime.utcnow().year
        return queryset.filter(expense_date__year=year, expense_date__month=value)
