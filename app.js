// PRIDE WasteOS (AsomiCycle) - Full Interactive Web Application Logic

// -------------------------------------------------------------
// 1. Data Store & State
// -------------------------------------------------------------
let FLEET_DATA = [];
let WORKER_DATA = [];
let EPR_BATCHES = [];
let PROPOSAL_SECTIONS = {};

let map;
let vehicleMarkers = {};
let floodLayerGroup;
let isFloodVisible = true;
let eventSource = null;

// Default Fallback Fleet if offline/static
const DEFAULT_FLEET = [
  { id: "AS-01-PR-101", driver: "Ramen Das (ৰমেন দাস)", type: "PRIDE Bahan EV", lat: 26.1820, lng: 91.7450, speed: 18, status: "Collecting", beat: "Ward 24 (Fancy Bazar)", cargoKg: 420, battery: 78 },
  { id: "AS-01-PR-102", driver: "Biren Kalita (বীৰেন কলিতা)", type: "PRIDE Bahan EV", lat: 26.1750, lng: 91.7700, speed: 22, status: "En Route MRF", beat: "Ward 12 (Paltan Bazar)", cargoKg: 580, battery: 64 },
  { id: "AS-01-PR-103", driver: "Manju Begum (মঞ্জু বেগম)", type: "PRIDE Bahan EV", lat: 26.1400, lng: 91.7900, speed: 14, status: "Collecting", beat: "Ward 36 (Dispur Capital)", cargoKg: 310, battery: 85 },
  { id: "AS-01-PR-104", driver: "Pranab Boro (প্ৰণৱ বড়ো)", type: "PRIDE Bahan EV", lat: 26.1380, lng: 91.6850, speed: 0, status: "At Boragaon MRF", beat: "Ward 48 (Jalukbari)", cargoKg: 650, battery: 92 },
  { id: "AS-01-PR-105", driver: "Anima Saikia (অনিমা শইকীয়া)", type: "PRIDE Bahan EV", lat: 26.1600, lng: 91.7200, speed: 16, status: "Collecting", beat: "Ward 18 (Uzanbazar)", cargoKg: 280, battery: 72 },
  { id: "AS-01-PR-106", driver: "Dipak Baruah (দীপক বৰুৱা)", type: "PRIDE Bahan EV", lat: 26.1650, lng: 91.7600, speed: 20, status: "Collecting", beat: "Ward 15 (Chandmari)", cargoKg: 390, battery: 81 },
  { id: "AS-01-PR-107", driver: "Rupali Deka (ৰূপালী ডেকা)", type: "PRIDE Bahan EV", lat: 26.1450, lng: 91.7400, speed: 15, status: "Collecting", beat: "Ward 28 (Ganeshguri)", cargoKg: 460, battery: 69 },
  { id: "AS-01-PR-108", driver: "Hiren Nath (হিৰেন নাথ)", type: "PRIDE Bahan EV", lat: 26.1700, lng: 91.7050, speed: 19, status: "En Route MRF", beat: "Ward 42 (Maligaon)", cargoKg: 520, battery: 60 }
];

// -------------------------------------------------------------
// 2. Leaflet Map Initialization
// -------------------------------------------------------------
function initMap() {
  const mapElement = document.getElementById('gis-map');
  if (!mapElement) return;

  // Guwahati center coordinates
  map = L.map('gis-map').setView([26.160, 91.735], 12);

  // CartoDB Voyager Map Tiles
  L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
    subdomains: 'abcd',
    maxZoom: 19
  }).addTo(map);

  // Layer group for flood hazards
  floodLayerGroup = L.layerGroup().addTo(map);

  // Add Facilities
  // 1. Boragaon Central MRF
  const mrfIcon = L.divIcon({
    className: 'custom-mrf-marker',
    html: `<div style="background-color: #0D9488; color: white; padding: 4px 8px; border-radius: 6px; font-weight: bold; font-size: 11px; border: 2px solid white; box-shadow: 0 4px 10px rgba(0,0,0,0.5);"><i class="fa-solid fa-industry"></i> PRIDE Boragaon MRF</div>`,
    iconSize: [150, 30]
  });
  L.marker([26.138, 91.685], { icon: mrfIcon }).addTo(map)
    .bindPopup("<b>PRIDE Central MRF Hub #1</b><br>Boragaon Corridor, Kamrup Metro<br>Capacity: 50 TPD &bull; 60T Digital Weighbridge");

  // 2. Nalbari Regional Transfer Hub
  L.marker([26.445, 91.435], { icon: mrfIcon }).addTo(map)
    .bindPopup("<b>PRIDE Nalbari Aggregation Center</b><br>Regional Transfer Station &bull; Plastic Baling Facility");

  // Add Flood Risk Polygons
  addFloodRiskOverlays();

  // Load and render fleet
  loadFleet();
}

function addFloodRiskOverlays() {
  floodLayerGroup.clearLayers();

  // Deepor Beel Eco-Sensitive Buffer Zone
  const deeporBeel = L.polygon([
    [26.125, 91.640],
    [26.140, 91.660],
    [26.115, 91.670],
    [26.105, 91.650]
  ], {
    color: '#06B6D4',
    fillColor: '#06B6D4',
    fillOpacity: 0.25,
    weight: 2,
    dashArray: '4, 4'
  }).bindPopup("<b>Deepor Beel Ramsar Wetland Zone</b><br>Mandatory Zero-Waste Leakage Buffer");

  // Anil Nagar / Nabin Nagar Waterlogging Zone
  const anilNagar = L.polygon([
    [26.170, 91.775],
    [26.176, 91.782],
    [26.172, 91.788],
    [26.166, 91.780]
  ], {
    color: '#EF4444',
    fillColor: '#EF4444',
    fillOpacity: 0.3,
    weight: 2
  }).bindPopup("<b>Monsoon Waterlogging Hotspot: Anil Nagar</b><br>Dynamic VRP: Rerouting PRIDE Bahan EVs");

  // Zoo Road Corridor
  const zooRoad = L.polygon([
    [26.155, 91.770],
    [26.163, 91.776],
    [26.160, 91.782],
    [26.152, 91.775]
  ], {
    color: '#F59E0B',
    fillColor: '#F59E0B',
    fillOpacity: 0.25,
    weight: 2
  }).bindPopup("<b>Traffic & Flash Flood Bottleneck: Zoo Road</b><br>Speed Limit: 15 km/h");

  floodLayerGroup.addLayer(deeporBeel);
  floodLayerGroup.addLayer(anilNagar);
  floodLayerGroup.addLayer(zooRoad);
}

function toggleFloodLayer() {
  isFloodVisible = !isFloodVisible;
  const btn = document.getElementById('btn-flood-toggle');
  const statusText = document.getElementById('flood-status-text');

  if (isFloodVisible) {
    map.addLayer(floodLayerGroup);
    if (statusText) statusText.innerText = "Visible";
    if (btn) btn.classList.remove('opacity-50');
  } else {
    map.removeLayer(floodLayerGroup);
    if (statusText) statusText.innerText = "Hidden";
    if (btn) btn.classList.add('opacity-50');
  }
}

// -------------------------------------------------------------
// 3. Telemetry Ingestion & Server-Sent Events (SSE)
// -------------------------------------------------------------
function loadFleet() {
  fetch('/api/fleet')
    .then(r => r.json())
    .then(data => {
      FLEET_DATA = data;
      updateFleetMarkers(FLEET_DATA);
      renderFleetList();
    })
    .catch(() => {
      FLEET_DATA = DEFAULT_FLEET;
      updateFleetMarkers(FLEET_DATA);
      renderFleetList();
    });

  setupSSE();
}

function setupSSE() {
  if (typeof EventSource !== "undefined") {
    try {
      eventSource = new EventSource('/api/telemetry/stream');
      
      eventSource.onmessage = function(event) {
        try {
          const fleet = JSON.parse(event.data);
          FLEET_DATA = fleet;
          updateFleetMarkers(FLEET_DATA);
          renderFleetList();
          
          const sseBadge = document.getElementById('sse-badge');
          const sseStatus = document.getElementById('sse-status');
          if (sseBadge) sseBadge.className = "pulse-badge";
          if (sseStatus) sseStatus.innerHTML = "Online (Live SSE)";
        } catch (e) {
          console.error("Error parsing SSE data", e);
        }
      };

      eventSource.onerror = function() {
        const sseStatus = document.getElementById('sse-status');
        if (sseStatus) sseStatus.innerHTML = "Polling Mode (Fallback)";
      };
    } catch (e) {
      console.warn("SSE not available, using periodic polling");
    }
  }
}

function updateFleetMarkers(fleet) {
  if (!map) return;

  const countBadge = document.getElementById('active-vehicles-count');
  if (countBadge) countBadge.innerText = `${fleet.length} Active`;
  const fleetBadgeCount = document.getElementById('fleet-badge-count');
  if (fleetBadgeCount) fleetBadgeCount.innerText = `${fleet.length} Online`;

  fleet.forEach(v => {
    if (vehicleMarkers[v.id]) {
      // Smooth movement
      vehicleMarkers[v.id].setLatLng([v.lat, v.lng]);
      vehicleMarkers[v.id].setPopupContent(`
        <b>${v.id} (${v.type})</b><br>
        Driver: ${v.driver}<br>
        Beat: ${v.beat}<br>
        Speed: <b>${v.speed || 15} km/h</b> &bull; Cargo: <b>${v.cargoKg} kg</b><br>
        Battery: <b>${v.battery}%</b>
      `);
    } else {
      const vIcon = L.divIcon({
        className: 'custom-v-marker',
        html: `<div style="background-color: #1E3A8A; color: white; width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 2px solid #38BDF8; box-shadow: 0 2px 8px rgba(0,0,0,0.5);"><i class="fa-solid fa-truck text-[11px]"></i></div>`,
        iconSize: [28, 28]
      });

      const marker = L.marker([v.lat, v.lng], { icon: vIcon }).addTo(map)
        .bindPopup(`
          <b>${v.id} (${v.type})</b><br>
          Driver: ${v.driver}<br>
          Beat: ${v.beat}<br>
          Speed: <b>${v.speed || 15} km/h</b> &bull; Cargo: <b>${v.cargoKg} kg</b><br>
          Battery: <b>${v.battery}%</b>
        `);
      vehicleMarkers[v.id] = marker;
    }
  });
}

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

function triggerManualPing() {
  FLEET_DATA.forEach(v => {
    v.lat += (Math.random() - 0.5) * 0.002;
    v.lng += (Math.random() - 0.5) * 0.002;
    if (vehicleMarkers[v.id]) {
      vehicleMarkers[v.id].setLatLng([v.lat, v.lng]);
    }
  });
  renderFleetList();
}

// -------------------------------------------------------------
// 4. UI Tab Switching
// -------------------------------------------------------------
function switchTab(tabId) {
  document.querySelectorAll('.tab-pane').forEach(el => el.classList.add('hidden'));
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.classList.remove('active', 'text-blue-700', 'bg-blue-50', 'border-blue-200', 'text-teal-400', 'bg-slate-800/80', 'border-teal-500/30');
    btn.classList.add('text-slate-600');
  });

  const activeBtn = document.getElementById(`btn-${tabId}`);
  if (activeBtn) {
    activeBtn.classList.add('active', 'text-blue-700', 'bg-blue-50', 'border-blue-200');
    activeBtn.classList.remove('text-slate-600');
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
  
  // Audio text in Assamese
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
  const matLabel = matSelect.options[matSelect.selectedIndex].text.split('(')[0].trim();
  const rate = parseFloat(matSelect.options[matSelect.selectedIndex].getAttribute('data-rate')) || 26.0;
  const payout = currentNet * rate;

  const payload = {
    vehicle: vehicle,
    material: matCode,
    netKg: currentNet,
    grossKg: currentTare + currentNet,
    rate: rate
  };

  fetch('/api/weighbridge/ingest', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  })
  .then(r => r.json())
  .then(res => {
    const slip = res.weighment || {
      id: `WGH-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      timestamp: new Date().toISOString()
    };

    // Open receipt modal
    document.getElementById('slip-id').innerText = slip.id;
    document.getElementById('slip-time').innerText = new Date().toLocaleString('en-IN');
    document.getElementById('slip-vehicle').innerText = vehicle;
    document.getElementById('slip-material').innerText = matLabel;
    document.getElementById('slip-gross').innerText = `${(currentTare + currentNet).toFixed(1)} kg`;
    document.getElementById('slip-tare').innerText = `${currentTare.toFixed(1)} kg`;
    document.getElementById('slip-net').innerText = `${currentNet.toFixed(1)} kg`;
    document.getElementById('slip-rate').innerText = `₹${rate.toFixed(2)} / kg`;
    document.getElementById('slip-payout').innerText = `₹${payout.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

    document.getElementById('receipt-modal').classList.remove('hidden');

    // Update ingestion metric
    const statIngestion = document.getElementById('stat-ingestion');
    if (statIngestion) {
      let currentTotal = parseFloat(statIngestion.innerText);
      statIngestion.innerText = (currentTotal + (currentNet / 1000)).toFixed(2);
    }

    // Refresh workers table
    loadWorkers();
  })
  .catch(() => {
    alert(`Weighment Logged Locally:\nVehicle: ${vehicle}\nNet: ${currentNet} kg\nPayout: ₹${payout.toFixed(2)}`);
  });
}

function closeReceiptModal() {
  document.getElementById('receipt-modal').classList.add('hidden');
}

// -------------------------------------------------------------
// 6. Worker Table, Search & Onboarding
// -------------------------------------------------------------
function loadWorkers() {
  fetch('/api/workers')
    .then(r => r.json())
    .then(data => {
      WORKER_DATA = data;
      renderWorkers(WORKER_DATA);
    })
    .catch(() => {
      // Default fallback workers
      WORKER_DATA = [
        { id: "SW-0101", name: "Ramen Das (ৰমেন দাস)", vehicle: "AS-01-PR-101", ward: "Ward 24 (Fancy Bazar)", volume: 420, payout: 10920, status: "Processed", channel: "Aadhaar AePS / SBI" },
        { id: "SW-0102", name: "Biren Kalita (বীৰেন কলিতা)", vehicle: "AS-01-PR-102", ward: "Ward 12 (Paltan Bazar)", volume: 580, payout: 15080, status: "Pending Scale", channel: "Cooperative Wallet" },
        { id: "SW-0103", name: "Manju Begum (মঞ্জু বেগম)", vehicle: "AS-01-PR-103", ward: "Ward 36 (Dispur)", volume: 310, payout: 8060, status: "Processed", channel: "Direct UPI / PNB" },
        { id: "SW-0104", name: "Tapan Boro (তপন বড়ো)", vehicle: "IND-CYCLE-044", ward: "Ward 48 (Jalukbari)", volume: 165, payout: 4290, status: "Processed", channel: "Cash Slip / Coop Branch" },
        { id: "SW-0105", name: "Anima Saikia (অনিমা শইকীয়া)", vehicle: "AS-01-PR-105", ward: "Ward 18 (Uzanbazar)", volume: 280, payout: 7280, status: "Processed", channel: "Direct UPI / AGVB" }
      ];
      renderWorkers(WORKER_DATA);
    });
}

function renderWorkers(data = WORKER_DATA) {
  const tbody = document.getElementById('worker-table-body');
  if (!tbody) return;

  tbody.innerHTML = data.map(w => `
    <tr class="hover:bg-slate-800/40 transition-colors">
      <td class="p-3 font-semibold text-slate-200">
        <div class="font-mono text-teal-400 text-[11px]">${w.id}</div>
        <div>${w.name}</div>
        ${w.phone ? `<div class="text-[10px] text-slate-500">${w.phone}</div>` : ''}
      </td>
      <td class="p-3 font-mono text-slate-300">${w.vehicle}</td>
      <td class="p-3 text-slate-400">${w.ward}</td>
      <td class="p-3 font-mono font-bold text-white">${w.volume} kg</td>
      <td class="p-3 font-mono font-bold text-amber-400">₹${Number(w.payout).toLocaleString('en-IN')}</td>
      <td class="p-3 text-slate-400">
        <span class="inline-flex items-center space-x-1">
          <i class="fa-solid fa-building-columns text-[10px] text-teal-400"></i>
          <span>${w.channel}</span>
        </span>
      </td>
      <td class="p-3 text-right">
        <button onclick="alert('Viewing Digital DBT Ledger Receipt for ${w.name}:\\nAmount Disbursed: ₹${w.payout}\\nVolume: ${w.volume} kg\\nSettlement Channel: ${w.channel}\\nStatus: Verified Complete')" class="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-[11px]">
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
    w.vehicle.toLowerCase().includes(q) ||
    w.ward.toLowerCase().includes(q)
  );
  renderWorkers(filtered);
}

function openNewWorkerModal() {
  document.getElementById('worker-modal').classList.remove('hidden');
}

function closeWorkerModal() {
  document.getElementById('worker-modal').classList.add('hidden');
}

function handleNewWorkerSubmit(e) {
  e.preventDefault();
  const newWorker = {
    name: document.getElementById('nw-name').value,
    phone: document.getElementById('nw-phone').value,
    vehicle: document.getElementById('nw-vehicle').value,
    ward: document.getElementById('nw-ward').value,
    channel: document.getElementById('nw-channel').value
  };

  fetch('/api/workers/add', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(newWorker)
  })
  .then(r => r.json())
  .then(res => {
    closeWorkerModal();
    alert(`Safai Sathi Onboarded Successfully!\n\nID: ${res.worker.id}\nName: ${res.worker.name}\nVehicle: ${res.worker.vehicle}`);
    loadWorkers();
  })
  .catch(() => {
    newWorker.id = `SW-${String(WORKER_DATA.length + 101).padStart(4, '0')}`;
    newWorker.volume = 0;
    newWorker.payout = 0;
    WORKER_DATA.unshift(newWorker);
    renderWorkers(WORKER_DATA);
    closeWorkerModal();
  });
}

// -------------------------------------------------------------
// 7. EPR Table & Modal Certificate Viewer
// -------------------------------------------------------------
function loadEPR() {
  fetch('/api/epr/batches')
    .then(r => r.json())
    .then(data => {
      EPR_BATCHES = data;
      renderEPR();
    })
    .catch(() => {
      EPR_BATCHES = [
        { id: "EPR-AS-2026-081", cat: "Category I (Rigid PET)", weightTons: 18.4, recycler: "North East Eco-Polymers Ltd. (Amingaon)", hash: "8f3a9e4c1d882b7f09a12c8b7764e21a", status: "Certified" },
        { id: "EPR-AS-2026-082", cat: "Category I (HDPE Containers)", weightTons: 15.8, recycler: "Pragjyotish Plast-Recycle Ltd. (Nalbari)", hash: "3e5b12a90fd7189c445a661b09823ce1", status: "Certified" },
        { id: "EPR-AS-2026-083", cat: "Category II (Flexible MLP)", weightTons: 12.8, recycler: "Brahmaputra Green Solutions (Guwahati)", hash: "9c8a41b72e5091ff82a39b4c02914db2", status: "Verified" },
        { id: "EPR-AS-2026-084", cat: "Category III (Multi-Layer)", weightTons: 5.6, recycler: "Guwahati Cement Kiln Co-Proc.", hash: "1d4f77e63c0047fa189c33bb71900da4", status: "Audited" }
      ];
      renderEPR();
    });
}

function renderEPR() {
  const tbody = document.getElementById('epr-table-body');
  if (!tbody) return;

  tbody.innerHTML = EPR_BATCHES.map(b => `
    <tr class="hover:bg-slate-800/40 transition-colors">
      <td class="p-3 font-mono font-bold text-teal-400 cursor-pointer" onclick="viewEPRCertificateModal('${b.id}')">${b.id}</td>
      <td class="p-3 text-slate-200">${b.cat}</td>
      <td class="p-3 font-mono font-bold text-white">${b.weightTons} Tons</td>
      <td class="p-3 text-slate-300">${b.recycler}</td>
      <td class="p-3 font-mono text-[11px] text-slate-500">${b.hash.substring(0, 10)}...</td>
      <td class="p-3 text-right">
        <button onclick="viewEPRCertificateModal('${b.id}')" class="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-mono font-bold hover:bg-emerald-500/30">
          ${b.status}
        </button>
      </td>
    </tr>
  `).join('');
}

function viewEPRCertificateModal(batchId) {
  const b = EPR_BATCHES.find(x => x.id === batchId) || EPR_BATCHES[0];
  document.getElementById('epr-cert-id').innerText = b.id;
  document.getElementById('epr-cert-cat').innerText = b.cat;
  document.getElementById('epr-cert-weight').innerText = `${b.weightTons} Metric Tons`;
  document.getElementById('epr-cert-recycler').innerText = b.recycler;
  document.getElementById('epr-cert-hash').innerText = b.hash;
  document.getElementById('epr-modal').classList.remove('hidden');
}

function closeEPRModal() {
  document.getElementById('epr-modal').classList.add('hidden');
}

// -------------------------------------------------------------
// 8. Proposal Sections & 1-Click Copy Hub
// -------------------------------------------------------------
function loadProposalSections() {
  fetch('NESFIC_I10_Proposal_Content.md')
    .then(r => r.text())
    .then(md => parseAndRenderProposal(md))
    .catch(() => {
      console.warn("Could not load markdown file directly");
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

// -------------------------------------------------------------
// 9. Startup & Initialization
// -------------------------------------------------------------
window.addEventListener('DOMContentLoaded', () => {
  initMap();
  loadWorkers();
  loadEPR();
  loadProposalSections();
  updatePriceCalculation();
});
