import io
from typing import Any
from datetime import datetime
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.lib.units import inch
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle

class PDFReportGenerator:
    @staticmethod
    def build_report_pdf(report_data: Any) -> io.BytesIO:
        """
        Build a publication-quality PDF report using ReportLab Flowables.
        """
        buffer = io.BytesIO()
        doc = SimpleDocTemplate(
            buffer,
            pagesize=letter,
            rightMargin=54,
            leftMargin=54,
            topMargin=54,
            bottomMargin=54
        )

        styles = getSampleStyleSheet()
        
        # Define premium custom color scheme (Indigo & Charcoal)
        primary_color = colors.HexColor("#4f46e5")   # Indigo
        secondary_color = colors.HexColor("#0f172a") # Dark Slate
        text_color = colors.HexColor("#334155")      # Muted slate
        border_color = colors.HexColor("#e2e8f0")    # Cool light border

        # Custom paragraph styles
        title_style = ParagraphStyle(
            "DocTitle",
            parent=styles["Title"],
            fontName="Helvetica-Bold",
            fontSize=24,
            leading=28,
            textColor=primary_color,
            alignment=0, # Left-aligned
            spaceAfter=15
        )
        
        h1_style = ParagraphStyle(
            "SectionH1",
            parent=styles["Heading1"],
            fontName="Helvetica-Bold",
            fontSize=14,
            leading=18,
            textColor=secondary_color,
            spaceBefore=12,
            spaceAfter=8,
            keepWithNext=True
        )

        body_style = ParagraphStyle(
            "DocBody",
            parent=styles["BodyText"],
            fontName="Helvetica",
            fontSize=10,
            leading=14,
            textColor=text_color,
            spaceAfter=10
        )

        meta_style = ParagraphStyle(
            "MetaText",
            parent=styles["Normal"],
            fontName="Helvetica",
            fontSize=9,
            leading=12,
            textColor=colors.HexColor("#64748b")
        )

        story = []

        # 1. Document Header
        story.append(Paragraph("BIZNEST LOCATION INTELLIGENCE REPORT", title_style))
        story.append(Paragraph(f"Generated on {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}", meta_style))
        story.append(Spacer(1, 15))

        # 2. Metadata Parameter Block Table
        meta_data = [
            [
                Paragraph(f"<b>Business Type:</b> {report_data.business_type.upper()}", body_style),
                Paragraph(f"<b>Investment Budget:</b> INR {report_data.budget:,.2f}", body_style)
            ],
            [
                Paragraph(f"<b>Coordinates:</b> ({report_data.latitude:.6f}, {report_data.longitude:.6f})", body_style),
                Paragraph(f"<b>Assessment Title:</b> {report_data.title}", body_style)
            ]
        ]
        meta_table = Table(meta_data, colWidths=[3.2*inch, 3.2*inch])
        meta_table.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,-1), colors.HexColor("#f8fafc")),
            ('PADDING', (0,0), (-1,-1), 10),
            ('BOX', (0,0), (-1,-1), 1, border_color),
            ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ]))
        story.append(meta_table)
        story.append(Spacer(1, 20))

        # 3. Score Breakdown Section
        story.append(Paragraph("1. Business Potential Score Breakdown", h1_style))
        
        breakdown = report_data.score_breakdown
        score_data = [
            [Paragraph("<b>Metric Dimension</b>", body_style), Paragraph("<b>Normalized Rating (0-100)</b>", body_style)]
        ]
        for key, value in breakdown.items():
            score_data.append([
                Paragraph(key.capitalize(), body_style),
                Paragraph(f"<b>{value}</b>", body_style)
            ])
            
        score_table = Table(score_data, colWidths=[3.5*inch, 2.9*inch])
        score_table.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,0), colors.HexColor("#e0e7ff")),
            ('PADDING', (0,0), (-1,-1), 8),
            ('LINEBELOW', (0,0), (-1,-1), 0.5, border_color),
            ('LINEBELOW', (0,0), (-1,0), 1.5, primary_color),
            ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ]))
        story.append(score_table)
        story.append(Spacer(1, 20))

        # 4. Business Summary & AI Explanations
        story.append(Paragraph("2. Strategic Rationale & Analysis", h1_style))
        rec = report_data.recommendations
        story.append(Paragraph(rec.get("business_explanation", ""), body_style))
        story.append(Spacer(1, 10))

        # Pros & Cons Tables
        pros = rec.get("pros", [])
        cons = rec.get("cons", [])
        suggestions = rec.get("suggestions", [])

        story.append(Paragraph("<b>Strengths (Pros):</b>", body_style))
        for p in pros:
            story.append(Paragraph(f"• {p}", body_style))
        story.append(Spacer(1, 10))

        story.append(Paragraph("<b>Weaknesses (Cons):</b>", body_style))
        for c in cons:
            story.append(Paragraph(f"• {c}", body_style))
        story.append(Spacer(1, 10))

        story.append(Paragraph("<b>Strategic suggestions:</b>", body_style))
        for s in suggestions:
            story.append(Paragraph(f"• {s}", body_style))
        story.append(Spacer(1, 20))

        # 5. Nearby Competitors Page
        story.append(PageBreak())
        story.append(Paragraph("3. Local Competition Analysis", h1_style))
        story.append(Paragraph("Top competitors identified in OSM target radius search:", body_style))
        story.append(Spacer(1, 10))

        comp_data = [
            [Paragraph("<b>Name</b>", body_style), Paragraph("<b>Category</b>", body_style), Paragraph("<b>Rating</b>", body_style)]
        ]
        
        # Loop top 15 competitors
        for item in report_data.competitors_metadata[:15]:
            comp_data.append([
                Paragraph(item.get("name", "Competitor"), body_style),
                Paragraph(item.get("category", "Retail"), body_style),
                Paragraph(f"★ {item.get('rating', 4.0):.1f}", body_style)
            ])

        comp_table = Table(comp_data, colWidths=[3.2*inch, 1.8*inch, 1.4*inch])
        comp_table.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,0), colors.HexColor("#f1f5f9")),
            ('PADDING', (0,0), (-1,-1), 6),
            ('LINEBELOW', (0,0), (-1,-1), 0.5, border_color),
            ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ]))
        story.append(comp_table)

        doc.build(story)
        buffer.seek(0)
        return buffer
