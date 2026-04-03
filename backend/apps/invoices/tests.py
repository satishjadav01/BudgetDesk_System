from datetime import date

from django.contrib.auth import get_user_model
from rest_framework.test import APITestCase

User = get_user_model()


class InvoiceTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(email="owner@example.com", full_name="Owner", password="Password123")
        self.other = User.objects.create_user(email="other@example.com", full_name="Other", password="Password123")
        self.client.force_authenticate(self.user)

    def test_invoice_total_calculation(self):
        payload = {
            "client_name": "Client One",
            "client_email": "client@example.com",
            "issue_date": str(date(2026, 1, 3)),
            "due_date": str(date(2026, 1, 30)),
            "currency": "INR",
            "tax_percent": "10.00",
            "status": "draft",
            "items": [
                {"name": "Work A", "quantity": 2, "unit_price": "100.00"},
                {"name": "Work B", "quantity": 1, "unit_price": "50.00"},
            ],
        }
        response = self.client.post("/api/v1/invoices/", payload, format="json")
        self.assertEqual(response.status_code, 201)
        self.assertEqual(response.data["data"]["subtotal"], "250.00")
        self.assertEqual(response.data["data"]["tax_amount"], "25.00")
        self.assertEqual(response.data["data"]["total_amount"], "275.00")

    def test_pdf_download_and_owner_scope(self):
        payload = {
            "client_name": "Client One",
            "client_email": "client@example.com",
            "issue_date": str(date(2026, 1, 3)),
            "currency": "INR",
            "tax_percent": "0.00",
            "status": "draft",
            "items": [{"name": "Work A", "quantity": 1, "unit_price": "100.00"}],
        }
        create_response = self.client.post("/api/v1/invoices/", payload, format="json")
        invoice_id = create_response.data["data"]["id"]

        pdf_response = self.client.get(f"/api/v1/invoices/{invoice_id}/pdf/")
        self.assertEqual(pdf_response.status_code, 200)
        self.assertEqual(pdf_response["Content-Type"], "application/pdf")

        self.client.force_authenticate(self.other)
        forbidden_response = self.client.get(f"/api/v1/invoices/{invoice_id}/")
        self.assertEqual(forbidden_response.status_code, 404)
