from datetime import date

from django.contrib.auth import get_user_model
from rest_framework.test import APITestCase

User = get_user_model()


class ExpenseTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(email="owner@example.com", full_name="Owner", password="Password123")
        self.client.force_authenticate(self.user)

    def test_filter_by_category_and_month(self):
        self.client.post(
            "/api/v1/expenses/",
            {
                "title": "Travel ticket",
                "amount": "500.00",
                "category": "Travel",
                "expense_date": str(date(2026, 2, 11)),
            },
            format="json",
        )
        self.client.post(
            "/api/v1/expenses/",
            {
                "title": "Office chair",
                "amount": "300.00",
                "category": "Office",
                "expense_date": str(date(2026, 3, 5)),
            },
            format="json",
        )

        response = self.client.get("/api/v1/expenses/?category=Travel&month=2")
        self.assertEqual(response.status_code, 200)
        results = response.data["data"]["results"]
        self.assertEqual(len(results), 1)
        self.assertEqual(results[0]["category"], "Travel")
