import os
os.environ['MPLCONFIGDIR'] = '/tmp/matplotlib'
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import matplotlib.patches as patches
import numpy as np

plt.rcParams['font.sans-serif'] = 'Helvetica', 'DejaVu Sans', 'Arial'
plt.rcParams['figure.facecolor'] = 'white'

os.makedirs('assets', exist_ok=True)

# ==============================================================================
# DIAGRAM 1: ASSAM STATE-WIDE HUB-AND-SPOKE TOPOLOGY & SCALING ROADMAP
# ==============================================================================
fig, ax = plt.subplots(figsize=(11, 5.2), facecolor='white')
ax.axis('off')

# Background container
bg = patches.FancyBboxPatch((0.01, 0.02), 0.98, 0.94, boxstyle="round,pad=0.01", facecolor='#F8FAFC', edgecolor='#CBD5E1', linewidth=1.5)
ax.add_patch(bg)

# Title
ax.text(0.50, 0.91, "PRIDE WasteOS: Assam State-Wide Hub-and-Spoke Value Chain & Logistics Network", fontsize=11, fontweight='bold', color='#0F172A', ha='center')
ax.text(0.50, 0.86, "Multi-tier regional aggregation connecting municipal wards, rural cooperatives, and national recyclers", fontsize=8, color='#64748B', ha='center')

# Tier 1: Micro-Collection (Informal Wards & Rural ULBs)
tier1 = patches.FancyBboxPatch((0.03, 0.10), 0.28, 0.72, boxstyle="round,pad=0.01", facecolor='#EFF6FF', edgecolor='#3B82F6', linewidth=1.8)
ax.add_patch(tier1)
ax.text(0.17, 0.77, "TIER 1: DECENTRALIZED COLLECTION", fontsize=8.5, fontweight='bold', color='#1D4ED8', ha='center')
ax.text(0.17, 0.73, "Ward Aggregation & Rural Beats", fontsize=7.5, fontstyle='italic', color='#475569', ha='center')

t1_items = [
    ("GMC 60 Municipal Wards", "PRIDE Bahan EV Rickshaws (8 active)"),
    ("Deepor Beel Wetland Buffer", "Zero-leakage ecological ward patrol"),
    ("Nalbari & Kamrup Rural Beats", "Cooperative rural drop-off centers"),
    ("Barpeta & Mangaldoi Hubs", "Secondary plastic bale staging sites")
]
y1 = 0.65
for title, sub in t1_items:
    item_box = patches.FancyBboxPatch((0.05, y1 - 0.08), 0.24, 0.10, boxstyle="round,pad=0.005", facecolor='white', edgecolor='#BFDBFE', linewidth=1)
    ax.add_patch(item_box)
    ax.text(0.065, y1 - 0.01, title, fontsize=8, fontweight='bold', color='#1E293B')
    ax.text(0.065, y1 - 0.055, sub, fontsize=7, color='#64748B')
    y1 -= 0.13

# Connector arrow 1 -> 2
ax.annotate('', xy=(0.35, 0.46), xytext=(0.31, 0.46),
            arrowprops=dict(facecolor='#3B82F6', edgecolor='#3B82F6', width=2.5, headwidth=7))
ax.text(0.33, 0.50, "GPS Telematics", fontsize=6.5, fontweight='bold', color='#2563EB', ha='center')

# Tier 2: Central Semi-Automated MRFs (Regional Processing Hubs)
tier2 = patches.FancyBboxPatch((0.36, 0.10), 0.28, 0.72, boxstyle="round,pad=0.01", facecolor='#F0FDF4', edgecolor='#10B981', linewidth=1.8)
ax.add_patch(tier2)
ax.text(0.50, 0.77, "TIER 2: REGIONAL MRF HUBS", fontsize=8.5, fontweight='bold', color='#047857', ha='center')
ax.text(0.50, 0.73, "Processing, Weighment & Baling", fontsize=7.5, fontstyle='italic', color='#475569', ha='center')

t2_items = [
    ("Central MRF Hub (Boragaon)", "50 TPD &bull; 60T Digital Weighbridge"),
    ("Nalbari Secondary Hub", "15 TPD &bull; Hydraulic Plastic Baling"),
    ("Silchar & Barak Valley Hub", "Phase 2 Expansion (Southern Assam)"),
    ("Dibrugarh & Upper Assam Hub", "Phase 3 Regional Petrochem Corridor")
]
y2 = 0.65
for title, sub in t2_items:
    item_box = patches.FancyBboxPatch((0.38, y2 - 0.08), 0.24, 0.10, boxstyle="round,pad=0.005", facecolor='white', edgecolor='#A7F3D0', linewidth=1)
    ax.add_patch(item_box)
    ax.text(0.395, y2 - 0.01, title, fontsize=8, fontweight='bold', color='#065F46')
    ax.text(0.395, y2 - 0.055, sub, fontsize=7, color='#64748B')
    y2 -= 0.13

# Connector arrow 2 -> 3
ax.annotate('', xy=(0.68, 0.46), xytext=(0.64, 0.46),
            arrowprops=dict(facecolor='#10B981', edgecolor='#10B981', width=2.5, headwidth=7))
ax.text(0.66, 0.50, "QR EPR Tokens", fontsize=6.5, fontweight='bold', color='#059669', ha='center')

# Tier 3: Institutional End-Markets & Regulatory Clearing
tier3 = patches.FancyBboxPatch((0.69, 0.10), 0.28, 0.72, boxstyle="round,pad=0.01", facecolor='#FAF5FF', edgecolor='#8B5CF6', linewidth=1.8)
ax.add_patch(tier3)
ax.text(0.83, 0.77, "TIER 3: END-MARKETS & REGULATORS", fontsize=8.5, fontweight='bold', color='#6D28D9', ha='center')
ax.text(0.83, 0.73, "EPR Offtake & Statutory Reporting", fontsize=7.5, fontstyle='italic', color='#475569', ha='center')

t3_items = [
    ("CPCB / ASPCB Portal", "Form-IV EPR credit registry API"),
    ("Brahmaputra Cracker (BCPL)", "Industrial polymer recycling off-take"),
    ("Dalmia / Star Cement Plants", "AFR kiln co-processing (Non-recyclable)"),
    ("Brand Owners (FMCG / EPR)", "PepsiCo, Dabur, Unilever audit packs")
]
y3 = 0.65
for title, sub in t3_items:
    item_box = patches.FancyBboxPatch((0.71, y3 - 0.08), 0.24, 0.10, boxstyle="round,pad=0.005", facecolor='white', edgecolor='#DDD6FE', linewidth=1)
    ax.add_patch(item_box)
    ax.text(0.725, y3 - 0.01, title, fontsize=8, fontweight='bold', color='#5B21B6')
    ax.text(0.725, y3 - 0.055, sub, fontsize=7, color='#64748B')
    y3 -= 0.13

plt.tight_layout()
plt.savefig("assets/assam_statewide_roadmap.png", dpi=250, bbox_inches='tight')
plt.close()
print("Generated assets/assam_statewide_roadmap.png")


# ==============================================================================
# DIAGRAM 2: WEIGHBRIDGE RETROFIT PHYSICAL ARCHITECTURE & HARNESS
# ==============================================================================
fig, ax = plt.subplots(figsize=(11, 5.0), facecolor='white')
ax.axis('off')

# Frame
bg = patches.FancyBboxPatch((0.01, 0.02), 0.98, 0.94, boxstyle="round,pad=0.01", facecolor='#FFFFFF', edgecolor='#CBD5E1', linewidth=1.5)
ax.add_patch(bg)

ax.text(0.50, 0.91, "PRIDE WasteOS: Physical Weighbridge Retrofit & Opto-Isolated Ingestion Architecture", fontsize=11, fontweight='bold', color='#0F172A', ha='center')
ax.text(0.50, 0.86, "Plug-and-play non-invasive telemetry interceptor compatible with Avery India, Essae, Eagle & Contech scales", fontsize=8, color='#64748B', ha='center')

# Left: Scale Pit & Indicator
box_scale = patches.FancyBboxPatch((0.04, 0.12), 0.27, 0.68, boxstyle="round,pad=0.01", facecolor='#F1F5F9', edgecolor='#64748B', linewidth=1.5)
ax.add_patch(box_scale)
ax.text(0.175, 0.74, "A. WEIGHBRIDGE PIT & DISPLAY", fontsize=8.5, fontweight='bold', color='#334155', ha='center')

scale_details = [
    ("4-8x Shear Beam Load Cells", "Under 60T pit/pitless steel deck"),
    ("Analog Summing Junction Box", "Weatherproof IP68 cable combiner"),
    ("Avery / Essae Indicator Unit", "Displays Gross / Tare / Net in cabin"),
    ("RS-232 DB9 Serial Port (TX/GND)", "Continuous ASCII broadcast port")
]
ys = 0.62
for title, sub in scale_details:
    b = patches.Rectangle((0.06, ys - 0.07), 0.23, 0.09, facecolor='white', edgecolor='#CBD5E1', linewidth=1)
    ax.add_patch(b)
    ax.text(0.075, ys - 0.015, title, fontsize=7.5, fontweight='bold', color='#1E293B')
    ax.text(0.075, ys - 0.05, sub, fontsize=6.8, color='#64748B')
    ys -= 0.12

# Mid-Arrow 1
ax.annotate('', xy=(0.35, 0.46), xytext=(0.31, 0.46),
            arrowprops=dict(facecolor='#0284C7', edgecolor='#0284C7', width=2, headwidth=6))
ax.text(0.33, 0.50, "RS-232 Tap", fontsize=6.5, fontweight='bold', color='#0284C7', ha='center')

# Center: PRIDE Sniffer Gateway (IoT Edge Box)
box_gw = patches.FancyBboxPatch((0.36, 0.12), 0.28, 0.68, boxstyle="round,pad=0.01", facecolor='#ECFEFF', edgecolor='#06B6D4', linewidth=1.8)
ax.add_patch(box_gw)
ax.text(0.50, 0.74, "B. PRIDE SNIFFER EDGE GATEWAY", fontsize=8.5, fontweight='bold', color='#0E7490', ha='center')

gw_details = [
    ("Opto-Coupler Isolation (6N137)", "Prevents ground loops & surge spikes"),
    ("MAX3232 Transceiver", "Converts +/-12V RS232 to 3.3V TTL"),
    ("ESP32-S3 Dual-Core SoC", "Regex string parser & ring buffer"),
    ("SIM7600G 4G/LTE + WiFi Mod", "Secure TLS MQTT/HTTPS telemetry")
]
yg = 0.62
for title, sub in gw_details:
    b = patches.Rectangle((0.38, yg - 0.07), 0.24, 0.09, facecolor='white', edgecolor='#A5F3FC', linewidth=1)
    ax.add_patch(b)
    ax.text(0.395, yg - 0.015, title, fontsize=7.5, fontweight='bold', color='#0E7490')
    ax.text(0.395, yg - 0.05, sub, fontsize=6.8, color='#64748B')
    yg -= 0.12

# Mid-Arrow 2
ax.annotate('', xy=(0.68, 0.46), xytext=(0.64, 0.46),
            arrowprops=dict(facecolor='#06B6D4', edgecolor='#06B6D4', width=2, headwidth=6))
ax.text(0.66, 0.50, "4G / Cloud", fontsize=6.5, fontweight='bold', color='#0891B2', ha='center')

# Right: Operator & Driver Terminals
box_term = patches.FancyBboxPatch((0.69, 0.12), 0.27, 0.68, boxstyle="round,pad=0.01", facecolor='#FDF4FF', edgecolor='#D946EF', linewidth=1.5)
ax.add_patch(box_term)
ax.text(0.825, 0.74, "C. EDGE PERIPHERALS & CLOUD", fontsize=8.5, fontweight='bold', color='#A21CAF', ha='center')

term_details = [
    ("Operator Touch Tablet (PWA)", "Offline-first UI with photo capture"),
    ("Thermal Ticket Printer (ESC/POS)", "Instant QR-coded weigh slip"),
    ("Outdoor Dual-Sided LED Matrix", "Ultra-bright gross/net weight HUD"),
    ("PRIDE Cloud (Cloudflare & AWS)", "Real-time SSE, Postgres & CPCB API")
]
yt = 0.62
for title, sub in term_details:
    b = patches.Rectangle((0.71, yt - 0.07), 0.23, 0.09, facecolor='white', edgecolor='#F5D0FE', linewidth=1)
    ax.add_patch(b)
    ax.text(0.725, yt - 0.015, title, fontsize=7.5, fontweight='bold', color='#86198F')
    ax.text(0.725, yt - 0.05, sub, fontsize=6.8, color='#64748B')
    yt -= 0.12

plt.tight_layout()
plt.savefig("assets/weighbridge_hardware_cutaway.png", dpi=250, bbox_inches='tight')
plt.close()
print("Generated assets/weighbridge_hardware_cutaway.png")


# ==============================================================================
# DIAGRAM 3: CPCB EPR DIGITAL CERTIFICATE & MASS-BALANCE COMPLIANCE SLIP
# ==============================================================================
fig, ax = plt.subplots(figsize=(10.5, 5.2), facecolor='white')
ax.axis('off')

# Certificate outer border
border = patches.FancyBboxPatch((0.02, 0.02), 0.96, 0.94, boxstyle="round,pad=0.01", facecolor='#FFFCF5', edgecolor='#B45309', linewidth=2.5)
ax.add_patch(border)

inner = patches.Rectangle((0.04, 0.04), 0.92, 0.90, fill=False, edgecolor='#D97706', linewidth=1, linestyle='--')
ax.add_patch(inner)

# Header
ax.text(0.50, 0.88, "CENTRAL POLLUTION CONTROL BOARD (CPCB) & ASPCB", fontsize=10.5, fontweight='bold', color='#78350F', ha='center')
ax.text(0.50, 0.83, "CERTIFICATE OF PLASTIC WASTE RECYCLING & EPR COMPLIANCE", fontsize=9, fontweight='bold', color='#92400E', ha='center')
ax.text(0.50, 0.79, "Issued pursuant to Plastic Waste Management Rules, 2016 (Amendment 2022)", fontsize=7.5, fontstyle='italic', color='#6B7280', ha='center')

# Certificate Metadata Grid
ax.text(0.08, 0.72, "Certificate No:", fontsize=8, color='#4B5563')
ax.text(0.24, 0.72, "CPCB-EPR-AS-2026-08914", fontsize=8.5, fontweight='bold', color='#111827', fontfamily='monospace')

ax.text(0.54, 0.72, "Issue Date:", fontsize=8, color='#4B5563')
ax.text(0.67, 0.72, "23-Nov-2026 03:15 IST", fontsize=8.5, fontweight='bold', color='#111827')

ax.text(0.08, 0.66, "Accredited Recycler:", fontsize=8, color='#4B5563')
ax.text(0.24, 0.66, "PRIDE Cooperative Society Ltd. (Boragaon MRF #1)", fontsize=8.5, fontweight='bold', color='#047857')

ax.text(0.54, 0.66, "Reg. Number:", fontsize=8, color='#4B5563')
ax.text(0.67, 0.66, "ASPCB/EPR/REC/2026/KAM/042", fontsize=8.5, fontweight='bold', color='#111827', fontfamily='monospace')

ax.text(0.08, 0.60, "FMCG Brand Owner:", fontsize=8, color='#4B5563')
ax.text(0.24, 0.60, "PepsiCo India Holdings Pvt. Ltd. (Guwahati Bottling)", fontsize=8.5, fontweight='bold', color='#1E40AF')

ax.text(0.54, 0.60, "EPR Category:", fontsize=8, color='#4B5563')
ax.text(0.67, 0.60, "Category I (Rigid Plastic Packaging)", fontsize=8.5, fontweight='bold', color='#111827')

# Middle Table: Mass Balance Verification
tbl_bg = patches.Rectangle((0.08, 0.22), 0.58, 0.33, facecolor='#FFFFFF', edgecolor='#CBD5E1', linewidth=1)
ax.add_patch(tbl_bg)

headers = ["Batch Parameter", "Recorded Quantity", "Verification Hash"]
xs = [0.10, 0.35, 0.52]
for h, x in zip(headers, xs):
    ax.text(x, 0.51, h, fontsize=7.5, fontweight='bold', color='#374151')

ax.plot([0.08, 0.66], [0.49, 0.49], color='#E2E8F0', linewidth=1)

rows = [
    ("Gross Inbound Weighment", "14,500.0 kg (14.50 MT)", "SHA: 9f8a2..."),
    ("Tare & Deducted Moisture", "1,220.0 kg (8.41%)", "CAL: -1.22MT"),
    ("Net Certified Recyclate", "13,280.0 kg (13.28 MT)", "VALIDATED"),
    ("Output: Baled rPET Flakes", "13,014.4 kg (98.0% Yield)", "BATCH: 0891"),
    ("Authorized EPR Credits", "13.28 MT Credits Minted", "IMMUTABLE")
]
yr = 0.44
for param, qty, v_hash in rows:
    ax.text(0.10, yr, param, fontsize=7, color='#1F2937')
    ax.text(0.35, yr, qty, fontsize=7, fontweight='bold', color='#0F172A')
    ax.text(0.52, yr, v_hash, fontsize=6.8, fontfamily='monospace', color='#059669' if 'VALID' in v_hash or 'MT' in v_hash else '#475569')
    yr -= 0.05

# Right QR Verification & Seal
qr_box = patches.FancyBboxPatch((0.70, 0.22), 0.22, 0.33, boxstyle="round,pad=0.01", facecolor='#F3F4F6', edgecolor='#9CA3AF', linewidth=1)
ax.add_patch(qr_box)

# Simulated QR Pattern
np.random.seed(42)
qr_grid = np.random.choice([0, 1], size=(8, 8), p=[0.4, 0.6])
for i in range(8):
    for j in range(8):
        if qr_grid[i, j] == 1:
            q_sq = patches.Rectangle((0.74 + j * 0.016, 0.34 + i * 0.016), 0.014, 0.014, facecolor='#111827')
            ax.add_patch(q_sq)

ax.text(0.81, 0.30, "VERIFY ON CPCB LEDGER", fontsize=6.5, fontweight='bold', color='#1F2937', ha='center')
ax.text(0.81, 0.26, "Scan QR code to inspect raw\nIoT serial timestamp & weigh slip", fontsize=5.8, color='#6B7280', ha='center', linespacing=1.2)

# Footer Signatures
ax.text(0.12, 0.11, "____________________________________\nAuthorized Signatory (PRIDE Cooperative)", fontsize=7, color='#4B5563')
ax.text(0.52, 0.11, "____________________________________\nNodal Officer (GMC / ASPCB Inspection Cell)", fontsize=7, color='#4B5563')

plt.tight_layout()
plt.savefig("assets/cpcb_epr_certificate.png", dpi=250, bbox_inches='tight')
plt.close()
print("Generated assets/cpcb_epr_certificate.png")
