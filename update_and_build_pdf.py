import re

with open("generate_pdf.py", "r", encoding="utf-8") as f:
    code = f.read()

# Insert the chain of custody diagram right after architecture section
insertion = """
    if os.path.exists("assets/chain_of_custody_flow.png"):
        story.append(Paragraph("End-to-End Value Chain Custody & Data Integrity:", h2_style))
        img_coc = Image("assets/chain_of_custody_flow.png", width=6.8*inch, height=2.78*inch)
        story.append(img_coc)
        story.append(Spacer(1, 10))
"""

if "chain_of_custody_flow.png" not in code:
    code = code.replace('story.append(Paragraph("• <b>Enterprise & Compliance Layer:</b>', insertion + '\n    story.append(Paragraph("• <b>Enterprise & Compliance Layer:</b>')

# Insert the hardware schematic right before hardware specs table
hw_insert = """
    if os.path.exists("assets/hardware_schematic.png"):
        img_hw = Image("assets/hardware_schematic.png", width=6.8*inch, height=3.26*inch)
        story.append(img_hw)
        story.append(Spacer(1, 10))
"""
if "hardware_schematic.png" not in code:
    code = code.replace('hw_specs = [', hw_insert + '\n    hw_specs = [')

with open("generate_pdf.py", "w", encoding="utf-8") as f:
    f.write(code)

print("Updated generate_pdf.py with new evaluator diagrams")
