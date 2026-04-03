from datetime import date
from decimal import Decimal

from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework.test import APITestCase

from apps.expenses.models import Expense
from apps.invoices.models import Invoice, InvoiceItem

User = get_user_model()


class AuthAndDashboardTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(email="john@example.com", full_name="John Doe", password="Password123")

    def test_register_and_login(self):
        register_payload = {"email": "new@example.com", "full_name": "New User", "password": "Password123"}
        register_response = self.client.post("/api/v1/auth/register/", register_payload, format="json")
        self.assertEqual(register_response.status_code, 201)

        login_payload = {"email": "new@example.com", "password": "Password123"}
        login_response = self.client.post("/api/v1/auth/login/", login_payload, format="json")
        self.assertEqual(login_response.status_code, 200)
        self.assertIn("access_token", login_response.cookies)

    def test_dashboard_summary(self):
        invoice = Invoice.objects.create(
            owner=self.user,
            invoice_number="INV-2026-000001",
            client_name="Acme",
            client_email="acme@example.com",
            issue_date=date(2026, 1, 10),
            currency="INR",
            tax_percent=Decimal("10.00"),
            subtotal=Decimal("100.00"),
            tax_amount=Decimal("10.00"),
            total_amount=Decimal("110.00"),
        )
        InvoiceItem.objects.create(invoice=invoice, name="Design", quantity=1, unit_price="100.00", line_total="100.00")
        Expense.objects.create(
            owner=self.user,
            title="Software",
            amount="40.00",
            category="Software",
            expense_date=date(2026, 1, 12),
        )

        self.client.force_authenticate(self.user)
        response = self.client.get("/api/v1/dashboard/summary/")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["data"]["total_income"], "110.00")
        self.assertEqual(response.data["data"]["total_expenses"], "40.00")
        self.assertEqual(response.data["data"]["profit"], "70.00")

    def test_dashboard_monthly_metrics_are_serialized(self):
        Invoice.objects.create(
            owner=self.user,
            invoice_number="INV-2026-000002",
            client_name="Beta",
            client_email="beta@example.com",
            issue_date=date(2026, 2, 7),
            currency="INR",
            tax_percent=Decimal("0.00"),
            subtotal=Decimal("50.00"),
            tax_amount=Decimal("0.00"),
            total_amount=Decimal("50.00"),
        )
        Expense.objects.create(
            owner=self.user,
            title="Travel",
            amount="10.00",
            category="Travel",
            expense_date=date(2026, 2, 10),
        )

        self.client.force_authenticate(self.user)
        response = self.client.get("/api/v1/dashboard/monthly/?year=2026")

        self.assertEqual(response.status_code, 200)
        february = response.data["data"][1]
        self.assertEqual(february["month"], 2)
        self.assertEqual(february["income"], "50.00")
        self.assertEqual(february["expenses"], "10.00")
