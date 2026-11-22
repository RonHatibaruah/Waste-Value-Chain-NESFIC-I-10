import os
os.environ['MPLCONFIGDIR'] = '/tmp/matplotlib'
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import numpy as np

# Set clean white-theme aesthetic styling
plt.rcParams['font.sans-serif'] = 'Helvetica', 'DejaVu Sans', 'Arial'
plt.rcParams['axes.edgecolor'] = '#CBD5E1'
plt.rcParams['axes.linewidth'] = 0.8
plt.rcParams['figure.facecolor'] = 'white'

# -------------------------------------------------------------
# 1. Chain of Custody & Value Chain Traceability Diagram
# -------------------------------------------------------------
fig, ax = plt.subplots(figsize=(11, 4.5), facecolor='white')
ax.axis('off')

nodes = [
    {"stage": "1. Source Collection", "sub": "Doorstep & Bins", "detail": "• PRIDE Bahan EVs\n• AIS-140 GPS Tracker\n• Geofenced Beat Log\n• Driver Offline PWA", "color": "#F0FDF4", "border": "#16A34A", "x": 0.02},
    {"stage": "2. MRF Ingestion", "sub": "Boragaon / Nalbari", "detail": "• Universal IoT Scale Tap\n• RS-232 Auto-Reading\n• Sub-3.5s Weighment\n• AI Purity Camera Scan", "color": "#EFF6FF", "border": "#2563EB", "x": 0.27},
    {"stage": "3. Fair Settlement", "sub": "Worker Financials", "detail": "• Instant Assamese Audio\n• Direct Benefit Transfer\n• 100% Payout to Bank\n• Zero Middleman Cut", "color": "#FEFCE8", "border": "#CA8A04", "x": 0.52},
    {"stage": "4. Recycler & EPR", "sub": "State & National Audit", "detail": "• Baled Stock QR Tracking\n• Form VI e-Manifests\n• SHA-256 Mass Balance\n• CPCB Credit Minting", "color": "#FAF5FF", "border": "#9333EA", "x": 0.77}
]

for n in nodes:
    rect = plt.Rectangle((n["x"], 0.10), 0.21, 0.78, facecolor=n["color"], edgecolor=n["border"], linewidth=2, transform=ax.transAxes, zorder=1)
    ax.add_patch(rect)
    ax.text(n["x"] + 0.015, 0.80, n["stage"], fontsize=10.5, fontweight='bold', color=n["border"], transform=ax.transAxes, zorder=2)
    ax.text(n["x"] + 0.015, 0.72, n["sub"], fontsize=8, fontstyle='italic', color='#64748B', transform=ax.transAxes, zorder=2)
    ax.text(n["x"] + 0.015, 0.25, n["detail"], fontsize=8.5, color='#1E293B', transform=ax.transAxes, zorder=2, linespacing=1.5)
    
    if n["x"] < 0.75:
        ax.annotate('', xy=(n["x"] + 0.26, 0.50), xytext=(n["x"] + 0.21, 0.50),
                    arrowprops=dict(facecolor='#0D9488', edgecolor='#0D9488', width=2, headwidth=7),
                    transform=ax.transAxes, zorder=3)

ax.set_title("PRIDE WasteOS: End-to-End Circular Value Chain & Verified Chain-of-Custody", fontsize=12, fontweight='bold', pad=15, color='#0F172A')
plt.tight_layout()
plt.savefig("assets/chain_of_custody_flow.png", dpi=250, bbox_inches='tight')
plt.close()
print("Generated assets/chain_of_custody_flow.png")

# -------------------------------------------------------------
# 2. Universal Non-Invasive IoT Weighbridge Adapter Schematic
# -------------------------------------------------------------
fig, ax = plt.subplots(figsize=(10, 4.8), facecolor='white')
ax.axis('off')

# Blocks in Hardware Architecture
blocks = [
    {"name": "Legacy Industrial Scale\n(Avery / Essae / Eagle)", "desc": "RS-232 / RS-485\nContinuous Serial Out\n(No Calibration Alteration)", "x": 0.04, "color": "#F1F5F9", "border": "#475569"},
    {"name": "Universal IoT Sniffer\n(Custom Hardware)", "desc": "• Optoisolated Receiver (2.5kV)\n• Auto-Baud UART (1200-115200)\n• ESP32-WROVER Dual-Core\n• Non-volatile SPI Flash Buffer", "x": 0.36, "color": "#ECFDF5", "border": "#059669"},
    {"name": "Secure Cloud Pipeline\n& Touch Console", "desc": "• 4G LTE-M / Wi-Fi Uplink\n• TLS 1.3 Encrypted MQTT\n• Industrial MRF Touch Screen\n• Bluetooth Thermal Printer", "x": 0.70, "color": "#EFF6FF", "border": "#2563EB"}
]

for b in blocks:
    rect = plt.Rectangle((b["x"], 0.15), 0.26, 0.70, facecolor=b["color"], edgecolor=b["border"], linewidth=2, transform=ax.transAxes, zorder=1)
    ax.add_patch(rect)
    ax.text(b["x"] + 0.015, 0.72, b["name"], fontsize=9.5, fontweight='bold', color=b["border"], transform=ax.transAxes, zorder=2)
    ax.text(b["x"] + 0.015, 0.28, b["desc"], fontsize=8.5, color='#1E293B', transform=ax.transAxes, zorder=2, linespacing=1.4)

# Arrows
ax.annotate('Passive Tap\n(RS-232 ASCII)', xy=(0.36, 0.50), xytext=(0.30, 0.50),
            ha='center', fontsize=7.5, fontweight='bold', color='#059669',
            arrowprops=dict(facecolor='#059669', edgecolor='#059669', width=2, headwidth=6), transform=ax.transAxes)

ax.annotate('Encrypted JSON\n(Over 4G/GSM)', xy=(0.70, 0.50), xytext=(0.62, 0.50),
            ha='center', fontsize=7.5, fontweight='bold', color='#2563EB',
            arrowprops=dict(facecolor='#2563EB', edgecolor='#2563EB', width=2, headwidth=6), transform=ax.transAxes)

ax.set_title("Universal Non-Invasive Weighbridge IoT Adapter: Hardware Architecture", fontsize=12, fontweight='bold', pad=15, color='#0F172A')
plt.tight_layout()
plt.savefig("assets/hardware_schematic.png", dpi=250, bbox_inches='tight')
plt.close()
print("Generated assets/hardware_schematic.png")
