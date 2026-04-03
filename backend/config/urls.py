from django.contrib import admin
from django.urls import include, path

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/v1/auth/", include("apps.users.urls")),
    path("api/v1/invoices/", include("apps.invoices.urls")),
    path("api/v1/expenses/", include("apps.expenses.urls")),
    path("api/v1/dashboard/", include("apps.users.dashboard_urls")),
]
