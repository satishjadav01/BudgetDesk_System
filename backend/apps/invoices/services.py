from datetime import date
from decimal import Decimal, ROUND_HALF_UP

from django.db.models import Max

from .models import Invoice


def quantize(value):
    return Decimal(value).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)


def generate_invoice_number():
    year = date.today().year
    prefix = f"INV-{year}-"
    latest = (
        Invoice.objects.filter(invoice_number__startswith=prefix)
        .aggregate(max_number=Max("invoice_number"))
        .get("max_number")
    )
    if not latest:
        return f"{prefix}000001"
    try:
        counter = int(latest.split("-")[-1]) + 1
    except (ValueError, IndexError):
        counter = 1
    return f"{prefix}{counter:06d}"


def calculate_totals(items, tax_percent):
    subtotal = Decimal("0.00")
    normalized_items = []
    for item in items:
        quantity = int(item["quantity"])
        unit_price = quantize(item["unit_price"])
        line_total = quantize(quantity * unit_price)
        subtotal += line_total
        normalized_items.append(
            {
                "name": item["name"],
                "quantity": quantity,
                "unit_price": unit_price,
                "line_total": line_total,
            }
        )
    subtotal = quantize(subtotal)
    tax_rate = quantize(tax_percent) / Decimal("100.00")
    tax_amount = quantize(subtotal * tax_rate)
    total = quantize(subtotal + tax_amount)
    return normalized_items, subtotal, tax_amount, total
