from django.contrib import admin

from .models import Invoice, InvoiceItem


class InvoiceItemInline(admin.TabularInline):
    model = InvoiceItem
    extra = 0


@admin.register(Invoice)
class InvoiceAdmin(admin.ModelAdmin):
    list_display = ("invoice_number", "owner", "client_name", "issue_date", "total_amount", "status")
    search_fields = ("invoice_number", "client_name", "client_email")
    list_filter = ("status", "currency")
    inlines = [InvoiceItemInline]
