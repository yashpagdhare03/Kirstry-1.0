"""
Invoice PDF generation service using ReportLab.
Uploads generated PDFs to Supabase Storage bucket 'invoices'.
"""

import io
from typing import Dict, Any, Optional
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib import colors
from app.utils import get_supabase_client


def generate_invoice_pdf(sale_data: Dict[str, Any], store_name: str = "Kirana Store") -> bytes:
    """
    Generates a clean styled PDF invoice byte stream using ReportLab.
    """
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=letter,
        rightMargin=36,
        leftMargin=36,
        topMargin=36,
        bottomMargin=36,
    )

    styles = getSampleStyleSheet()
    title_style = ParagraphStyle(
        "InvoiceTitle",
        parent=styles["Heading1"],
        fontName="Helvetica-Bold",
        fontSize=20,
        leading=24,
        textColor=colors.HexColor("#0F172A"),
    )
    meta_style = ParagraphStyle(
        "InvoiceMeta",
        parent=styles["Normal"],
        fontName="Helvetica",
        fontSize=10,
        leading=14,
        textColor=colors.HexColor("#475569"),
    )
    bold_style = ParagraphStyle(
        "BoldText",
        parent=styles["Normal"],
        fontName="Helvetica-Bold",
        fontSize=10,
        leading=14,
    )

    elements = []

    # 1. Header: Store Name & Invoice Metadata
    inv_num = sale_data.get("invoice_number", "INV-0000")
    created_at = str(sale_data.get("created_at", ""))[:19].replace("T", " ")
    payment_mode = str(sale_data.get("payment_mode", "cash")).upper()

    header_data = [
        [
            Paragraph(f"<b>{store_name}</b><br/>Tax Invoice", title_style),
            Paragraph(
                f"<b>Invoice #:</b> {inv_num}<br/>"
                f"<b>Date:</b> {created_at}<br/>"
                f"<b>Payment Mode:</b> {payment_mode}",
                meta_style,
            ),
        ]
    ]
    header_table = Table(header_data, colWidths=[300, 240])
    header_table.setStyle(
        TableStyle([
            ("VALIGN", (0, 0), (-1, -1), "TOP"),
            ("ALIGN", (1, 0), (1, 0), "RIGHT"),
        ])
    )
    elements.append(header_table)
    elements.append(Spacer(1, 15))

    # 2. Line Items Table
    table_content = [
        [
            Paragraph("<b>#</b>", bold_style),
            Paragraph("<b>Item Name</b>", bold_style),
            Paragraph("<b>Qty</b>", bold_style),
            Paragraph("<b>Unit Price (₹)</b>", bold_style),
            Paragraph("<b>Total (₹)</b>", bold_style),
        ]
    ]

    items = sale_data.get("items", []) or sale_data.get("sale_items", [])
    for idx, item in enumerate(items, 1):
        pname = item.get("products", {}).get("name") if isinstance(item.get("products"), dict) else item.get("product_name", f"Item {idx}")
        qty = item.get("quantity", 1)
        uprice = float(item.get("unit_price", 0.0))
        tprice = float(item.get("total_price", qty * uprice))

        table_content.append([
            str(idx),
            Paragraph(str(pname), meta_style),
            str(qty),
            f"{uprice:.2f}",
            f"{tprice:.2f}",
        ])

    items_table = Table(table_content, colWidths=[30, 270, 60, 90, 90])
    items_table.setStyle(
        TableStyle([
            ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#F1F5F9")),
            ("TEXTCOLOR", (0, 0), (-1, 0), colors.HexColor("#0F172A")),
            ("ALIGN", (2, 0), (-1, -1), "RIGHT"),
            ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
            ("TOPPADDING", (0, 0), (-1, -1), 6),
            ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#E2E8F0")),
        ])
    )
    elements.append(items_table)
    elements.append(Spacer(1, 15))

    # 3. Totals Summary Table
    subtotal = float(sale_data.get("subtotal", sale_data.get("total_amount", 0.0)))
    discount = float(sale_data.get("discount", 0.0))
    total_amount = float(sale_data.get("total_amount", subtotal - discount))

    summary_data = [
        ["Subtotal:", f"₹ {subtotal:.2f}"],
        ["Discount:", f"- ₹ {discount:.2f}"],
        ["Grand Total:", f"₹ {total_amount:.2f}"],
    ]
    summary_table = Table(summary_data, colWidths=[420, 120])
    summary_table.setStyle(
        TableStyle([
            ("ALIGN", (0, 0), (-1, -1), "RIGHT"),
            ("FONTNAME", (0, 2), (-1, 2), "Helvetica-Bold"),
            ("TEXTCOLOR", (0, 2), (-1, 2), colors.HexColor("#0F172A")),
            ("LINEABOVE", (0, 2), (-1, 2), 1, colors.HexColor("#0F172A")),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
            ("TOPPADDING", (0, 0), (-1, -1), 4),
        ])
    )
    elements.append(summary_table)
    elements.append(Spacer(1, 25))

    # 4. Footer Note
    footer_p = Paragraph(
        "<para align='center'><b>Thank you for shopping with us!</b><br/>"
        "For any inquiries, please contact your store.</para>",
        meta_style,
    )
    elements.append(footer_p)

    doc.build(elements)
    pdf_bytes = buffer.getvalue()
    buffer.close()
    return pdf_bytes


def upload_invoice_pdf(sale_id: str, pdf_bytes: bytes, bucket_name: str = "invoices") -> str:
    """
    Uploads invoice PDF bytes to Supabase Storage bucket 'invoices'.
    Returns public URL string.
    """
    supabase = get_supabase_client()
    storage_path = f"invoices/{sale_id}.pdf"

    try:
        supabase.storage.from_(bucket_name).upload(
            path=storage_path,
            file=pdf_bytes,
            file_options={"content-type": "application/pdf", "upsert": "true"},
        )
    except Exception:
        pass

    return supabase.storage.from_(bucket_name).get_public_url(storage_path)
