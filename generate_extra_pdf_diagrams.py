import os
os.environ['MPLCONFIGDIR'] = '/tmp/matplotlib'
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import matplotlib.patches as patches

plt.rcParams['font.sans-serif'] = 'Helvetica', 'DejaVu Sans', 'Arial'
plt.rcParams['figure.facecolor'] = 'white'

# 1. Admin Console & RBAC Architecture Diagram
fig, ax = plt.subplots(figsize=(10.5, 4.8), facecolor='white')
ax.axis('off')

roles = [
    {"role": "Super Admin\n(PRIDE & GMC)", "access": "Full System Governance\n• Price Index Master\n• Fleet Allocation\n• User Role Provisioning\n• CPCB Token Approvals", "color": "#EFF6FF", "border": "#1E40AF", "x": 0.02},
    {"role": "MRF Facility Manager\n(Boragaon/Nalbari)", "access": "Operational Hub\n• Scale RS-232 Ingestion\n• Baled Stock Inventory\n• AI Quality Override\n• Thermal Slip Dispatch", "color": "#F0FDF4", "border": "#15803D", "x": 0.27},
    {"role": "Municipal / ASPCB\nAuditor", "access": "Regulatory Compliance\n• Live GIS Command Heatmap\n• Mass-Balance Verification\n• Form VI e-Manifests\n• Landfill Diversion KPIs", "color": "#FEF3C7", "border": "#B45309", "x": 0.52},
    {"role": "Safai Sathi / PRIDE\nDriver Member", "access": "Grassroots Mobile PWA\n• Geofenced Beat Navigation\n• Assamese Voice Receipts\n• Instant DBT Bank Credit\n• Attendance & Welfare", "color": "#FAF5FF", "border": "#7E22CE", "x": 0.77}
]

for r in roles:
    rect = patches.FancyBboxPatch((r["x"], 0.12), 0.21, 0.76, boxstyle="round,pad=0.01", facecolor=r["color"], edgecolor=r["border"], linewidth=2)
    ax.add_patch(rect)
    ax.text(r["x"] + 0.105, 0.78, r["role"], fontsize=9.5, fontweight='bold', color=r["border"], ha='center', va='center')
    ax.text(r["x"] + 0.02, 0.38, r["access"], fontsize=8, color='#1E293B', linespacing=1.5)

ax.set_title("PRIDE WasteOS: Role-Based Access Control (RBAC) Governance Architecture", fontsize=11, fontweight='bold', pad=12, color='#0F172A')
plt.tight_layout()
plt.savefig("assets/admin_rbac_architecture.png", dpi=250, bbox_inches='tight')
plt.close()
print("Generated assets/admin_rbac_architecture.png")

# 2. Direct Benefit Transfer (DBT) Financial Pipeline
fig, ax = plt.subplots(figsize=(10.5, 4.5), facecolor='white')
ax.axis('off')

steps = [
    {"step": "Step 1: Auto Weighment", "sub": "Scale Indicator Tap", "desc": "RS-232 captures 470kg\nAutomated tare reduction\nZero manual tampering", "x": 0.02, "col": "#2563EB", "bg": "#EFF6FF"},
    {"step": "Step 2: Coop Price Engine", "sub": "Standardized Index", "desc": "Live master rate applied\n(e.g. ₹26.00/kg PET)\nGross payout: ₹12,220.00", "x": 0.27, "col": "#0D9488", "bg": "#F0FDF4"},
    {"step": "Step 3: Vernacular Ack", "sub": "Audio & SMS Slip", "desc": "Assamese voice playback\nInstant SMS receipt\nAudit hash generated", "x": 0.52, "col": "#D97706", "bg": "#FEF3C7"},
    {"step": "Step 4: Direct Bank Credit", "sub": "NPCI / AePS Settlement", "desc": "Direct credit to SBI/AGVB\nAadhaar-linked payment\nZero middleman cuts", "x": 0.77, "col": "#7C3AED", "bg": "#FAF5FF"}
]

for s in steps:
    rect = patches.FancyBboxPatch((s["x"], 0.15), 0.21, 0.70, boxstyle="round,pad=0.01", facecolor=s["bg"], edgecolor=s["col"], linewidth=2)
    ax.add_patch(rect)
    ax.text(s["x"] + 0.105, 0.74, s["step"], fontsize=9.5, fontweight='bold', color=s["col"], ha='center')
    ax.text(s["x"] + 0.105, 0.65, s["sub"], fontsize=7.5, fontstyle='italic', color='#64748B', ha='center')
    ax.text(s["x"] + 0.02, 0.32, s["desc"], fontsize=8, color='#1E293B', linespacing=1.4)
    if s["x"] < 0.75:
        ax.annotate('', xy=(s["x"] + 0.26, 0.50), xytext=(s["x"] + 0.21, 0.50),
                    arrowprops=dict(facecolor=s["col"], edgecolor=s["col"], width=2, headwidth=6))

ax.set_title("PRIDE WasteOS: Safai Sathi Direct Benefit Transfer (DBT) Payout Pipeline", fontsize=11, fontweight='bold', pad=12, color='#0F172A')
plt.tight_layout()
plt.savefig("assets/dbt_financial_pipeline.png", dpi=250, bbox_inches='tight')
plt.close()
print("Generated assets/dbt_financial_pipeline.png")

# 3. Edge Computer Vision Quality Inspection HUD
fig, ax = plt.subplots(figsize=(10.5, 4.8), facecolor='white')
ax.axis('off')

# Conveyor frame
conveyor = patches.FancyBboxPatch((0.05, 0.10), 0.50, 0.80, boxstyle="round,pad=0.01", facecolor='#0F172A', edgecolor='#334155', linewidth=2)
ax.add_patch(conveyor)
ax.text(0.30, 0.84, "BORAGAON MRF CONVEYOR CAMERA #02 (YOLOv8-NANO)", fontsize=8, fontweight='bold', color='#38BDF8', ha='center')

# AI Bounding Boxes
bb1 = patches.Rectangle((0.10, 0.45), 0.16, 0.28, fill=False, edgecolor='#22C55E', linewidth=2)
ax.add_patch(bb1)
ax.text(0.11, 0.70, "PET_BOTTLE: 95.4%", fontsize=7, fontweight='bold', color='white', bbox=dict(boxstyle="square,pad=0.2", facecolor='#22C55E'))

bb2 = patches.Rectangle((0.32, 0.30), 0.18, 0.35, fill=False, edgecolor='#06B6D4', linewidth=2)
ax.add_patch(bb2)
ax.text(0.33, 0.62, "HDPE_CONTAINER: 92.1%", fontsize=7, fontweight='bold', color='white', bbox=dict(boxstyle="square,pad=0.2", facecolor='#06B6D4'))

bb3 = patches.Rectangle((0.15, 0.18), 0.12, 0.18, fill=False, edgecolor='#EF4444', linewidth=2)
ax.add_patch(bb3)
ax.text(0.16, 0.33, "CONTAMINANT: 86.8%", fontsize=7, fontweight='bold', color='white', bbox=dict(boxstyle="square,pad=0.2", facecolor='#EF4444'))

# Side Quality Metrics HUD
hud = patches.FancyBboxPatch((0.60, 0.10), 0.36, 0.80, boxstyle="round,pad=0.01", facecolor='#F8FAFC', edgecolor='#CBD5E1', linewidth=1.5)
ax.add_patch(hud)
ax.text(0.78, 0.83, "INSPECTION METRICS & PURITY HUD", fontsize=8.5, fontweight='bold', color='#1E3A8A', ha='center')

metrics = [
    ("Batch Purity Grade:", "GRADE A (98.1% Clean)", "#15803D"),
    ("Moisture Index:", "1.2% (Permissible < 3%)", "#0D9488"),
    ("Foreign Organic Mass:", "0.7% (Auto-Rejected)", "#2563EB"),
    ("Color Homogeneity:", "96.4% Transparent Clear", "#D97706"),
    ("Sorting Conveyor Speed:", "0.45 m/s (Optimal)", "#475569")
]

y_pos = 0.70
for k, v, col in metrics:
    ax.text(0.63, y_pos, k, fontsize=8, color='#64748B')
    ax.text(0.63, y_pos - 0.045, v, fontsize=8.5, fontweight='bold', color=col)
    y_pos -= 0.11

ax.set_title("PRIDE WasteOS: Edge Computer Vision (YOLOv8) Recyclable Purity Screening HUD", fontsize=11, fontweight='bold', pad=12, color='#0F172A')
plt.tight_layout()
plt.savefig("assets/cv_conveyor_inspection.png", dpi=250, bbox_inches='tight')
plt.close()
print("Generated assets/cv_conveyor_inspection.png")
