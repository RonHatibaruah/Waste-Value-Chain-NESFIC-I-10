import os
os.environ['MPLCONFIGDIR'] = '/tmp/matplotlib'
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import matplotlib.patches as patches
import numpy as np

plt.rcParams['font.sans-serif'] = 'Helvetica', 'DejaVu Sans', 'Arial'
plt.rcParams['axes.edgecolor'] = '#CBD5E1'
plt.rcParams['axes.linewidth'] = 0.8
plt.rcParams['figure.facecolor'] = 'white'

# -----------------------------------------------------------------------------
# 1. Guwahati Geospatial Terrain & Flood-Avoidance Map (VRP Engine)
# -----------------------------------------------------------------------------
fig, ax = plt.subplots(figsize=(10, 5.5), facecolor='white')

# Set map canvas boundaries
ax.set_xlim(0, 100)
ax.set_ylim(0, 100)
ax.axis('off')

# Background territory
bg_rect = patches.Rectangle((0, 0), 100, 100, facecolor='#F8FAFC', edgecolor='#E2E8F0', linewidth=1)
ax.add_patch(bg_rect)

# Brahmaputra River (North boundary)
river_x = [0, 20, 45, 70, 100, 100, 0]
river_y = [85, 82, 88, 84, 86, 100, 100]
river = patches.Polygon(np.column_stack([river_x, river_y]), closed=True, facecolor='#BAE6FD', edgecolor='#38BDF8', linewidth=1.5)
ax.add_patch(river)
ax.text(50, 92, "BRAHMAPUTRA RIVER BASIN (North Guwahati)", fontsize=9.5, fontweight='bold', color='#0369A1', ha='center')

# Deepor Beel Wetland (Eco-Sensitive Buffer Zone - Southwest)
wetland = patches.Polygon([[5, 10], [25, 12], [28, 30], [8, 28]], closed=True, facecolor='#CFFAFE', edgecolor='#06B6D4', linewidth=2, linestyle='--')
ax.add_patch(wetland)
ax.text(16, 20, "Deepor Beel Ramsar Site\n(Zero-Leakage Buffer Zone)", fontsize=8, fontweight='bold', color='#0891B2', ha='center', va='center')

# Waterlogging / Flood Corridors (Red / Amber)
flood_anil = patches.Circle((62, 58), 9, facecolor='#FEE2E2', edgecolor='#EF4444', linewidth=2, linestyle=':')
ax.add_patch(flood_anil)
ax.text(62, 58, "Anil Nagar & Nabin Nagar\n(Severe Waterlogging)", fontsize=7.5, fontweight='bold', color='#B91C1C', ha='center', va='center')

flood_zoo = patches.Circle((75, 42), 8, facecolor='#FEF3C7', edgecolor='#F59E0B', linewidth=2, linestyle=':')
ax.add_patch(flood_zoo)
ax.text(75, 42, "Zoo Road Corridor\n(Traffic/Flood Bottleneck)", fontsize=7.5, fontweight='bold', color='#B45309', ha='center', va='center')

# Key Points of Interest
pois = [
    {"name": "PRIDE Central MRF\n(Boragaon)", "x": 22, "y": 42, "color": "#0D9488", "marker": "s"},
    {"name": "Ward 24 (Fancy Bazar)", "x": 42, "y": 72, "color": "#1E3A8A", "marker": "o"},
    {"name": "Ward 12 (Paltan Bazar)", "x": 52, "y": 64, "color": "#1E3A8A", "marker": "o"},
    {"name": "Ward 36 (Dispur Capital)", "x": 80, "y": 28, "color": "#1E3A8A", "marker": "o"},
    {"name": "Ward 48 (Jalukbari)", "x": 15, "y": 62, "color": "#1E3A8A", "marker": "o"},
]

for p in pois:
    ax.scatter(p["x"], p["y"], color=p["color"], s=100, marker=p["marker"], zorder=5, edgecolors='white', linewidth=1.5)
    ax.text(p["x"], p["y"] - 4.5, p["name"], fontsize=7.5, fontweight='bold', color='#1E293B', ha='center', zorder=6)

# Route 1: Baseline Static Beat (Red dashed line through flood zones)
baseline_x = [42, 52, 62, 75, 80]
baseline_y = [72, 64, 58, 42, 28]
ax.plot(baseline_x, baseline_y, color='#DC2626', linestyle='--', linewidth=2.5, alpha=0.8, label='Legacy Beat (Blocked in Floods)', zorder=3)

# Route 2: PRIDE WasteOS Dynamic VRP Route (Green solid line avoiding floods)
vrp_x = [42, 45, 52, 58, 68, 78, 80]
vrp_y = [72, 60, 48, 38, 32, 26, 28]
ax.plot(vrp_x, vrp_y, color='#0D9488', linestyle='-', linewidth=3.5, label='PRIDE Dynamic VRP (Elevation & Flood Avoidance)', zorder=4)

# Legend & Callout
ax.legend(loc='lower right', fontsize=8, framealpha=0.9, edgecolor='#CBD5E1')
callout_text = "VRP Algorithm Impact:\n• 24.8% Fleet Fuel Savings\n• Zero Vehicle Inundation\n• Real-Time ASDMA Flood Sync"
ax.text(2, 95, callout_text, fontsize=8, fontweight='bold', color='#0F172A',
        bbox=dict(boxstyle="round,pad=0.5", facecolor='white', edgecolor='#0D9488', linewidth=1.5))

ax.set_title("PRIDE WasteOS: Guwahati Geospatial Terrain & Flood-Adaptive Dynamic Routing", fontsize=11, fontweight='bold', pad=12, color='#0F172A')

plt.tight_layout()
plt.savefig("assets/flood_routing_map.png", dpi=250, bbox_inches='tight')
plt.close()
print("Generated assets/flood_routing_map.png")

# -----------------------------------------------------------------------------
# 2. Mass-Balance Sankey / Flow Conservation Diagram (CPCB Audit Trail)
# -----------------------------------------------------------------------------
fig, ax = plt.subplots(figsize=(10.5, 4.8), facecolor='white')
ax.axis('off')

# Ingestion block
ax.add_patch(patches.Rectangle((0.02, 0.25), 0.18, 0.50, facecolor='#EFF6FF', edgecolor='#2563EB', linewidth=2))
ax.text(0.11, 0.64, "INBOUND INTAKE", fontsize=9.5, fontweight='bold', color='#1E40AF', ha='center')
ax.text(0.11, 0.50, "100.0 Metric Tons\nMixed Recyclables", fontsize=8.5, fontweight='heavy', color='#0F172A', ha='center')
ax.text(0.11, 0.33, "IoT Scale Verified\n(Gross - Tare Auto Log)", fontsize=7.5, fontstyle='italic', color='#64748B', ha='center')

# Arrows to MRF Sorting
ax.annotate('', xy=(0.28, 0.50), xytext=(0.20, 0.50), arrowprops=dict(facecolor='#2563EB', edgecolor='#2563EB', width=2.5, headwidth=7))

# Sorting Fractions Block
ax.add_patch(patches.Rectangle((0.28, 0.10), 0.38, 0.80, facecolor='#F0FDF4', edgecolor='#059669', linewidth=2))
ax.text(0.47, 0.82, "MRF CONVEYOR & AI SORTING (BORAGAON)", fontsize=9.5, fontweight='bold', color='#065F46', ha='center')

fractions = [
    ("Rigid PET Bottles", "34.0 MT (34%)", "#0284C7", 0.69),
    ("HDPE / PP Rigid Containers", "26.0 MT (26%)", "#0D9488", 0.55),
    ("Corrugated Cardboard & Kraft", "20.0 MT (20%)", "#D97706", 0.41),
    ("Multilayered Plastics (MLP)", "14.0 MT (14%)", "#7C3AED", 0.27),
    ("Inert Moisture & Non-Recyclable", "6.0 MT (6%)", "#64748B", 0.15)
]

for label, weight, col, ypos in fractions:
    ax.add_patch(patches.Rectangle((0.30, ypos - 0.04), 0.34, 0.08, facecolor='white', edgecolor=col, linewidth=1.2))
    ax.text(0.31, ypos, label, fontsize=7.8, fontweight='bold', color='#1E293B', va='center')
    ax.text(0.62, ypos, weight, fontsize=7.8, fontfamily='monospace', fontweight='bold', color=col, ha='right', va='center')

# Arrows to Dispatches
ax.annotate('', xy=(0.74, 0.50), xytext=(0.66, 0.50), arrowprops=dict(facecolor='#059669', edgecolor='#059669', width=2.5, headwidth=7))

# Final Dispatch & EPR Output Block
ax.add_patch(patches.Rectangle((0.74, 0.20), 0.24, 0.60, facecolor='#FAF5FF', edgecolor='#9333EA', linewidth=2))
ax.text(0.86, 0.71, "VERIFIED DISPATCH & EPR", fontsize=9, fontweight='bold', color='#6B21A8', ha='center')
ax.text(0.86, 0.58, "94.0 MT Baled Stock\nDispatched to Recyclers", fontsize=8.5, fontweight='bold', color='#0F172A', ha='center')
ax.text(0.86, 0.40, "• North East Eco-Polymers\n• Pragjyotish Plast-Recycle\n• Guwahati Cement Kiln", fontsize=7.5, color='#475569', ha='center')
ax.text(0.86, 0.26, "CPCB Form VI & SHA-256 Mints", fontsize=7.5, fontweight='bold', color='#9333EA', ha='center')

ax.set_title("PRIDE WasteOS: Mathematically Closed Mass-Balance Accounting Architecture", fontsize=11, fontweight='bold', pad=12, color='#0F172A')

plt.tight_layout()
plt.savefig("assets/mass_balance_sankey.png", dpi=250, bbox_inches='tight')
plt.close()
print("Generated assets/mass_balance_sankey.png")

# -----------------------------------------------------------------------------
# 3. High-Fidelity Safai Sathi Mobile App Wireframe (Vernacular UI)
# -----------------------------------------------------------------------------
fig, ax = plt.subplots(figsize=(10, 5.2), facecolor='white')
ax.axis('off')

# Phone Bezel Outer
phone_outer = patches.FancyBboxPatch((0.08, 0.05), 0.38, 0.90, boxstyle="round,pad=0.02,rounding_size=0.04", facecolor='#0F172A', edgecolor='#334155', linewidth=3)
ax.add_patch(phone_outer)

# Phone Screen Inner
phone_screen = patches.Rectangle((0.10, 0.08), 0.34, 0.84, facecolor='#FFFFFF')
ax.add_patch(phone_screen)

# Screen Header (Assamese + English)
ax.add_patch(patches.Rectangle((0.10, 0.82), 0.34, 0.10, facecolor='#1E3A8A'))
ax.text(0.12, 0.88, "PRIDE সমবায় (WasteOS)", fontsize=9, fontweight='bold', color='white')
ax.text(0.12, 0.84, "ৰমেন দাস (ID: SW-0101)", fontsize=7.5, color='#93C5FD')
ax.text(0.42, 0.86, "● Offline", fontsize=7, color='#86EFAC', ha='right')

# Big Weight Readout Card
ax.add_patch(patches.FancyBboxPatch((0.12, 0.65), 0.30, 0.14, boxstyle="round,pad=0.01", facecolor='#F0FDF4', edgecolor='#86EFAC', linewidth=1.5))
ax.text(0.27, 0.74, "Net Recyclable Weight", fontsize=7.5, color='#15803D', ha='center')
ax.text(0.27, 0.68, "৪৭০ কিলোগ্ৰাম (470 kg)", fontsize=11, fontweight='black', color='#166534', ha='center')

# Color-coded Material Touch Buttons
materials = [
    ("PET বটল (PET)", "₹26 / kg", "#0284C7", 0.12, 0.50),
    ("HDPE প্লাষ্টিক", "₹32 / kg", "#0D9488", 0.28, 0.50),
    ("কাৰ্ডবৰ্ড (Card)", "₹14 / kg", "#D97706", 0.12, 0.36),
    ("মিশ্ৰিত ধাতু", "₹42 / kg", "#7C3AED", 0.28, 0.36)
]

for label, rate, col, bx, by in materials:
    ax.add_patch(patches.FancyBboxPatch((bx, by), 0.14, 0.11, boxstyle="round,pad=0.01", facecolor='white', edgecolor=col, linewidth=1.5))
    ax.text(bx + 0.07, by + 0.065, label, fontsize=7.5, fontweight='bold', color='#1E293B', ha='center')
    ax.text(bx + 0.07, by + 0.025, rate, fontsize=7, fontweight='bold', color=col, ha='right')

# Audio Playback Banner (Voice feedback)
ax.add_patch(patches.FancyBboxPatch((0.12, 0.22), 0.30, 0.10, boxstyle="round,pad=0.01", facecolor='#FEF3C7', edgecolor='#FCD34D', linewidth=1))
ax.text(0.14, 0.27, "🔊 অসমীয়া ভয়েচ ৰিচিট", fontsize=8, fontweight='bold', color='#92400E')
ax.text(0.14, 0.24, "মুঠ পৰিশোধ: ₹১২,২২০ (Instant DBT)", fontsize=7, color='#B45309')

# Confirm Button
ax.add_patch(patches.FancyBboxPatch((0.12, 0.11), 0.30, 0.08, boxstyle="round,pad=0.01", facecolor='#0D9488'))
ax.text(0.27, 0.15, "ওজন নিশ্চিত কৰক (Confirm)", fontsize=8.5, fontweight='bold', color='white', ha='center')

# Explanatory Side Annotations for Evaluators
features = [
    ("1. High-Contrast Low-Literacy UI", "Designed for informal waste pickers with zero complex forms; large color-coded touch targets for PET, HDPE, Cardboard, and Metals.", 0.52, 0.78),
    ("2. Native Assamese Voice Synthesis", "Integrated Web Speech API generates crystal-clear audio payout notifications in Assamese: '৪৭০ কিলোগ্রাম প্লাষ্টিক গ্ৰহণ কৰা হৈছে...'.", 0.52, 0.56),
    ("3. Offline SQLite & Idempotent Sync", "Buffers transactions on phone storage during cellular dropouts in peripheral slums; auto-synchronizes upon signal recovery with zero duplicate records.", 0.52, 0.34),
    ("4. Direct Benefit Transfer (DBT)", "Settles daily earnings directly to Aadhaar-enabled bank accounts (AePS) or cooperative wallet, eliminating middlemen cuts.", 0.52, 0.12)
]

for title, desc, fx, fy in features:
    ax.text(fx, fy + 0.05, title, fontsize=9.5, fontweight='bold', color='#1E3A8A')
    ax.text(fx, fy, desc, fontsize=8, color='#475569', wrap=True, linespacing=1.4)
    # Connecting dashed line
    ax.plot([fx - 0.03, fx - 0.01], [fy + 0.04, fy + 0.04], color='#94A3B8', linewidth=1.5)

ax.set_title("PRIDE WasteOS: Vernacular Mobile PWA Wireframe (Safai Sathi / Field Driver View)", fontsize=11, fontweight='bold', pad=12, color='#0F172A')

plt.tight_layout()
plt.savefig("assets/mobile_pwa_mockup.png", dpi=250, bbox_inches='tight')
plt.close()
print("Generated assets/mobile_pwa_mockup.png")

# -----------------------------------------------------------------------------
# 4. 10-Month Milestone Gantt Chart & Deployment Roadmap
# -----------------------------------------------------------------------------
fig, ax = plt.subplots(figsize=(10.5, 5.0), facecolor='white')

phases = [
    ("Phase 1: Inception & Edge Architecture", 1, 8, "#0284C7", "M2: HW Bench Tested"),
    ("Phase 2: Core Platform & PWA MVP", 9, 16, "#0D9488", "M4: MVP v0.5 Release"),
    ("Phase 3: AI Screening & EPR Engine", 17, 24, "#D97706", "M6: Beta v0.8 Pilot"),
    ("Phase 4: Field Pilot (Kamrup & Nalbari)", 25, 32, "#7C3AED", "M8: Mid-Pilot Evaluation"),
    ("Phase 5: Security Audits & Handover", 33, 40, "#DC2626", "M10: Production v1.0")
]

y_pos = np.arange(len(phases))[::-1]

for i, (title, start, end, col, milestone) in enumerate(phases):
    duration = end - start + 1
    # Gantt bar
    ax.barh(y_pos[i], duration, left=start, height=0.55, color=col, alpha=0.9, edgecolor='#0F172A', linewidth=1)
    # Phase text
    ax.text(start + 0.5, y_pos[i], title, fontsize=8.5, fontweight='bold', color='white', va='center')
    # Milestone marker pin
    ax.scatter(end, y_pos[i], color='#FBBF24', s=120, marker='D', zorder=5, edgecolors='#78350F', linewidth=1.5)
    ax.text(end + 0.8, y_pos[i], milestone, fontsize=7.5, fontweight='bold', color='#1E293B', va='center')

# Grid and styling
ax.set_yticks(y_pos)
ax.set_yticklabels(["Phase 1", "Phase 2", "Phase 3", "Phase 4", "Phase 5"], fontsize=8.5, fontweight='bold')
ax.set_xlabel("Development Timeline (Weeks 1 to 40 / 10 Months)", fontsize=9, fontweight='bold', color='#1E293B', labelpad=8)
ax.set_xlim(0, 48)
ax.set_xticks(np.arange(0, 45, 4))
ax.grid(axis='x', linestyle='--', alpha=0.5)

# Funding / Tech Team Callout
ax.text(24, -0.9, "₹40.00 Lakhs Total Grant Allocation | ₹20.00 Lakhs Technical Engineering Team (50%)",
        fontsize=8.5, fontweight='bold', color='#1E3A8A', ha='center',
        bbox=dict(boxstyle="round,pad=0.4", facecolor='#EFF6FF', edgecolor='#93C5FD', linewidth=1))

ax.set_title("PRIDE WasteOS: 10-Month Milestone Execution Roadmap & Validation Gates", fontsize=11, fontweight='bold', pad=12, color='#0F172A')

plt.tight_layout()
plt.savefig("assets/milestone_gantt_chart.png", dpi=250, bbox_inches='tight')
plt.close()
print("Generated assets/milestone_gantt_chart.png")
