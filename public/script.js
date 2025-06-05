const socket = io();
const countEl = document.getElementById('count');
const devicesEl = document.getElementById('devices');
const serverIPEl = document.getElementById('serverIP');
const climbStatusEl = document.getElementById('climbStatus');
const climberEl = document.querySelector('#climber');
const animalNames = [
  ["okwáho", "okwaho"],
  ["anonhwaráweron", "anonhwaraweron"],
  ["oskenón:ton", "oskenonton"],
  ["ohkwá:ri", "ohkwari"],
  ["tsítsho", "tsitsho"],
  ["á:kwe'ks", "akweks"],
  ["onkwe'tá:kon", "onkwetakon"],
  ["kwareró:ha", "kwareroha"],
  ["a'nó:wara", "anowara"],
  ["kontihnawá:ras", "kontihnawaras"],
  ["tsianì:to", "tsianito"],
  ["karhakón:ha", "karhakonha"]
];

let totalPresses;
let climbStatus = 0;  // Initialize to 0

socket.on('init', ({ devices, totalPresses, serverIP }) => {
  if (devices) {  // Only process devices if they were sent
    devices.forEach(id => addDevice(id));
  }
  if (serverIP) {  // Only update server IP if it was sent
    serverIPEl.textContent = serverIP;
  }
  // Update totalPresses count
  countEl.textContent = totalPresses;
});

socket.on('new-device', (id) => {
  addDevice(id);
});

function updateClimberPosition() {
  const x = (climbStatus * 8.6);  // 860/100 = 8.6
  const y = -(climbStatus * 8.6);  // Negative because we're moving up
  climberEl.style.transform = `translate(${x}px, ${y}px)`;
}

function updateClimbStatus(newValue) {
  climbStatus = newValue;
  climbStatusEl.textContent = climbStatus;
  updateClimberPosition();
  checkWinCondition();
}

function checkWinCondition() {
  if (climbStatus >= 100) {
    document.body.classList.add('game-won');
  }
}

socket.on('button-press', ({ deviceId, totalPresses }) => {
  countEl.textContent = totalPresses;
  if (climbStatus < 100) {  // Only increment if not at max
    updateClimbStatus(Math.min(100, climbStatus + 0.25));
  }
  console.log(`Button press from ${deviceId}`);
  // add a classname "pressed" to the device div that is the device ID, then remove it after 500 ms
  const deviceEl = document.getElementById(deviceId);
  deviceEl.classList.add('pressed');
  setTimeout(() => {
    deviceEl.classList.remove('pressed');
  }, 125);
});

function addDevice(id) {
  const animalNamePair = animalNames.shift();
  const deviceEl = document.createElement('div');
  // give the device div an ID of the device ID
  deviceEl.id = id;
  deviceEl.classList.add('device');
  deviceEl.classList.add(id);
  deviceEl.innerHTML = `
    <img src="assets/animal-${animalNamePair[1]}.png" alt="${animalNamePair[0]}">
    <p>${animalNamePair[0]}</p>
  `;
  devicesEl.appendChild(deviceEl);
}

function clearDevices() {
  devicesEl.innerHTML = '';
  // Reset the animal names array to its original state
  animalNames.length = 0;
  animalNames.push(
    ["okwáho", "okwaho"],
    ["anonhwaráweron", "anonhwaraweron"],
    ["oskenón:ton", "oskenonton"],
    ["ohkwá:ri", "ohkwari"],
    ["tsítsho", "tsitsho"],
    ["á:kwe'ks", "akweks"],
    ["onkwe'tá:kon", "onkwetakon"],
    ["kwareró:ha", "kwareroha"],
    ["a'nó:wara", "anowara"],
    ["kontihnawá:ras", "kontihnawaras"],
    ["tsianì:to", "tsianito"],
    ["karhakón:ha", "karhakonha"]
  );
}

function reset() {
  fetch('/reset', { method: 'POST' });
  countEl.textContent = 0;
  updateClimbStatus(0);
  clearDevices();
  document.body.classList.remove('game-won');
}

// Listen for the reset-all event from the server
socket.on('reset-all', ({ devices, totalPresses, serverIP }) => {
  countEl.textContent = totalPresses;
  updateClimbStatus(0);
  clearDevices();
  document.body.classList.remove('game-won');
  if (serverIP) {
    serverIPEl.textContent = serverIP;
  }
  // Re-add any devices that were sent
  if (devices && devices.length > 0) {
    devices.forEach(id => addDevice(id));
  }
});

// Decay mechanism - decrease climbStatus by 1 every second, with floor of 0
setInterval(() => {
  if (climbStatus > 0 && climbStatus < 100) {  // Only decay if not at max
    updateClimbStatus(Math.max(0, climbStatus - 1));
  }
}, 1000); 