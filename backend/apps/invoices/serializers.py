from rest_framework import serializers

from .models import Invoice, InvoiceItem
from .services import calculate_totals, generate_invoice_number


class InvoiceItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = InvoiceItem
        fields = ("id", "name", "quantity", "unit_price", "line_total")
        read_only_fields = ("id", "line_total")


class InvoiceSerializer(serializers.ModelSerializer):
    items = InvoiceItemSerializer(many=True)

    class Meta:
        model = Invoice
        fields = (
            "id",
            "invoice_number",
            "client_name",
            "client_email",
            "issue_date",
            "due_date",
            "currency",
            "tax_percent",
            "subtotal",
            "tax_amount",
            "total_amount",
            "status",
            "notes",
            "items",
            "created_at",
            "updated_at",
        )
        read_only_fields = (
            "id",
            "invoice_number",
            "subtotal",
            "tax_amount",
            "total_amount",
            "created_at",
            "updated_at",
        )

    def validate_items(self, value):
        if not value:
            raise serializers.ValidationError("At least one invoice item is required.")
        for item in value:
            if item["quantity"] <= 0:
                raise serializers.ValidationError("Item quantity must be greater than 0.")
            if item["unit_price"] <= 0:
                raise serializers.ValidationError("Item price must be greater than 0.")
        return value

    def create(self, validated_data):
        items = validated_data.pop("items")
        owner = self.context["request"].user
        normalized_items, subtotal, tax_amount, total = calculate_totals(items, validated_data.get("tax_percent", 0))
        invoice = Invoice.objects.create(
            owner=owner,
            invoice_number=generate_invoice_number(),
            subtotal=subtotal,
            tax_amount=tax_amount,
            total_amount=total,
            **validated_data,
        )
        InvoiceItem.objects.bulk_create([InvoiceItem(invoice=invoice, **item) for item in normalized_items])
        return invoice

    def update(self, instance, validated_data):
        items = validated_data.pop("items", None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)

        if items is not None:
            normalized_items, subtotal, tax_amount, total = calculate_totals(items, instance.tax_percent)
            instance.subtotal = subtotal
            instance.tax_amount = tax_amount
            instance.total_amount = total
            instance.items.all().delete()
            InvoiceItem.objects.bulk_create([InvoiceItem(invoice=instance, **item) for item in normalized_items])
        else:
            normalized_items, subtotal, tax_amount, total = calculate_totals(
                [{"name": i.name, "quantity": i.quantity, "unit_price": i.unit_price} for i in instance.items.all()],
                instance.tax_percent,
            )
            instance.subtotal = subtotal
            instance.tax_amount = tax_amount
            instance.total_amount = total
            instance.items.all().update(line_total=0)
            for existing, normalized in zip(instance.items.all(), normalized_items):
                existing.line_total = normalized["line_total"]
                existing.save(update_fields=["line_total"])

        instance.save()
        return instance
