import os
os.environ['MPLCONFIGDIR'] = '/tmp/matplotlib'
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import numpy as np

# Set general aesthetic styling
plt.rcParams['font.sans-serif'] = 'Helvetica', 'DejaVu Sans', 'Arial'
plt.rcParams['axes.edgecolor'] = '#CBD5E1'
plt.rcParams['axes.linewidth'] = 0.8

# -------------------------------------------------------------
# 1. Budget Allocation Chart (Donut Chart)
# -------------------------------------------------------------
fig, ax = plt.subplots(figsize=(8, 5.5), subplot_kw=dict(aspect="equal"))
categories = [
    'Technical Engineering\nTeam Cost (₹20.0L / 50%)',
    'Field Hardware &\nIoT Devices (₹6.5L / 16.25%)',
    'Cloud Infra, GIS &\nPipelines (₹4.5L / 11.25%)',
    'Pilot Validation &\nTraining (₹4.0L / 10%)',
    'Security Audits, VAPT\n& Legal (₹2.5L / 6.25%)',
    'Contingency & Overheads\n(₹2.5L / 6.25%)'
]
amounts = [20.0, 6.5, 4.5, 4.0, 2.5, 2.5]
colors = ['#1E3A8A', '#0D9488', '#0284C7', '#F59E0B', '#DC2626', '#64748B']
explode = (0.05, 0.02, 0.02, 0.02, 0.02, 0.02)

wedges, texts, autotexts = ax.pie(
    amounts, 
    labels=categories, 
    autopct='%1.1f%%',
    pctdistance=0.8,
    startangle=140,
    colors=colors,
    explode=explode,
    textprops=dict(color="#1E293B", fontsize=9, weight="bold")
)

# Draw circle for donut
centre_circle = plt.Circle((0,0), 0.60, fc='white')
fig.gca().add_artist(centre_circle)

# Center text
ax.text(0, 0.08, 'TOTAL GRANT', ha='center', va='center', fontsize=11, fontweight='bold', color='#64748B')
ax.text(0, -0.08, '₹40.00 LACS', ha='center', va='center', fontsize=16, fontweight='heavy', color='#1E3A8A')

plt.setp(autotexts, size=8.5, weight="bold", color="white")
ax.set_title("PRIDE WasteOS: Indicative Budget & Resource Allocation (₹40.00 Lakhs)", fontsize=12, fontweight='bold', pad=20, color='#0F172A')

plt.tight_layout()
plt.savefig("assets/budget_allocation.png", dpi=250, bbox_inches='tight')
plt.close()
print("Generated assets/budget_allocation.png")

# -------------------------------------------------------------
# 2. Pilot Benchmark & Validation Metrics
# -------------------------------------------------------------
fig, ((ax1, ax2), (ax3, ax4)) = plt.subplots(2, 2, figsize=(10, 7))

# 2.1 Route Distance & Fuel Savings (Before vs After)
wards = ['Ward 12\n(Paltan Bazar)', 'Ward 24\n(Fancy Bazar)', 'Ward 36\n(Dispur)', 'Ward 48\n(Jalukbari)']
before_fuel = [18.5, 22.0, 19.5, 25.0]
after_fuel = [13.8, 16.2, 14.5, 18.9]
x = np.arange(len(wards))
width = 0.35

ax1.bar(x - width/2, before_fuel, width, label='Historical Baseline Beat', color='#94A3B8')
ax1.bar(x + width/2, after_fuel, width, label='PRIDE WasteOS Dynamic VRP', color='#0D9488')
ax1.set_ylabel('Fuel Consumed (Litres / Shift)', fontsize=9, fontweight='bold')
ax1.set_title('Vehicle Fleet Fuel Consumption (24.8% Avg. Savings)', fontsize=10, fontweight='bold', color='#0F172A')
ax1.set_xticks(x)
ax1.set_xticklabels(wards, fontsize=8)
ax1.legend(fontsize=8)
ax1.grid(axis='y', linestyle='--', alpha=0.5)

# 2.2 Weighbridge Transaction Latency
stages = ['Manual Log\n(Legacy)', 'Semi-Digital\n(Scanner only)', 'PRIDE IoT\nBridge (Target)']
times = [180, 45, 3.2]
colors_bar = ['#EF4444', '#F59E0B', '#10B981']
bars = ax2.bar(stages, times, color=colors_bar, width=0.5)
ax2.set_ylabel('Time per Vehicle Intake (Seconds)', fontsize=9, fontweight='bold')
ax2.set_title('MRF Ingestion Throughput Speed (<3.5s per weighment)', fontsize=10, fontweight='bold', color='#0F172A')
for bar in bars:
    yval = bar.get_height()
    ax2.text(bar.get_x() + bar.get_width()/2, yval + 3, f"{yval}s", ha='center', va='bottom', fontsize=8, fontweight='bold')
ax2.grid(axis='y', linestyle='--', alpha=0.5)

# 2.3 Offline Queue Synchronization Recovery
intervals = ['1 hr', '2 hrs', '4 hrs', '8 hrs']
sync_fidelity = [100.0, 100.0, 100.0, 100.0]
ax3.plot(intervals, sync_fidelity, marker='o', color='#1E3A8A', linewidth=2.5, markersize=8)
ax3.set_ylabel('Data Packet Integrity (%)', fontsize=9, fontweight='bold')
ax3.set_xlabel('Simulated Cellular Blackout Duration', fontsize=9, fontweight='bold')
ax3.set_title('Offline-First PWA Synchronization Reliability (100% Zero-Loss)', fontsize=10, fontweight='bold', color='#0F172A')
ax3.set_ylim(95, 102)
for i, txt in enumerate(sync_fidelity):
    ax3.annotate(f"{txt}%", (intervals[i], sync_fidelity[i]+0.5), ha='center', fontsize=8, fontweight='bold', color='#1E3A8A')
ax3.grid(True, linestyle='--', alpha=0.5)

# 2.4 Plastic Fraction Recovery Breakdown
fractions = ['Rigid PET\nBottles', 'HDPE/PP\nContainers', 'Cardboard\n& Paper', 'Multilayer\nPlastics (MLP)', 'Metals']
recovery_pct = [34, 26, 20, 14, 6]
ax4.barh(fractions, recovery_pct, color=['#0284C7', '#0D9488', '#F59E0B', '#64748B', '#8B5CF6'])
ax4.set_xlabel('Recovery Volume Proportion (%)', fontsize=9, fontweight='bold')
ax4.set_title('Material Segregation Mix at PRIDE MRFs (Kamrup)', fontsize=10, fontweight='bold', color='#0F172A')
for index, value in enumerate(recovery_pct):
    ax4.text(value + 0.5, index, f"{value}%", va='center', fontsize=8, fontweight='bold')
ax4.grid(axis='x', linestyle='--', alpha=0.5)

plt.tight_layout()
plt.savefig("assets/pilot_benchmarks.png", dpi=250, bbox_inches='tight')
plt.close()
print("Generated assets/pilot_benchmarks.png")

# -------------------------------------------------------------
# 3. System Architecture Diagram (High Level)
# -------------------------------------------------------------
fig, ax = plt.subplots(figsize=(10, 6))
ax.axis('off')

# Layer boxes
layers = [
    {"name": "1. EDGE & IOT TELEMETRY LAYER", "color": "#E0F2FE", "border": "#0284C7", "y": 0.80, "items": ["PRIDE Bahan 4G/GPS Telemetry Dongles (AIS-140)", "Universal RS-232/RS-485 Weighbridge Serial Sniffer", "Offline PWA for Collectors (Assamese Audio / SQLite)"]},
    {"name": "2. INGESTION, MESSAGE QUEUE & DISPATCH LAYER", "color": "#CCFBF1", "border": "#0D9488", "y": 0.56, "items": ["MQTT / HTTPS Edge Ingestion Gateway (FastAPI / Fastify)", "Kafka / RabbitMQ Event Streaming & Buffering", "Terrain-Aware & Flood-Adaptive Dynamic Routing (OR-Tools)"]},
    {"name": "3. TRANSACTIONAL & SPATIAL DATA PLATFORM LAYER", "color": "#FEF3C7", "border": "#D97706", "y": 0.32, "items": ["PostgreSQL 16 with PostGIS Spatial Extension", "TimescaleDB for High-Frequency Telemetry", "YOLOv8 Edge Computer-Vision Purity Classifier", "MinIO S3-Compatible Encrypted Weighment Vault"]},
    {"name": "4. APPLICATION & REGULATORY INTEGRATION LAYER", "color": "#F3E8FF", "border": "#7E22CE", "y": 0.08, "items": ["Municipal Live GIS Command Center (GMC/ULBs)", "Cooperative Fair-Trade & Instant DBT Ledger (PRIDE)", "CPCB / ASPCB Auditable EPR Credit Certificate Engine", "Recycler B2B Manifest & Dispatch Marketplace"]}
]

for l in layers:
    # Outer rect
    rect = plt.Rectangle((0.02, l["y"]), 0.96, 0.20, facecolor=l["color"], edgecolor=l["border"], linewidth=2, transform=ax.transAxes, zorder=1)
    ax.add_patch(rect)
    # Header text
    ax.text(0.04, l["y"] + 0.155, l["name"], fontsize=10.5, fontweight='bold', color=l["border"], transform=ax.transAxes, zorder=2)
    # Sub items
    subtext = "   •   ".join(l["items"])
    ax.text(0.04, l["y"] + 0.065, subtext, fontsize=8.5, fontweight='bold', color='#1E293B', transform=ax.transAxes, zorder=2)

# Arrows between layers
ax.annotate('', xy=(0.5, 0.80), xytext=(0.5, 0.76), arrowprops=dict(facecolor='#0284C7', edgecolor='#0284C7', width=2, headwidth=8), transform=ax.transAxes)
ax.annotate('', xy=(0.5, 0.56), xytext=(0.5, 0.52), arrowprops=dict(facecolor='#0D9488', edgecolor='#0D9488', width=2, headwidth=8), transform=ax.transAxes)
ax.annotate('', xy=(0.5, 0.32), xytext=(0.5, 0.28), arrowprops=dict(facecolor='#D97706', edgecolor='#D97706', width=2, headwidth=8), transform=ax.transAxes)

ax.set_title("PRIDE WasteOS: End-to-End System & Data Flow Architecture", fontsize=12, fontweight='bold', pad=15, color='#0F172A')
plt.tight_layout()
plt.savefig("assets/architecture_diagram.png", dpi=250, bbox_inches='tight')
plt.close()
print("Generated assets/architecture_diagram.png")

# -------------------------------------------------------------
# 4. Wireframes & User Journey Flow Visual
# -------------------------------------------------------------
fig, ax = plt.subplots(figsize=(10, 5.2))
ax.axis('off')

steps = [
    {"title": "Step 1: Collection & Beat", "actor": "Safai Sathi / PRIDE Driver", "ui": "Offline PWA (Assamese UI)\n- Geofenced Beat Map\n- Voice Pickup Guidance\n- Daily Mileage & Fuel Tracker", "color": "#EFF6FF", "border": "#3B82F6", "x": 0.02},
    {"title": "Step 2: Automated Ingestion", "actor": "MRF Weighbridge Station", "ui": "Industrial Touch Console\n- Live RS-232 Gross/Net\n- AI Camera Purity Scan\n- Instant Bluetooth Slip", "color": "#ECFDF5", "border": "#10B981", "x": 0.27},
    {"title": "Step 3: Instant Settlement", "actor": "Worker Banking / Cooperative", "ui": "Fair-Trade Ledger\n- Standardized Price Index\n- Immediate DBT / UPI Credit\n- SMS/WhatsApp Receipt", "color": "#FEFCE8", "border": "#EAB308", "x": 0.52},
    {"title": "Step 4: Recycler & EPR", "actor": "CPCB / ASPCB / Recyclers", "ui": "State Regulatory Portal\n- Mass-Balance Tracking\n- QR-Coded EPR Mints\n- Form VI Electronic Manifest", "color": "#FAF5FF", "border": "#A855F7", "x": 0.77}
]

for s in steps:
    rect = plt.Rectangle((s["x"], 0.12), 0.21, 0.75, facecolor=s["color"], edgecolor=s["border"], linewidth=2, transform=ax.transAxes)
    ax.add_patch(rect)
    ax.text(s["x"] + 0.015, 0.78, s["title"], fontsize=9.5, fontweight='bold', color=s["border"], transform=ax.transAxes)
    ax.text(s["x"] + 0.015, 0.70, f"Actor: {s['actor']}", fontsize=7.5, fontstyle='italic', color='#475569', transform=ax.transAxes)
    ax.text(s["x"] + 0.015, 0.38, s["ui"], fontsize=8, fontweight='medium', color='#1E293B', transform=ax.transAxes)
    if s["x"] < 0.75:
        ax.annotate('', xy=(s["x"] + 0.26, 0.49), xytext=(s["x"] + 0.21, 0.49), arrowprops=dict(facecolor='#64748B', edgecolor='#64748B', width=1.5, headwidth=6), transform=ax.transAxes)

ax.set_title("PRIDE WasteOS: End-to-End Operational User Journey & Interface Touchpoints", fontsize=11, fontweight='bold', pad=15, color='#0F172A')
plt.tight_layout()
plt.savefig("assets/wireframes_flow.png", dpi=250, bbox_inches='tight')
plt.close()
print("Generated assets/wireframes_flow.png")
