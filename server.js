const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const PORT = process.env.PORT || 3000;

// MIME types
const MIME_TYPES = {
  '.html': 'text/html; charset=UTF-8',
  '.js': 'application/javascript; charset=UTF-8',
  '.css': 'text/css; charset=UTF-8',
  '.json': 'application/json; charset=UTF-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.pdf': 'application/pdf',
  '.txt': 'text/plain; charset=UTF-8',
  '.md': 'text/markdown; charset=UTF-8',
  '.ico': 'image/x-icon'
};

// In-Memory Database
const db = {
  fleet: [
    { id: "AS-01-PR-101", driver: "Ramen Das (ৰমেন দাস)", type: "PRIDE Bahan EV", lat: 26.1820, lng: 91.7450, speed: 18, status: "Collecting", beat: "Ward 24 (Fancy Bazar)", cargoKg: 420, battery: 78 },
    { id: "AS-01-PR-102", driver: "Biren Kalita (বীৰেন কলিতা)", type: "PRIDE Bahan EV", lat: 26.1750, lng: 91.7700, speed: 22, status: "En Route MRF", beat: "Ward 12 (Paltan Bazar)", cargoKg: 580, battery: 64 },
    { id: "AS-01-PR-103", driver: "Manju Begum (মঞ্জু বেগম)", type: "PRIDE Bahan EV", lat: 26.1400, lng: 91.7900, speed: 14, status: "Collecting", beat: "Ward 36 (Dispur Capital)", cargoKg: 310, battery: 85 },
    { id: "AS-01-PR-104", driver: "Pranab Boro (প্ৰণৱ বড়ো)", type: "PRIDE Bahan EV", lat: 26.1380, lng: 91.6850, speed: 0, status: "At Boragaon MRF", beat: "Ward 48 (Jalukbari)", cargoKg: 650, battery: 92 },
    { id: "AS-01-PR-105", driver: "Anima Saikia (অনিমা শইকীয়া)", type: "PRIDE Bahan EV", lat: 26.1600, lng: 91.7200, speed: 16, status: "Collecting", beat: "Ward 18 (Uzanbazar)", cargoKg: 280, battery: 72 },
    { id: "AS-01-PR-106", driver: "Dipak Baruah (দীপক বৰুৱা)", type: "PRIDE Bahan EV", lat: 26.1650, lng: 91.7600, speed: 20, status: "Collecting", beat: "Ward 15 (Chandmari)", cargoKg: 390, battery: 81 },
    { id: "AS-01-PR-107", driver: "Rupali Deka (ৰূপালী ডেকা)", type: "PRIDE Bahan EV", lat: 26.1450, lng: 91.7400, speed: 15, status: "Collecting", beat: "Ward 28 (Ganeshguri)", cargoKg: 460, battery: 69 },
    { id: "AS-01-PR-108", driver: "Hiren Nath (হিৰেন নাথ)", type: "PRIDE Bahan EV", lat: 26.1700, lng: 91.7050, speed: 19, status: "En Route MRF", beat: "Ward 42 (Maligaon)", cargoKg: 520, battery: 60 }
  ],
  workers: [
    { id: "SW-0101", name: "Ramen Das (ৰমেন দাস)", phone: "+91 98640 12001", vehicle: "AS-01-PR-101", ward: "Ward 24 (Fancy Bazar)", volume: 420, payout: 10920, status: "Processed", channel: "Aadhaar AePS / SBI" },
    { id: "SW-0102", name: "Biren Kalita (বীৰেন কলিতা)", phone: "+91 98640 12002", vehicle: "AS-01-PR-102", ward: "Ward 12 (Paltan Bazar)", volume: 580, payout: 15080, status: "Pending Scale", channel: "Cooperative Wallet" },
    { id: "SW-0103", name: "Manju Begum (মঞ্জু বেগম)", phone: "+91 98640 12003", vehicle: "AS-01-PR-103", ward: "Ward 36 (Dispur)", volume: 310, payout: 8060, status: "Processed", channel: "Direct UPI / PNB" },
    { id: "SW-0104", name: "Tapan Boro (তপন বড়ো)", phone: "+91 98640 12004", vehicle: "IND-CYCLE-044", ward: "Ward 48 (Jalukbari)", volume: 165, payout: 4290, status: "Processed", channel: "Cash Slip / Coop Branch" },
    { id: "SW-0105", name: "Anima Saikia (অনিমা শইকীয়া)", phone: "+91 98640 12005", vehicle: "AS-01-PR-105", ward: "Ward 18 (Uzanbazar)", volume: 280, payout: 7280, status: "Processed", channel: "Direct UPI / AGVB" },
    { id: "SW-0106", name: "Dipak Baruah (দীপক বৰুৱা)", phone: "+91 98640 12006", vehicle: "AS-01-PR-106", ward: "Ward 15 (Chandmari)", volume: 390, payout: 10140, status: "Processed", channel: "Direct UPI / SBI" }
  ],
  weighments: [
    { id: "WGH-2026-1049", timestamp: new Date(Date.now() - 3600000).toISOString(), vehicle: "AS-01-PR-101", material: "PET", grossKg: 1420, tareKg: 1000, netKg: 420, rate: 26.0, payout: 10920, facility: "Boragaon MRF #1" },
    { id: "WGH-2026-1050", timestamp: new Date(Date.now() - 1800000).toISOString(), vehicle: "AS-01-PR-103", material: "HDPE", grossKg: 1290, tareKg: 980, netKg: 310, rate: 32.0, payout: 9920, facility: "Boragaon MRF #1" }
  ],
  eprBatches: [
    { id: "EPR-AS-2026-081", cat: "Category I (Rigid PET)", weightTons: 18.4, recycler: "North East Eco-Polymers Ltd. (Amingaon)", hash: "8f3a9e4c1d882b7f09a12c8b7764e21a", status: "Certified", date: "2026-11-20" },
    { id: "EPR-AS-2026-082", cat: "Category I (HDPE Containers)", weightTons: 15.8, recycler: "Pragjyotish Plast-Recycle Ltd. (Nalbari)", hash: "3e5b12a90fd7189c445a661b09823ce1", status: "Certified", date: "2026-11-21" },
    { id: "EPR-AS-2026-083", cat: "Category II (Flexible MLP)", weightTons: 12.8, recycler: "Brahmaputra Green Solutions (Guwahati)", hash: "9c8a41b72e5091ff82a39b4c02914db2", status: "Verified", date: "2026-11-22" },
    { id: "EPR-AS-2026-084", cat: "Category III (Multi-Layer)", weightTons: 5.6, recycler: "Guwahati Cement Kiln Co-Proc.", hash: "1d4f77e63c0047fa189c33bb71900da4", status: "Audited", date: "2026-11-22" }
  ]
};

// SSE Clients
const sseClients = new Set();

// Telemetry Jitter Simulation Interval (every 3 seconds)
setInterval(() => {
  db.fleet.forEach(v => {
    if (v.status !== "At Boragaon MRF") {
      v.lat += (Math.random() - 0.5) * 0.0015;
      v.lng += (Math.random() - 0.5) * 0.0015;
      v.speed = Math.floor(12 + Math.random() * 14);
    }
  });

  const payload = JSON.stringify(db.fleet);
  sseClients.forEach(res => {
    res.write(`data: ${payload}\n\n`);
  });
}, 3000);

const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;

  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  // API Routes
  // 1. GET /api/fleet
  if (req.method === 'GET' && pathname === '/api/fleet') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(db.fleet));
    return;
  }

  // 2. GET /api/telemetry/stream (Server-Sent Events)
  if (req.method === 'GET' && pathname === '/api/telemetry/stream') {
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive'
    });
    res.write(`data: ${JSON.stringify(db.fleet)}\n\n`);
    sseClients.add(res);

    req.on('close', () => {
      sseClients.delete(res);
    });
    return;
  }

  // 3. GET /api/workers
  if (req.method === 'GET' && pathname === '/api/workers') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(db.workers));
    return;
  }

  // 4. POST /api/workers/add
  if (req.method === 'POST' && pathname === '/api/workers/add') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      try {
        const newWorker = JSON.parse(body);
        newWorker.id = `SW-${String(db.workers.length + 101).padStart(4, '0')}`;
        newWorker.volume = 0;
        newWorker.payout = 0;
        newWorker.status = 'Registered';
        db.workers.unshift(newWorker);
        res.writeHead(201, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, worker: newWorker }));
      } catch (err) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: "Invalid JSON" }));
      }
    });
    return;
  }

  // 5. POST /api/weighbridge/ingest
  if (req.method === 'POST' && pathname === '/api/weighbridge/ingest') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      try {
        const data = JSON.parse(body);
        const netKg = parseFloat(data.netKg) || 0;
        const rate = parseFloat(data.rate) || 26.0;
        const payout = netKg * rate;

        const record = {
          id: `WGH-2026-${1051 + db.weighments.length}`,
          timestamp: new Date().toISOString(),
          vehicle: data.vehicle,
          material: data.material,
          grossKg: parseFloat(data.grossKg) || (netKg + 980),
          tareKg: 980,
          netKg: netKg,
          rate: rate,
          payout: payout,
          facility: "Boragaon MRF Hub #1",
          serialRaw: `ST,GS,+${String(Math.round(netKg + 980)).padStart(6, '0')}.0kg,TR,+00980.0kg,NT,+${String(Math.round(netKg)).padStart(6, '0')}.0kg\\r\\n`
        };

        db.weighments.unshift(record);

        // Update matching worker volume & payout if found
        const matchedWorker = db.workers.find(w => w.vehicle === data.vehicle);
        if (matchedWorker) {
          matchedWorker.volume += netKg;
          matchedWorker.payout += payout;
          matchedWorker.status = 'Processed';
        }

        res.writeHead(201, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, weighment: record }));
      } catch (err) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: "Invalid JSON" }));
      }
    });
    return;
  }

  // 6. GET /api/epr/batches
  if (req.method === 'GET' && pathname === '/api/epr/batches') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(db.eprBatches));
    return;
  }

  // Static File Serving
  let safePath = path.normalize(pathname).replace(/^(\.\.[\/\\])+/, '');
  if (safePath === '/' || safePath === '') {
    safePath = '/index.html';
  }

  const filePath = path.join(__dirname, safePath);
  const ext = path.extname(filePath).toLowerCase();
  const contentType = MIME_TYPES[ext] || 'application/octet-stream';

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=UTF-8' });
      res.end(`404 Not Found: ${safePath}`);
      return;
    }

    res.writeHead(200, { 'Content-Type': contentType });
    const readStream = fs.createReadStream(filePath);
    readStream.pipe(res);
  });
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`=============================================================`);
  console.log(`🚀 PRIDE WasteOS (AsomiCycle) Dev Server Running`);
  console.log(`📍 Local URL:    http://localhost:${PORT}`);
  console.log(`📡 SSE Telemetry: http://localhost:${PORT}/api/telemetry/stream`);
  console.log(`📄 Problem Statement: NESFIC-I-10 (Govt. of Assam)`);
  console.log(`=============================================================`);
});
