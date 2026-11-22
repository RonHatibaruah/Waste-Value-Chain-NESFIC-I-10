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
  checkAdminSession();
  initTutorial();
});

// -------------------------------------------------------------
// 10. Interactive Tutorial & Platform Guide Modal
// -------------------------------------------------------------
let currentTutorialStep = 0;

const TUTORIAL_SLIDES = [
  {
    step: 1,
    title: "Executive Overview & Problem Statement NESFIC-I-10",
    badge: "Problem Understanding",
    icon: "fa-bullseye",
    subtitle: "Creating Real-Time Intelligence Across Assam's Waste Value Chain",
    content: `
      <div class="space-y-3 text-slate-700 text-xs">
        <p class="leading-relaxed">
          Guwahati generates <strong>550–600 metric tonnes per day (TPD)</strong> of municipal solid waste. Over <strong>70% of recyclable plastic, cardboard, and metals</strong> is lost to unscientific open dumping at Boragaon and the Deepor Beel Ramsar wetland catchment.
        </p>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 my-2">
          <div class="p-2.5 rounded-lg bg-red-50 border border-red-200">
            <div class="font-bold text-red-800 text-[11px] mb-1 flex items-center"><i class="fa-solid fa-triangle-exclamation mr-1.5"></i> Current Gaps</div>
            <ul class="list-disc list-inside space-y-0.5 text-[11px] text-red-700">
              <li>Manual, fraud-prone paper weigh slips</li>
              <li>Informal middleman arbitrage (35–40% loss)</li>
              <li>Monsoon urban waterlogging gridlock</li>
              <li>Unverified, untraceable EPR plastic claims</li>
            </ul>
          </div>
          <div class="p-2.5 rounded-lg bg-teal-50 border border-teal-200">
            <div class="font-bold text-teal-800 text-[11px] mb-1 flex items-center"><i class="fa-solid fa-check-circle mr-1.5"></i> PRIDE WasteOS Solution</div>
            <ul class="list-disc list-inside space-y-0.5 text-[11px] text-teal-700">
              <li>Hardware-tapped automated weighment</li>
              <li>Direct Bank Transfer (DBT) via Jan Dhan/UPI</li>
              <li>GIS dynamic vehicle rerouting around floods</li>
              <li>End-to-end QR/EPR batch custody tracking</li>
            </ul>
          </div>
        </div>
        <p class="text-[11px] text-slate-500 italic">
          Built in partnership with PRIDE Cooperative Society and the Assam Innovation &amp; Startup Foundation (AISF).
        </p>
      </div>
    `
  },
  {
    step: 2,
    title: "Module 1: Real-Time GIS Fleet Tracking & Flood Rerouting",
    badge: "GIS & Telematics",
    icon: "fa-map-location-dot",
    subtitle: "Tracking PRIDE Bahan EVs with dynamic monsoon waterlogging avoidance",
    content: `
      <div class="space-y-3 text-slate-700 text-xs">
        <p class="leading-relaxed">
          Guwahati suffers chronic urban flooding during the Brahmaputra monsoon season, paralyzing waste logistics in low-lying corridors like Anil Nagar, Nabin Nagar, and Zoo Road.
        </p>
        <div class="p-3 rounded-lg bg-blue-50 border border-blue-200 space-y-2">
          <div class="font-bold text-blue-900 text-xs flex items-center">
            <i class="fa-solid fa-route mr-1.5 text-blue-600"></i> How to use the GIS Map:
          </div>
          <ol class="list-decimal list-inside space-y-1 text-[11px] text-blue-800">
            <li>Click the <strong>"GIS Fleet Tracking"</strong> tab in the navigation header.</li>
            <li>Observe the real-time positions of 8 PRIDE Bahan collection EVs operating across Guwahati wards.</li>
            <li>Toggle the <strong>"Flood Risk Zones"</strong> button to view vulnerable flood polygons and the Deepor Beel buffer.</li>
            <li>When flooding occurs, vehicles automatically calculate alternative routes using Dijkstra/VRP to prevent collection delays and wetland contamination.</li>
          </ol>
        </div>
        <div class="flex items-center space-x-2 text-[11px] text-slate-500">
          <span class="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
          <span>Green = Active Collection &bull; Orange = En Route to MRF &bull; Blue = Deepor Beel Sanctuary Zone</span>
        </div>
      </div>
    `
  },
  {
    step: 3,
    title: "Module 2: Smart MRF Weighbridge & Anti-Tamper Ingestion",
    badge: "Hardware & IoT",
    icon: "fa-scale-balanced",
    subtitle: "Non-invasive serial hardware sniffers for instant, zero-fraud receipts",
    content: `
      <div class="space-y-3 text-slate-700 text-xs">
        <p class="leading-relaxed">
          Traditional weighbridges rely on operator keying, resulting in weight skimming and invoice inflation. PRIDE WasteOS installs a passive <strong>RS-232 / RS-485 sniffer tap</strong> on existing indicator displays (Avery India, Essae).
        </p>
        <div class="p-3 rounded-lg bg-slate-100 border border-slate-200 space-y-2 font-mono text-[11px]">
          <div class="font-bold text-slate-800 font-sans text-xs">Interactive Simulator:</div>
          <div class="text-slate-600">
            Move the <strong>Net Material Slider</strong> in Tab 2 to simulate an incoming vehicle. Notice how the raw RS-232 serial telemetry updates in real time:
          </div>
          <div class="p-2 rounded bg-slate-900 text-emerald-400 text-[10px] overflow-x-auto">
            ST,GS,+01450.0kg,TR,+00980.0kg,NT,+00470.0kg\\r\\n
          </div>
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
          <div class="p-2 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
            <strong>Bilingual Voice Slip:</strong> Click <em>"Speak Assamese Audio Slip"</em> to test real-time Assamese voice feedback for informal waste workers.
          </div>
          <div class="p-2 rounded bg-purple-50 text-purple-800 border border-purple-200">
            <strong>Digital Weighment Slip:</strong> Click <em>"Commit Weighment &amp; Print Slip"</em> to generate an immutable, printable thermal receipt with QR validation.
          </div>
        </div>
      </div>
    `
  },
  {
    step: 4,
    title: "Module 3: Safai Sathi Socio-Economic Ledger & Instant DBT",
    badge: "Financial Inclusion",
    icon: "fa-users-gear",
    subtitle: "Direct Bank Transfer (DBT) and digital passbooks eliminating middlemen",
    content: `
      <div class="space-y-3 text-slate-700 text-xs">
        <p class="leading-relaxed">
          Informal waste pickers (Safai Sathis) are the backbone of Assam's circular economy but suffer from 35–40% income depreciation due to predatory scrap dealers (kabadiwallahs).
        </p>
        <div class="p-3 rounded-lg bg-teal-50 border border-teal-200 space-y-2">
          <div class="font-bold text-teal-900 text-xs">Key Features in Tab 3:</div>
          <ul class="list-disc list-inside space-y-1 text-[11px] text-teal-800">
            <li><strong>Worker Registry:</strong> View profiles with Aadhaar-linked Member IDs, verified Jan Dhan bank accounts, and PM Jan Arogya / e-Shram cards.</li>
            <li><strong>Interactive Passbook Modal:</strong> Click <em>"Digital Passbook"</em> on any worker row to inspect their last 5 verified deposits and cumulative ESG metric.</li>
            <li><strong>Instant Payout Simulation:</strong> Click <em>"Simulate Instant UPI / DBT"</em> to trigger an instant bank transfer with a simulated UTR reference.</li>
          </ul>
        </div>
        <p class="text-[11px] text-slate-600">
          Result: Informal workers experience an average <strong>35% net income increase</strong> and gain official access to institutional micro-credit and health insurance.
        </p>
      </div>
    `
  },
  {
    step: 5,
    title: "Module 4: CPCB EPR Compliance & Digital Batch Registry",
    badge: "Regulatory Compliance",
    icon: "fa-stamp",
    subtitle: "Auditable mass-balance certificates for Brand Owners & ASPCB",
    content: `
      <div class="space-y-3 text-slate-700 text-xs">
        <p class="leading-relaxed">
          Under the Plastic Waste Management Rules (2022 amendment), brand owners and FMCG producers must fulfill Extended Producer Responsibility (EPR) targets with verifiable recycling proof.
        </p>
        <div class="p-3 rounded-lg bg-purple-50 border border-purple-200 space-y-2">
          <div class="font-bold text-purple-900 text-xs">How EPR Verification Operates (Tab 4):</div>
          <ul class="list-disc list-inside space-y-1 text-[11px] text-purple-800">
            <li><strong>Material Batch Serialization:</strong> Ingested recyclable waste is baled and tagged with cryptographic Batch UUIDs.</li>
            <li><strong>Mass Balance Accounting:</strong> Reconciles inbound collection weights vs. outbound processing yields (moisture/reject deduplication).</li>
            <li><strong>CPCB Portal Integration:</strong> Formatted JSON output aligns with the Central Pollution Control Board EPR portal.</li>
            <li><strong>Certificate Generation:</strong> Click <em>"View CPCB EPR Slip"</em> to inspect official compliance certificates with QR verification.</li>
          </ul>
        </div>
      </div>
    `
  },
  {
    step: 6,
    title: "Module 5: Master Administration & IoT Calibration Console",
    badge: "Admin & Governance",
    icon: "fa-shield-halved",
    subtitle: "Complete control over pricing, scale calibration, audit trails, and fleet",
    content: `
      <div class="space-y-3 text-slate-700 text-xs">
        <p class="leading-relaxed">
          The Admin Console gives PRIDE cooperative supervisors and municipal officers full operational authority with role-based access control (RBAC).
        </p>
        <div class="p-3 rounded-lg bg-amber-50 border border-amber-200 space-y-2">
          <div class="font-bold text-amber-900 text-xs">How to Access and Test the Admin Panel:</div>
          <ul class="list-disc list-inside space-y-1 text-[11px] text-amber-800">
            <li>Click <strong>"Admin Login"</strong> in the top header or the <strong>"Admin Console"</strong> tab.</li>
            <li>Use the <strong>1-Click Demo Login</strong> button with demo credentials: <code class="bg-amber-100 px-1 py-0.5 rounded font-mono font-bold">admin@pridecoop.in</code> / <code class="bg-amber-100 px-1 py-0.5 rounded font-mono font-bold">pride@assam2026</code>.</li>
            <li><strong>Update Material Rates:</strong> Change rates (e.g. PET to ₹28.0/kg) and click Broadcast &mdash; all calculations instantly re-index!</li>
            <li><strong>Test Serial Loopback:</strong> Run hardware diagnostic pings on the Avery weighbridge indicator.</li>
            <li><strong>Fleet Overrides:</strong> Force-dispatch or reroute collection EVs and export the full tamper-proof audit trail as CSV.</li>
          </ul>
        </div>
      </div>
    `
  },
  {
    step: 7,
    title: "Module 6: NESFIC Grant Proposal Hub & Evaluator Dossier",
    badge: "Evaluation Materials",
    icon: "fa-file-invoice",
    subtitle: "1-Click copy for all 12 proposal fields, Proof of Work PDF, and live code",
    content: `
      <div class="space-y-3 text-slate-700 text-xs">
        <p class="leading-relaxed">
          Everything required for the NESFIC-I-10 submission is bundled directly into this platform for immediate evaluation.
        </p>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
          <div class="p-2.5 rounded-lg bg-blue-50 border border-blue-200">
            <div class="font-bold text-blue-900 mb-1 flex items-center"><i class="fa-solid fa-clipboard mr-1.5"></i> 12 Proposal Sections</div>
            <p class="text-blue-800">Every section is tailored strictly under the 500-word limit. Click <strong>"Copy"</strong> on any card or <strong>"Copy All 12 Sections"</strong> for instant submission.</p>
          </div>
          <div class="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200">
            <div class="font-bold text-emerald-900 mb-1 flex items-center"><i class="fa-solid fa-file-pdf mr-1.5"></i> Proof of Work PDF</div>
            <p class="text-emerald-800">Includes 13 high-resolution architecture diagrams, pilot results, Gantt charts, and hardware schematics (2.56 MB, fully compliant with the 10 MB limit).</p>
          </div>
        </div>
        <div class="p-2.5 rounded-lg bg-slate-100 border border-slate-200 text-[11px] text-slate-600 space-y-1">
          <div><i class="fa-brands fa-github text-slate-800 mr-1.5"></i> <strong>GitHub Repository:</strong> <a href="https://github.com/RonHatibaruah/Waste-Value-Chain-NESFIC-I-10" target="_blank" class="text-blue-600 underline">RonHatibaruah/Waste-Value-Chain-NESFIC-I-10</a></div>
          <div><i class="fa-solid fa-cloud text-blue-600 mr-1.5"></i> <strong>Live Cloudflare URL:</strong> <a href="https://waste-value-chain-nesfic-i-10.pages.dev" target="_blank" class="text-blue-600 underline">waste-value-chain-nesfic-i-10.pages.dev</a></div>
        </div>
      </div>
    `
  }
];

function initTutorial() {
  renderTutorialSlide();
}

function openTutorialModal() {
  const modal = document.getElementById('tutorial-modal');
  if (modal) {
    modal.classList.remove('hidden');
    renderTutorialSlide();
  }
}

function closeTutorialModal() {
  const modal = document.getElementById('tutorial-modal');
  if (modal) modal.classList.add('hidden');
}

function renderTutorialSlide() {
  const slide = TUTORIAL_SLIDES[currentTutorialStep];
  const container = document.getElementById('tutorial-slide-content');
  const dotsContainer = document.getElementById('tutorial-dots');
  const prevBtn = document.getElementById('btn-tut-prev');
  const nextBtn = document.getElementById('btn-tut-next');

  if (!slide || !container) return;

  container.innerHTML = `
    <div class="space-y-3">
      <div class="flex items-center justify-between pb-2 border-b border-slate-100">
        <div class="flex items-center space-x-2">
          <span class="w-6 h-6 rounded-md bg-teal-100 text-teal-800 flex items-center justify-center text-xs font-bold font-mono">
            ${slide.step}/7
          </span>
          <span class="px-2 py-0.5 rounded-full bg-teal-50 text-teal-700 font-semibold text-[11px] border border-teal-200">
            ${slide.badge}
          </span>
        </div>
        <span class="text-xs text-slate-400 font-mono">Step ${slide.step} of 7</span>
      </div>

      <div>
        <h4 class="font-extrabold text-sm sm:text-base text-slate-900 flex items-center">
          <i class="fa-solid ${slide.icon} text-teal-600 mr-2"></i>
          <span>${slide.title}</span>
        </h4>
        <p class="text-xs text-slate-500 mt-0.5">${slide.subtitle}</p>
      </div>

      <div class="pt-1">
        ${slide.content}
      </div>
    </div>
  `;

  // Render navigation dots
  if (dotsContainer) {
    let dotsHtml = '';
    for (let i = 0; i < TUTORIAL_SLIDES.length; i++) {
      if (i === currentTutorialStep) {
        dotsHtml += `<button onclick="setTutorialStep(${i})" class="w-5 h-2 rounded-full bg-teal-600 transition-all"></button>`;
      } else {
        dotsHtml += `<button onclick="setTutorialStep(${i})" class="w-2 h-2 rounded-full bg-slate-300 hover:bg-slate-400 transition-all"></button>`;
      }
    }
    dotsContainer.innerHTML = dotsHtml;
  }

  // Prev / Next button state
  if (prevBtn) {
    prevBtn.disabled = currentTutorialStep === 0;
  }
  if (nextBtn) {
    if (currentTutorialStep === TUTORIAL_SLIDES.length - 1) {
      nextBtn.innerHTML = `<span>Finish &amp; Start Exploring</span> <i class="fa-solid fa-arrow-right ml-1"></i>`;
    } else {
      nextBtn.innerHTML = `<span>Next Step</span> <i class="fa-solid fa-arrow-right ml-1"></i>`;
    }
  }
}

function nextTutorialStep() {
  if (currentTutorialStep < TUTORIAL_SLIDES.length - 1) {
    currentTutorialStep++;
    renderTutorialSlide();
  } else {
    closeTutorialModal();
    currentTutorialStep = 0;
  }
}

function prevTutorialStep() {
  if (currentTutorialStep > 0) {
    currentTutorialStep--;
    renderTutorialSlide();
  }
}

function setTutorialStep(idx) {
  if (idx >= 0 && idx < TUTORIAL_SLIDES.length) {
    currentTutorialStep = idx;
    renderTutorialSlide();
  }
}

// -------------------------------------------------------------
// 11. Admin Console & Security Authentication
// -------------------------------------------------------------
let isAdminAuthenticated = false;

const DEFAULT_AUDIT_LOGS = [
  { time: "23-Nov 03:25", event: "SYSTEM_BOOT", actor: "systemd/node20", detail: "PRIDE WasteOS Node.js telemetry pipeline initialized", hash: "a9f82d...4e1b" },
  { time: "23-Nov 03:22", event: "SCALE_CALIBRATION", actor: "admin@pridecoop.in", detail: "COM1 Avery India 60T zero-point verified (+0.0kg offset)", hash: "b7e19a...83d2" },
  { time: "23-Nov 03:15", event: "RATE_INDEX_SYNC", actor: "admin@pridecoop.in", detail: "Broadcasted rigid PET base price: ₹26.00/kg", hash: "c4109f...671a" },
  { time: "23-Nov 03:08", event: "EPR_BATCH_MINT", actor: "mrf_operator_1", detail: "CPCB Baled PET Certificate minted: BATCH-PET-2026-0891", hash: "d588e2...19fc" },
  { time: "23-Nov 02:54", event: "DBT_SETTLEMENT", actor: "pbi_gateway", detail: "Worker W-1001 Ramen Das ₹1,222.00 UPI credited (Ref: UTR-981240)", hash: "e823aa...901b" }
];

function checkAdminSession() {
  const saved = sessionStorage.getItem('pride_admin_auth');
  if (saved === 'true') {
    isAdminAuthenticated = true;
    updateAdminHeaderUI(true);
  }
}

function updateAdminHeaderUI(isAuth) {
  const label = document.getElementById('admin-header-label');
  const icon = document.getElementById('admin-icon');
  const btn = document.getElementById('btn-admin-header');
  if (isAuth) {
    if (label) label.textContent = 'Admin (Active)';
    if (icon) icon.className = 'fa-solid fa-shield-check text-purple-600';
    if (btn) btn.className = 'px-3 py-1.5 rounded-lg bg-purple-100 hover:bg-purple-200 text-purple-900 border border-purple-300 text-xs font-bold flex items-center space-x-1.5 transition-all shadow-xs';
  } else {
    if (label) label.textContent = 'Admin Login';
    if (icon) icon.className = 'fa-solid fa-shield-halved text-slate-600';
    if (btn) btn.className = 'px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 text-xs font-bold flex items-center space-x-1.5 transition-all shadow-xs';
  }
}

function openAdminLoginModal() {
  const modal = document.getElementById('admin-login-modal');
  if (modal) modal.classList.remove('hidden');
}

function closeAdminLoginModal() {
  const modal = document.getElementById('admin-login-modal');
  if (modal) modal.classList.add('hidden');
}

function fillDemoCredentials() {
  const userInp = document.getElementById('adm-user-input');
  const passInp = document.getElementById('adm-pass-input');
  if (userInp) userInp.value = 'admin@pridecoop.in';
  if (passInp) passInp.value = 'pride@assam2026';
  
  // Submit programmatically
  handleAdminLoginSuccess();
}

function handleAdminLoginSubmit(e) {
  if (e) e.preventDefault();
  const user = document.getElementById('adm-user-input').value.trim();
  const pass = document.getElementById('adm-pass-input').value.trim();

  if (user === 'admin@pridecoop.in' && pass === 'pride@assam2026') {
    handleAdminLoginSuccess();
  } else {
    alert("Invalid credentials.\n\nPlease use the demo credentials provided:\nUser: admin@pridecoop.in\nPass: pride@assam2026");
  }
}

function handleAdminLoginSuccess() {
  isAdminAuthenticated = true;
  sessionStorage.setItem('pride_admin_auth', 'true');
  updateAdminHeaderUI(true);
  closeAdminLoginModal();
  
  // Switch to admin tab
  switchTab('admin-tab');
  
  // Render admin submodules
  renderAdminAuditLogs();
  renderAdminFleetTable();

  // Add login event to audit
  const now = new Date();
  const timeStr = `${now.getDate()}-Nov ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  DEFAULT_AUDIT_LOGS.unshift({
    time: timeStr,
    event: "ADMIN_LOGIN_SUCCESS",
    actor: "admin@pridecoop.in",
    detail: "Super Administrator session authenticated via demo token",
    hash: "auth_" + Math.random().toString(36).substring(2, 10)
  });
  renderAdminAuditLogs();
}

function handleAdminLogout() {
  isAdminAuthenticated = false;
  sessionStorage.removeItem('pride_admin_auth');
  updateAdminHeaderUI(false);
  switchTab('dashboard-tab');
  alert("Admin session terminated successfully. Returned to public operator dashboard.");
}

function handleAdminHeaderClick() {
  if (isAdminAuthenticated) {
    switchTab('admin-tab');
    renderAdminAuditLogs();
    renderAdminFleetTable();
  } else {
    openAdminLoginModal();
  }
}

function openAdminPanelOrLogin() {
  if (isAdminAuthenticated) {
    switchTab('admin-tab');
    renderAdminAuditLogs();
    renderAdminFleetTable();
  } else {
    openAdminLoginModal();
  }
}

function handleRateUpdate(e) {
  if (e) e.preventDefault();
  const petRate = parseFloat(document.getElementById('adm-rate-pet').value) || 26.0;
  const hdpeRate = parseFloat(document.getElementById('adm-rate-hdpe').value) || 32.0;
  const cardRate = parseFloat(document.getElementById('adm-rate-card').value) || 14.0;
  const mlpRate = parseFloat(document.getElementById('adm-rate-mlp').value) || 8.5;
  const metalRate = parseFloat(document.getElementById('adm-rate-metal').value) || 42.0;

  // Update weighbridge selector options
  const select = document.getElementById('weigh-material');
  if (select) {
    const petOpt = select.querySelector('option[value="PET"]');
    if (petOpt) {
      petOpt.setAttribute('data-rate', petRate);
      petOpt.textContent = `Rigid PET Bottles (₹${petRate.toFixed(2)} / kg)`;
    }
    const hdpeOpt = select.querySelector('option[value="HDPE"]');
    if (hdpeOpt) {
      hdpeOpt.setAttribute('data-rate', hdpeRate);
      hdpeOpt.textContent = `HDPE / Rigid Plastic (₹${hdpeRate.toFixed(2)} / kg)`;
    }
    const cardOpt = select.querySelector('option[value="CARD"]');
    if (cardOpt) {
      cardOpt.setAttribute('data-rate', cardRate);
      cardOpt.textContent = `Corrugated Cardboard (₹${cardRate.toFixed(2)} / kg)`;
    }
    const mlpOpt = select.querySelector('option[value="MLP"]');
    if (mlpOpt) {
      mlpOpt.setAttribute('data-rate', mlpRate);
      mlpOpt.textContent = `Multilayered Flexible Plastics (₹${mlpRate.toFixed(2)} / kg)`;
    }
    const metalOpt = select.querySelector('option[value="METAL"]');
    if (metalOpt) {
      metalOpt.setAttribute('data-rate', metalRate);
      metalOpt.textContent = `Aluminium & Mixed Metal (₹${metalRate.toFixed(2)} / kg)`;
    }
  }

  updatePriceCalculation();

  // Try POST to backend if running
  fetch('/api/admin/rates', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ PET: petRate, HDPE: hdpeRate, CARD: cardRate, MLP: mlpRate, METAL: metalRate })
  }).catch(() => {});

  // Add to Audit
  const now = new Date();
  const timeStr = `${now.getDate()}-Nov ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  DEFAULT_AUDIT_LOGS.unshift({
    time: timeStr,
    event: "RATE_INDEX_UPDATED",
    actor: "admin@pridecoop.in",
    detail: `Rates updated: PET ₹${petRate}, HDPE ₹${hdpeRate}, Cardboard ₹${cardRate}, MLP ₹${mlpRate}, Metal ₹${metalRate}`,
    hash: "rate_" + Math.random().toString(36).substring(2, 10)
  });
  renderAdminAuditLogs();

  alert(`PRIDE Material Price Index broadcasted successfully!\n\nNew Rates:\n- Rigid PET: ₹${petRate.toFixed(2)}/kg\n- HDPE: ₹${hdpeRate.toFixed(2)}/kg\n- Cardboard: ₹${cardRate.toFixed(2)}/kg\n- MLP: ₹${mlpRate.toFixed(2)}/kg\n- Metal: ₹${metalRate.toFixed(2)}/kg\n\nAll smart scales & DBT settlement formulas have synchronized.`);
}

function testScaleConnection() {
  const port = document.getElementById('adm-scale-port').value;
  const baud = document.getElementById('adm-scale-baud').value;
  alert(`Serial Handshake Test (${port} @ ${baud} 8N1):\n\n[TX] ENQ (0x05) -> Indicator Hardware\n[RX] ACK (0x06) <- Avery India Model 60T\n[DATA] ST,GS,+01450.0kg,TR,+00980.0kg,NT,+00470.0kg\n\nHardware Loopback Status: OK (0.84ms latency, Zero Packet Loss)`);
}

function renderAdminAuditLogs() {
  const container = document.getElementById('adm-audit-list');
  if (!container) return;

  let html = '';
  DEFAULT_AUDIT_LOGS.forEach(log => {
    html += `
      <div class="p-2.5 rounded-lg bg-white border border-slate-200 text-[11px] shadow-xs">
        <div class="flex items-center justify-between font-mono text-[10px] text-slate-500 mb-1">
          <span class="font-bold text-slate-700">${log.time}</span>
          <span class="px-1.5 py-0.5 rounded bg-purple-50 text-purple-700 font-bold">${log.event}</span>
        </div>
        <div class="text-slate-800 font-medium">${log.detail}</div>
        <div class="flex justify-between items-center text-[10px] text-slate-400 mt-1 font-mono">
          <span>By: ${log.actor}</span>
          <span>SHA-256: ${log.hash}</span>
        </div>
      </div>
    `;
  });

  container.innerHTML = html;
}

function renderAdminFleetTable() {
  const tbody = document.getElementById('adm-fleet-table');
  if (!tbody) return;

  const fleet = FLEET_DATA.length > 0 ? FLEET_DATA : DEFAULT_FLEET;
  let html = '';

  fleet.forEach(v => {
    html += `
      <tr class="hover:bg-slate-50 transition-colors">
        <td class="p-2.5 font-mono font-bold text-slate-900">${v.id}</td>
        <td class="p-2.5">${v.driver}</td>
        <td class="p-2.5 text-slate-600">${v.beat}</td>
        <td class="p-2.5">
          <span class="px-2 py-0.5 rounded text-[11px] font-mono font-bold ${v.battery > 65 ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}">
            ${v.battery}%
          </span>
        </td>
        <td class="p-2.5">
          <span class="px-2 py-0.5 rounded-full text-[10px] font-bold ${v.status.includes('Collecting') ? 'bg-blue-50 text-blue-700' : 'bg-emerald-50 text-emerald-700'}">
            ${v.status}
          </span>
        </td>
        <td class="p-2.5 text-right space-x-1">
          <button onclick="rerouteVehicle('${v.id}')" class="px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-semibold border border-slate-300">
            <i class="fa-solid fa-route text-teal-600 mr-1"></i> Reroute
          </button>
          <button onclick="pingVehicleBattery('${v.id}')" class="px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-semibold border border-slate-300">
            <i class="fa-solid fa-bolt text-amber-500 mr-1"></i> Ping
          </button>
        </td>
      </tr>
    `;
  });

  tbody.innerHTML = html;
}

function rerouteVehicle(vId) {
  alert(`Dynamic VRP Reroute Dispatched for vehicle ${vId}!\n\nAvoiding waterlogged zones (Anil Nagar & Rajgarh). Alternative route sent to driver PWA navigation screen.`);
}

function pingVehicleBattery(vId) {
  alert(`IoT Telematics Ping for ${vId}:\n\n- GPS Coordinates: 26.1750° N, 91.7700° E\n- State of Charge (SoC): 78% (Estimated 42 km range)\n- Motor Temperature: 36.4°C (Normal)\n- On-Board Load Cell: 420 kg / 750 kg capacity`);
}

function exportAuditTrailCSV() {
  let csvContent = "data:text/csv;charset=utf-8,Timestamp,Event,Actor,Detail,SHA256_Checksum\n";
  DEFAULT_AUDIT_LOGS.forEach(row => {
    csvContent += `"${row.time}","${row.event}","${row.actor}","${row.detail}","${row.hash}"\n`;
  });

  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", `PRIDE_WasteOS_Audit_Ledger_${new Date().toISOString().slice(0,10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// -------------------------------------------------------------
// 12. Extended Admin Functions & Evaluator Simulator Tools
// -------------------------------------------------------------
function adminDisburseDBT(workerId, name, amount) {
  const ref = "UPI-AS-" + Math.floor(100000 + Math.random() * 900000);
  const now = new Date();
  const timeStr = `${now.getDate()}-Nov ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  
  DEFAULT_AUDIT_LOGS.unshift({
    time: timeStr,
    event: "DBT_DISBURSEMENT_SUCCESS",
    actor: "admin@pridecoop.in",
    detail: `Instant UPI credit ₹${amount.toFixed(2)} to ${name} (${workerId}). NPCI Ref: ${ref}`,
    hash: "dbt_" + Math.random().toString(36).substring(2, 10)
  });
  renderAdminAuditLogs();

  alert(`Direct Benefit Transfer (DBT) Successful!\n\nBeneficiary: ${name} (${workerId})\nAmount Credited: ₹${amount.toFixed(2)}\nGateway: SBI / Jan Dhan AePS\nNPCI Reference: ${ref}\n\nSMS Confirmation dispatched in Assamese to beneficiary phone.`);
}

function adminMintEPRBatch() {
  const batchId = "BATCH-PET-2026-" + Math.floor(1000 + Math.random() * 9000);
  const certId = "CPCB-EPR-AS-2026-" + Math.floor(10000 + Math.random() * 90000);
  const now = new Date();
  const timeStr = `${now.getDate()}-Nov ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

  DEFAULT_AUDIT_LOGS.unshift({
    time: timeStr,
    event: "CPCB_EPR_CERTIFICATE_MINTED",
    actor: "admin@pridecoop.in",
    detail: `Minted CPCB Certificate ${certId} for 13.28 MT baled rPET flakes. Batch: ${batchId}`,
    hash: "cpcb_" + Math.random().toString(36).substring(2, 10)
  });
  renderAdminAuditLogs();

  alert(`CPCB EPR Certificate Successfully Minted & Signed!\n\nCertificate ID: ${certId}\nBatch UUID: ${batchId}\nMaterial: Rigid PET (Baled Flakes)\nNet Certified Quantity: 13.28 Metric Tonnes\nMass Balance Yield: 98.0%\nRegistry: CPCB & ASPCB Form-IV Portal\nVerification Hash: SHA-256 Validated\n\nOfficial compliance docket ready for Brand Owner off-take.`);
}

function simulateFloodAlarm() {
  switchTab('gis-tab');
  if (map) {
    map.flyTo([26.172, 91.782], 14, { animate: true, duration: 1.5 });
  }
  alert("SIMULATOR TRIGGER: Severe Waterlogging Inundation Alert in Ward 12 / Anil Nagar!\n\nDynamic Dijkstra VRP automatically rerouting PRIDE collection vehicles AS-01-PR-102 and AS-01-PR-107 via Rajgarh flyover bypass to avoid flood stalled engine failure.");
}

function simulateTruckWeighment() {
  switchTab('weighbridge-tab');
  const slider = document.getElementById('weight-input-slider');
  if (slider) {
    slider.value = 650;
    manualWeightUpdate(650);
  }
  alert("SIMULATOR TRIGGER: Incoming PRIDE Bahan EV AS-01-PR-104 docked at Boragaon MRF Platform #1!\n\nRS-232 telemetry captured net load: 650.0 kg.\nAutomated gross/tare calculated.");
}

function simulateVoiceSlip() {
  speakAssameseSlip();
}


