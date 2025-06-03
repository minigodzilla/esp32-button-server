const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const os = require('os');
const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const PORT = 3000;

// Get local IP address
function getLocalIP() {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      // Skip internal and non-IPv4 addresses
      if (!iface.internal && iface.family === 'IPv4') {
        return iface.address;
      }
    }
  }
  return 'Unknown';
}

const localIP = getLocalIP();

// Track known devices and total button presses
const knownDevices = new Set();
let totalPresses = 0;

// Decay mechanism - decrease totalPresses by 1 every second
setInterval(() => {
  if (totalPresses > 0) {
    totalPresses--;
    io.emit('init', { totalPresses }); // Emit update to all clients
  }
}, 1000);

app.use(express.static('public'));
app.use(express.json());

// Endpoint ESP32 devices will POST to
app.post('/button-press', (req, res) => {
  let deviceId = req.ip; // could also use req.body.id if you want
  const isNewDevice = !knownDevices.has(deviceId);
 
  if (isNewDevice) {
    knownDevices.add(deviceId);
    io.emit('new-device', deviceId);
    console.log(`New device: ${deviceId}`);
  }

  totalPresses++;
  io.emit('button-press', { deviceId, totalPresses });

  res.sendStatus(200);
});

// Reset devices and button press count
app.post('/reset', (req, res) => {
  totalPresses = 0;
//   knownDevices.clear();
//   io.emit('init', { devices: [], totalPresses: 0 });
  io.emit('init', { totalPresses: 0 });
  res.sendStatus(200);
});

io.on('connection', (socket) => {
  console.log('Client connected');
  socket.emit('init', {
    devices: Array.from(knownDevices),
    totalPresses,
    serverIP: localIP
  });
});

server.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
