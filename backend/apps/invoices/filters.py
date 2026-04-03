import django_filters

from .models import Invoice


class InvoiceFilter(django_filters.FilterSet):
    date_from = django_filters.DateFilter(field_name="issue_date", lookup_expr="gte")
    date_to = django_filters.DateFilter(field_name="issue_date", lookup_expr="lte")

    class Meta:
        model = Invoice
        fields = ["status", "currency", "date_from", "date_to"]
