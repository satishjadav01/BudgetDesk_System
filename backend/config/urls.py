from django.http import JsonResponse
from django.contrib import admin
from django.urls import include, path


def healthcheck(_request):
    return JsonResponse({"success": True, "status": "ok"})


urlpatterns = [
    path("", healthcheck),
    path("health/", healthcheck),
    path("admin/", admin.site.urls),
    path("api/v1/auth/", include("apps.users.urls")),
    path("api/v1/invoices/", include("apps.invoices.urls")),
    path("api/v1/expenses/", include("apps.expenses.urls")),
    path("api/v1/dashboard/", include("apps.users.dashboard_urls")),
]
