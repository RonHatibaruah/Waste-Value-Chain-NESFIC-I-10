with open("build_full_evaluator_pdf.py", "r", encoding="utf-8") as f:
    code = f.read()

# 1. Insert admin_rbac_architecture in Section 1
rbac_code = """
    if os.path.exists("assets/admin_rbac_architecture.png"):
        story.append(Paragraph("Role-Based Access Control (RBAC) & Governance Matrix:", h2_style))
        img_rbac = Image("assets/admin_rbac_architecture.png", width=6.8*inch, height=3.1*inch)
        story.append(img_rbac)
        story.append(Spacer(1, 8))
"""
if "assets/admin_rbac_architecture.png" not in code:
    code = code.replace('story.append(Paragraph("2. End-to-End Value Chain Flow', rbac_code + '\n    story.append(Paragraph("2. End-to-End Value Chain Flow')

# 2. Insert dbt_financial_pipeline in Section 4
dbt_code = """
    if os.path.exists("assets/dbt_financial_pipeline.png"):
        story.append(Paragraph("Direct Benefit Transfer (DBT) & Automated Worker Settlement Flow:", h2_style))
        img_dbt = Image("assets/dbt_financial_pipeline.png", width=6.8*inch, height=2.9*inch)
        story.append(img_dbt)
        story.append(Spacer(1, 8))
"""
if "assets/dbt_financial_pipeline.png" not in code:
    code = code.replace('story.append(Paragraph("5. Guwahati Geospatial Terrain', dbt_code + '\n    story.append(Paragraph("5. Guwahati Geospatial Terrain')

# 3. Insert cv_conveyor_inspection in Section 6
cv_code = """
    if os.path.exists("assets/cv_conveyor_inspection.png"):
        story.append(Paragraph("Edge Computer Vision (YOLOv8) Conveyor Purity Screening HUD:", h2_style))
        img_cv = Image("assets/cv_conveyor_inspection.png", width=6.8*inch, height=3.1*inch)
        story.append(img_cv)
        story.append(Spacer(1, 8))
"""
if "assets/cv_conveyor_inspection.png" not in code:
    code = code.replace('story.append(Paragraph("7. Field Validation Metrics', cv_code + '\n    story.append(Paragraph("7. Field Validation Metrics')

with open("build_full_evaluator_pdf.py", "w", encoding="utf-8") as f:
    f.write(code)

print("Updated build_full_evaluator_pdf.py with all 3 extra diagrams!")
