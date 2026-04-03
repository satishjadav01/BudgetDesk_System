from django.contrib import admin

from .models import Expense


@admin.register(Expense)
class ExpenseAdmin(admin.ModelAdmin):
    list_display = ("title", "owner", "amount", "category", "expense_date")
    search_fields = ("title", "category")
    list_filter = ("category",)
