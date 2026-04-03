from io import BytesIO

from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.platypus import Paragraph, SimpleDocTemplate, Spacer, Table, TableStyle


def build_invoice_pdf(invoice):
    buffer = BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=A4)
    styles = getSampleStyleSheet()

    content = [
        Paragraph(f"Invoice #{invoice.invoice_number}", styles["Title"]),
        Spacer(1, 12),
        Paragraph(f"Client: {invoice.client_name}", styles["Normal"]),
        Paragraph(f"Email: {invoice.client_email}", styles["Normal"]),
        Paragraph(f"Issue Date: {invoice.issue_date}", styles["Normal"]),
        Paragraph(f"Due Date: {invoice.due_date or '-'}", styles["Normal"]),
        Spacer(1, 12),
    ]

    rows = [["Item", "Qty", "Unit Price", "Line Total"]]
    for item in invoice.items.all():
        rows.append([item.name, str(item.quantity), f"{item.unit_price}", f"{item.line_total}"])

    table = Table(rows, hAlign="LEFT")
    table.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#1F2937")),
                ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
                ("GRID", (0, 0), (-1, -1), 0.5, colors.grey),
                ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
                ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.whitesmoke, colors.lightgrey]),
            ]
        )
    )
    content.append(table)
    content.append(Spacer(1, 14))
    content.append(Paragraph(f"Subtotal: {invoice.subtotal} {invoice.currency}", styles["Normal"]))
    content.append(Paragraph(f"Tax ({invoice.tax_percent}%): {invoice.tax_amount} {invoice.currency}", styles["Normal"]))
    content.append(Paragraph(f"Total: {invoice.total_amount} {invoice.currency}", styles["Heading2"]))
    if invoice.notes:
        content.append(Spacer(1, 8))
        content.append(Paragraph(f"Notes: {invoice.notes}", styles["Normal"]))

    doc.build(content)
    pdf = buffer.getvalue()
    buffer.close()
    return pdf
