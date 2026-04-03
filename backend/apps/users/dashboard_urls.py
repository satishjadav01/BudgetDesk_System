from django.urls import path

from .views import DashboardSummaryView, MonthlyMetricsView

urlpatterns = [
    path("summary/", DashboardSummaryView.as_view(), name="dashboard-summary"),
    path("monthly/", MonthlyMetricsView.as_view(), name="dashboard-monthly"),
]
