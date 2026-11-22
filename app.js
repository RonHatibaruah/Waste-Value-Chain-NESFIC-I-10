// PRIDE WasteOS (AsomiCycle) - Interactive Application Logic

// -------------------------------------------------------------
// 1. Data Store
// -------------------------------------------------------------
const FLEET_DATA = [
  { id: "AS-01-PR-101", driver: "Ramen Das (ৰমেন দাস)", type: "PRIDE Bahan EV", lat: 26.182, lng: 91.745, status: "Collecting", beat: "Ward 24 (Fancy Bazar)", cargoKg: 420, battery: 78 },
  { id: "AS-01-PR-102", driver: "Biren Kalita (বীৰেন কলিতা)", type: "PRIDE Bahan EV", lat: 26.175, lng: 91.770, status: "En Route MRF", beat: "Ward 12 (Paltan Bazar)", cargoKg: 580, battery: 64 },
  { id: "AS-01-PR-103", driver: "Manju Begum (মঞ্জু বেগম)", type: "PRIDE Bahan EV", lat: 26.140, lng: 91.790, status: "Collecting", beat: "Ward 36 (Dispur Capital)", cargoKg: 310, battery: 85 },
  { id: "AS-01-PR-104", driver: "Pranab Boro (প্ৰণৱ বড়ো)", type: "PRIDE Bahan EV", lat: 26.150, lng: 91.680, status: "At Boragaon MRF", beat: "Ward 48 (Jalukbari)", cargoKg: 650, battery: 92 },
  { id: "AS-01-PR-105", driver: "Anima Saikia (অনিমা শইকীয়া)", type: "PRIDE Bahan EV", lat: 26.160, lng: 91.720, status: "Collecting", beat: "Ward 18 (Uzanbazar)", cargoKg: 280, battery: 72 }
];

const WORKER_DATA = [
  { id: "SW-0101", name: "Ramen Das (ৰমেন দাস)", vehicle: "AS-01-PR-101", ward: "Ward 24 (Fancy Bazar)", volume: "420 kg", payout: "₹10,920", status: "Processed", channel: "Aadhaar AePS / SBI" },
  { id: "SW-0102", name: "Biren Kalita (বীৰেন কলিতা)", vehicle: "AS-01-PR-102", ward: "Ward 12 (Paltan Bazar)", volume: "580 kg", payout: "₹15,080", status: "Pending Scale", channel: "Cooperative Wallet" },
  { id: "SW-0103", name: "Manju Begum (মঞ্জু বেগম)", vehicle: "AS-01-PR-103", ward: "Ward 36 (Dispur)", volume: "310 kg", payout: "₹8,060", status: "Processed", channel: "Direct UPI / PNB" },
  { id: "SW-0104", name: "Tapan Boro (তপন বড়ো)", vehicle: "IND-CYCLE-044", ward: "Ward 48 (Jalukbari)", volume: "165 kg", payout: "₹4,290", status: "Processed", channel: "Cash Slip / Coop Branch" },
  { id: "SW-0105", name: "Anima Saikia (অনিমা শইকীয়া)", vehicle: "AS-01-PR-105", ward: "Ward 18 (Uzanbazar)", volume: "280 kg", payout: "₹7,280", status: "En Route", channel: "Direct UPI / AGVB" }
];

const EPR_BATCHES = [
  { id: "EPR-AS-2026-081", cat: "Category I (Rigid PET)", weight: "18.4 Tons", recycler: "North East Eco-Polymers Ltd.", hash: "8f3a9e...4c1d", status: "Certified" },
  { id: "EPR-AS-2026-082", cat: "Category I (HDPE Containers)", weight: "15.8 Tons", recycler: "Pragjyotish Plast-Recycle Ltd.", hash: "3e5b12...a90f", status: "Certified" },
  { id: "EPR-AS-2026-083", cat: "Category II (Flexible MLP)", weight: "12.8 Tons", recycler: "Brahmaputra Green Solutions", hash: "9c8a41...b72e", status: "Verified" },
  { id: "EPR-AS-2026-084", cat: "Category III (Multi-Layer)", weight: "5.6 Tons", recycler: "Guwahati Cement Kiln Co-Proc.", hash: "1d4f77...e63c", status: "Audited" }
];

// Proposal Sections Content loaded from verified text
let PROPOSAL_SECTIONS = {};

// -------------------------------------------------------------
// 2. Leaflet Map Initialization
// -------------------------------------------------------------
let map;
let vehicleMarkers = {};

function initMap() {
  const mapElement = document.getElementById('gis-map');
  if (!mapElement) return;

  // Guwahati center coordinates
  map = L.map('gis-map').setView([26.160, 91.735], 12);

  // Dark/High-contrast CartoDB tiles
  L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
    subdomains: 'abcd',
    maxZoom: 19
  }).addTo(map);

  // Add Key Facilities
  // 1. Boragaon Central MRF
  const mrfIcon = L.divIcon({
    className: 'custom-mrf-marker',
    html: `<div style="background-color: #0D9488; color: white; padding: 4px 8px; border-radius: 6px; font-weight: bold; font-size: 11px; border: 2px solid white; box-shadow: 0 4px 10px rgba(0,0,0,0.5);"><i class="fa-solid fa-industry"></i> PRIDE Boragaon MRF</div>`,
    iconSize: [150, 30]
  });
  L.marker([26.138, 91.685], { icon: mrfIcon }).addTo(map).bindPopup("<b>PRIDE Central MRF Hub #1</b><br>Boragaon Corridor, Kamrup Metro<br>Capacity: 50 TPD &bull; 60T Digital Weighbridge");

  // 2. Deepor Beel Eco-Sensitive Buffer Zone (Polygon)
  const wetland = L.polygon([
    [26.125, 91.640],
    [26.140, 91.660],
    [26.115, 91.670],
    [26.105, 91.650]
  ], {
    color: '#06B6D4',
    fillColor: '#06B6D4',
    fillOpacity: 0.2,
    weight: 2,
    dashArray: '4, 4'
  }).addTo(map).bindPopup("<b>Deepor Beel Ramsar Site (Wetland Buffer)</b><br>Strict Zero-Leakage Environmental Zone");

  // Add Vehicles
  FLEET_DATA.forEach(v => {
    const vIcon = L.divIcon({
      className: 'custom-v-marker',
      html: `<div style="background-color: #1E3A8A; color: white; width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 2px solid #38BDF8; box-shadow: 0 2px 8px rgba(0,0,0,0.4);"><i class="fa-solid fa-truck text-[11px]"></i></div>`,
      iconSize: [28, 28]
    });
    const marker = L.marker([v.lat, v.lng], { icon: vIcon }).addTo(map)
      .bindPopup(`<b>${v.id} (${v.type})</b><br>Driver: ${v.driver}<br>Beat: ${v.beat}<br>Current Cargo: <b>${v.cargoKg} kg</b><br>Battery: ${v.battery}%`);
    vehicleMarkers[v.id] = marker;
  });
}

// -------------------------------------------------------------
// 3. UI Tab Switching
// -------------------------------------------------------------
function switchTab(tabId) {
  document.querySelectorAll('.tab-pane').forEach(el => el.classList.add('hidden'));
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.classList.remove('active', 'text-teal-400', 'bg-slate-800/80', 'border-teal-500/30');
    btn.classList.add('text-slate-400');
  });

  const activeBtn = document.getElementById(`btn-${tabId}`);
  if (activeBtn) {
    activeBtn.classList.add('active', 'text-teal-400', 'bg-slate-800/80', 'border-teal-500/30');
    activeBtn.classList.remove('text-slate-400');
  }

  const tabContentId = tabId.replace('-tab', '');
  const targetPane = document.getElementById(`tab-${tabContentId}`);
  if (targetPane) {
    targetPane.classList.remove('hidden');
  }

  if (tabId === 'gis-tab' && map) {
    setTimeout(() => { map.invalidateSize(); }, 200);
  }
}

// -------------------------------------------------------------
// 4. Render Fleet Telemetry List
// -------------------------------------------------------------
function renderFleetList() {
  const container = document.getElementById('fleet-list');
  if (!container) return;

  container.innerHTML = FLEET_DATA.map(v => `
    <div class="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition-all cursor-pointer" onclick="focusVehicle('${v.id}')">
      <div class="flex items-center justify-between">
        <span class="font-mono font-bold text-xs text-teal-400">${v.id}</span>
        <span class="text-[10px] px-1.5 py-0.5 rounded bg-blue-900/40 text-blue-300">${v.status}</span>
      </div>
      <div class="text-[11px] text-slate-300 font-medium mt-1">${v.driver}</div>
      <div class="flex items-center justify-between text-[10px] text-slate-500 mt-1.5 font-mono">
        <span>${v.beat}</span>
        <span><i class="fa-solid fa-battery-three-quarters text-emerald-400"></i> ${v.battery}%</span>
      </div>
    </div>
  `).join('');
}

function focusVehicle(id) {
  const v = FLEET_DATA.find(x => x.id === id);
  if (v && map && vehicleMarkers[id]) {
    map.flyTo([v.lat, v.lng], 14, { duration: 1 });
    vehicleMarkers[id].openPopup();
  }
}

function simulateTelemetryPacket() {
  FLEET_DATA.forEach(v => {
    // slight jitter to simulate live tracking
    v.lat += (Math.random() - 0.5) * 0.003;
    v.lng += (Math.random() - 0.5) * 0.003;
    if (vehicleMarkers[v.id]) {
      vehicleMarkers[v.id].setLatLng([v.lat, v.lng]);
    }
  });
  renderFleetList();
}

// -------------------------------------------------------------
// 5. Weighbridge Simulator & Fair Payout Calculation
// -------------------------------------------------------------
let currentTare = 980.0;
let currentNet = 470.0;

function manualWeightUpdate(val) {
  currentNet = parseFloat(val) || 0;
  const gross = currentTare + currentNet;
  document.getElementById('display-gross').innerHTML = `${gross.toFixed(1)} <span class="text-sm font-normal text-slate-500">kg</span>`;
  document.getElementById('display-net').innerHTML = `${currentNet.toFixed(1)} <span class="text-sm font-normal text-teal-500">kg</span>`;
  
  // Format raw serial string
  const grossStr = String(Math.round(gross)).padStart(6, '0');
  const tareStr = String(Math.round(currentTare)).padStart(6, '0');
  const netStr = String(Math.round(currentNet)).padStart(6, '0');
  document.getElementById('raw-serial-string').innerText = `ST,GS,+${grossStr}.0kg,TR,+${tareStr}.0kg,NT,+${netStr}.0kg\\r\\n`;

  updatePriceCalculation();
}

function updatePriceCalculation() {
  const matSelect = document.getElementById('weigh-material');
  const rate = parseFloat(matSelect.options[matSelect.selectedIndex].getAttribute('data-rate')) || 26.0;
  const total = currentNet * rate;
  document.getElementById('weigh-payout').innerText = `₹${total.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function speakAssameseSlip() {
  const matSelect = document.getElementById('weigh-material');
  const matName = matSelect.options[matSelect.selectedIndex].text.split('(')[0].trim();
  const payout = document.getElementById('weigh-payout').innerText;
  
  // Audio text
  const msg = `${currentNet} কিলোগ্ৰাম ${matName} গ্ৰহণ কৰা হৈছে। মুঠ পৰিশোধ ${payout}। PRIDE সমবায়ৰ তৰফৰ পৰা ধন্যবাদ।`;
  
  if ('speechSynthesis' in window) {
    const utterance = new SpeechSynthesisUtterance(msg);
    utterance.lang = 'bn-IN'; // closest voice for Eastern Indo-Aryan / Assamese
    utterance.rate = 0.95;
    window.speechSynthesis.speak(utterance);
  } else {
    alert("Audio Playback: " + msg);
  }
}

function commitWeighment() {
  const vehicle = document.getElementById('weigh-vehicle').value;
  const matSelect = document.getElementById('weigh-material');
  const matCode = matSelect.value;
  const payout = document.getElementById('weigh-payout').innerText;

  alert(`Weighment Committed Successfully!\n\nVehicle: ${vehicle}\nNet Weight: ${currentNet} kg\nMaterial: ${matCode}\nPayout Disbursed: ${payout}\n\nDigital Slip SMS dispatched to registered mobile number.`);
  
  // Update ingestion stats
  const statIngestion = document.getElementById('stat-ingestion');
  if (statIngestion) {
    let currentTotal = parseFloat(statIngestion.innerText);
    statIngestion.innerText = (currentTotal + (currentNet / 1000)).toFixed(2);
  }
}

// -------------------------------------------------------------
// 6. Worker Table & Search
// -------------------------------------------------------------
function renderWorkers(data = WORKER_DATA) {
  const tbody = document.getElementById('worker-table-body');
  if (!tbody) return;

  tbody.innerHTML = data.map(w => `
    <tr class="hover:bg-slate-800/40 transition-colors">
      <td class="p-3 font-semibold text-slate-200">
        <div class="font-mono text-teal-400 text-[11px]">${w.id}</div>
        <div>${w.name}</div>
      </td>
      <td class="p-3 font-mono text-slate-300">${w.vehicle}</td>
      <td class="p-3 text-slate-400">${w.ward}</td>
      <td class="p-3 font-mono font-bold text-white">${w.volume}</td>
      <td class="p-3 font-mono font-bold text-amber-400">${w.payout}</td>
      <td class="p-3 text-slate-400">
        <span class="inline-flex items-center space-x-1">
          <i class="fa-solid fa-building-columns text-[10px] text-teal-400"></i>
          <span>${w.channel}</span>
        </span>
      </td>
      <td class="p-3 text-right">
        <button onclick="alert('Viewing Digital DBT Receipt for ${w.name}:\\nAmount: ${w.payout}\\nVolume: ${w.volume}\\nBank Settlement Ref: UTR-98234-ASPB')" class="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-[11px]">
          Receipt
        </button>
      </td>
    </tr>
  `).join('');
}

function filterWorkers(query) {
  const q = query.toLowerCase();
  const filtered = WORKER_DATA.filter(w => 
    w.name.toLowerCase().includes(q) || 
    w.id.toLowerCase().includes(q) || 
    w.vehicle.toLowerCase().includes(q)
  );
  renderWorkers(filtered);
}

// -------------------------------------------------------------
// 7. EPR Table & Certificate Generator
// -------------------------------------------------------------
function renderEPR() {
  const tbody = document.getElementById('epr-table-body');
  if (!tbody) return;

  tbody.innerHTML = EPR_BATCHES.map(b => `
    <tr class="hover:bg-slate-800/40 transition-colors">
      <td class="p-3 font-mono font-bold text-teal-400">${b.id}</td>
      <td class="p-3 text-slate-200">${b.cat}</td>
      <td class="p-3 font-mono font-bold text-white">${b.weight}</td>
      <td class="p-3 text-slate-300">${b.recycler}</td>
      <td class="p-3 font-mono text-[11px] text-slate-500">${b.hash}</td>
      <td class="p-3 text-right">
        <span class="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-mono font-bold">
          ${b.status}
        </span>
      </td>
    </tr>
  `).join('');
}

function downloadEPRCertificate() {
  alert("CPCB / ASPCB Audit Manifest Generated:\n\nForm VI Mass-Balance Audit Ledger successfully cryptographically signed with SHA-256 token: 8f3a9e4c1d882b7f09a.\nReady for submission on the National Plastic Waste Management Portal.");
}

// -------------------------------------------------------------
// 8. Proposal Sections & 1-Click Copy
// -------------------------------------------------------------
function loadProposalSections() {
  // Fetch from markdown file or embedded structure
  fetch('NESFIC_I10_Proposal_Content.md')
    .then(r => r.text())
    .then(md => parseAndRenderProposal(md))
    .catch(() => {
      // Fallback: render default sections if fetch fails in local file://
      parseAndRenderProposal(getEmbeddedProposalText());
    });
}

function parseAndRenderProposal(content) {
  const container = document.getElementById('proposal-sections-container');
  if (!container) return;

  const sectionRegex = /### (\d+\..*?)\n\*\((Word Count:.*?)\)\*\n\n([\s\S]*?)(?=\n---|\n###|$)/g;
  let match;
  let html = '';

  while ((match = sectionRegex.exec(content)) !== null) {
    const title = match[1].trim();
    const wordInfo = match[2].trim();
    const body = match[3].trim();
    const sectionKey = title.split('.')[0].trim();

    PROPOSAL_SECTIONS[sectionKey] = body;

    html += `
      <div class="p-4 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between pb-2 mb-2 border-b border-slate-800/80 gap-2">
          <div class="flex items-center space-x-2">
            <span class="w-6 h-6 rounded-full bg-teal-500/20 text-teal-400 font-bold text-xs flex items-center justify-center font-mono">${sectionKey}</span>
            <h3 class="font-bold text-xs text-slate-100">${title}</h3>
          </div>
          <div class="flex items-center space-x-2">
            <span class="px-2 py-0.5 rounded bg-blue-900/40 text-blue-300 font-mono text-[11px]">${wordInfo}</span>
            <button onclick="copySectionText('${sectionKey}')" id="copy-btn-${sectionKey}" class="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-600 text-xs font-medium flex items-center space-x-1 transition-all">
              <i class="fa-solid fa-copy"></i>
              <span>Copy</span>
            </button>
          </div>
        </div>
        <div class="text-xs text-slate-300 leading-relaxed font-sans whitespace-pre-line max-h-48 overflow-y-auto pr-2 bg-slate-950/40 p-3 rounded-lg border border-slate-800/60 font-normal">
          ${escapeHtml(body)}
        </div>
      </div>
    `;
  }

  container.innerHTML = html;
}

function escapeHtml(text) {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function copySectionText(key) {
  const text = PROPOSAL_SECTIONS[key];
  if (!text) return;

  navigator.clipboard.writeText(text).then(() => {
    const btn = document.getElementById(`copy-btn-${key}`);
    if (btn) {
      btn.innerHTML = `<i class="fa-solid fa-check text-emerald-400"></i> <span class="text-emerald-400">Copied!</span>`;
      setTimeout(() => {
        btn.innerHTML = `<i class="fa-solid fa-copy"></i> <span>Copy</span>`;
      }, 2000);
    }
  });
}

function copyAllProposal() {
  fetch('NESFIC_I10_Proposal_Content.txt')
    .then(r => r.text())
    .then(txt => {
      navigator.clipboard.writeText(txt).then(() => {
        alert("Full Official Proposal Content Copied to Clipboard!\n\nAll 12 sections and budget tables are ready to paste.");
      });
    })
    .catch(() => {
      alert("Please open NESFIC_I10_Proposal_Content.txt to copy full contents.");
    });
}

function getEmbeddedProposalText() {
  return `# Proposal\n### 1. Problem understanding & user workflow\n*(Word Count: 423/500 words)*\nAssam’s municipal and regional waste management ecosystem faces acute operational fragmentation...\n---\n`;
}

// -------------------------------------------------------------
// 9. Startup & Initialization
// -------------------------------------------------------------
window.addEventListener('DOMContentLoaded', () => {
  initMap();
  renderFleetList();
  renderWorkers();
  renderEPR();
  loadProposalSections();
  updatePriceCalculation();
});
