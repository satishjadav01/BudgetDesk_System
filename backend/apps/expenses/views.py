from rest_framework import permissions, viewsets
from rest_framework.response import Response

from .filters import ExpenseFilter
from .models import Expense
from .serializers import ExpenseSerializer


class ExpenseViewSet(viewsets.ModelViewSet):
    serializer_class = ExpenseSerializer
    permission_classes = [permissions.IsAuthenticated]
    filterset_class = ExpenseFilter
    search_fields = ["title", "category"]
    ordering_fields = ["expense_date", "created_at", "amount"]

    def get_queryset(self):
        return Expense.objects.filter(owner=self.request.user)

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)

    def list(self, request, *args, **kwargs):
        response = super().list(request, *args, **kwargs)
        return Response({"success": True, "data": response.data})

    def retrieve(self, request, *args, **kwargs):
        response = super().retrieve(request, *args, **kwargs)
        return Response({"success": True, "data": response.data})

    def create(self, request, *args, **kwargs):
        response = super().create(request, *args, **kwargs)
        return Response({"success": True, "message": "Expense created.", "data": response.data}, status=201)

    def update(self, request, *args, **kwargs):
        response = super().update(request, *args, **kwargs)
        return Response({"success": True, "message": "Expense updated.", "data": response.data})

    def destroy(self, request, *args, **kwargs):
        super().destroy(request, *args, **kwargs)
        return Response({"success": True, "message": "Expense deleted."})
