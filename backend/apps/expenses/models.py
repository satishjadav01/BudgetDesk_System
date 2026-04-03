from django.conf import settings
from django.db import models


class Expense(models.Model):
    CATEGORY_OFFICE = "Office"
    CATEGORY_TRAVEL = "Travel"
    CATEGORY_SOFTWARE = "Software"
    CATEGORY_UTILITIES = "Utilities"
    CATEGORY_OTHER = "Other"

    CATEGORY_CHOICES = [
        (CATEGORY_OFFICE, "Office"),
        (CATEGORY_TRAVEL, "Travel"),
        (CATEGORY_SOFTWARE, "Software"),
        (CATEGORY_UTILITIES, "Utilities"),
        (CATEGORY_OTHER, "Other"),
    ]

    owner = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="expenses")
    title = models.CharField(max_length=150)
    amount = models.DecimalField(max_digits=14, decimal_places=2)
    category = models.CharField(max_length=30, choices=CATEGORY_CHOICES)
    expense_date = models.DateField()
    notes = models.TextField(blank=True, default="")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-expense_date", "-created_at"]

    def __str__(self):
        return f"{self.title} - {self.amount}"
