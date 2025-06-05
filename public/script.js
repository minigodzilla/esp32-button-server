// Constants
const CLIMB_MAX = 100;
const CLIMB_INCREMENT = 0.25;
const CLIMB_DECREMENT = 1;
const CLIMB_DECAY_INTERVAL = 1000;
const BUTTON_PRESS_ANIMATION_DURATION = 125;
const CLIMBER_MOVEMENT_MULTIPLIER = 8.6;

// Initial animal names data
const INITIAL_ANIMAL_NAMES = [
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

// DOM Elements - cached for better performance
const socket = io();
const countEl = document.getElementById('count');
const devicesEl = document.getElementById('devices');
const serverIPEl = document.getElementById('serverIP');
const climbStatusEl = document.getElementById('climbStatus');
const climberEl = document.querySelector('#climber');

// Game state
let totalPresses;
let climbStatus = 0;

// Animal names data - initialized from constant
let animalNames = [...INITIAL_ANIMAL_NAMES];

// Game state management
function updateClimberPosition() {
  const x = (climbStatus * CLIMBER_MOVEMENT_MULTIPLIER);
  const y = -(climbStatus * CLIMBER_MOVEMENT_MULTIPLIER);
  
  // Use requestAnimationFrame for smoother animations
  requestAnimationFrame(() => {
    climberEl.style.transform = `translate(${x}px, ${y}px)`;
  });
}

function updateClimbStatus(newValue) {
  climbStatus = newValue;
  climbStatusEl.textContent = climbStatus;
  updateClimberPosition();
  checkWinCondition();
}

function checkWinCondition() {
  if (climbStatus >= CLIMB_MAX) {
    document.body.classList.add('game-won');
  }
}

// Device management
function addDevice(id) {
  if (!animalNames.length) return; // Prevent adding more devices than we have names for
  
  const animalNamePair = animalNames.shift();
  const deviceEl = document.createElement('div');
  deviceEl.id = id;
  deviceEl.classList.add('device', id);
  deviceEl.innerHTML = `
    <img src="assets/animal-${animalNamePair[1]}.png" alt="${animalNamePair[0]}">
    <p>${animalNamePair[0]}</p>
  `;
  devicesEl.appendChild(deviceEl);
}

function clearDevices() {
  devicesEl.innerHTML = '';
  // Reset the animal names array to its original state
  animalNames = [...INITIAL_ANIMAL_NAMES];
}

// Event handlers
function handleButtonPress({ deviceId, totalPresses }) {
  countEl.textContent = totalPresses;
  if (climbStatus < CLIMB_MAX) {
    updateClimbStatus(Math.min(CLIMB_MAX, climbStatus + CLIMB_INCREMENT));
  }
  
  const deviceEl = document.getElementById(deviceId);
  if (deviceEl) {
    deviceEl.classList.add('pressed');
    setTimeout(() => {
      deviceEl.classList.remove('pressed');
    }, BUTTON_PRESS_ANIMATION_DURATION);
  }
}

function reset() {
  fetch('/reset', { method: 'POST' });
  countEl.textContent = 0;
  updateClimbStatus(0);
  clearDevices();
  document.body.classList.remove('game-won');
}

// Socket event listeners
socket.on('init', ({ devices, totalPresses, serverIP }) => {
  if (devices) {
    devices.forEach(id => addDevice(id));
  }
  if (serverIP) {
    serverIPEl.textContent = serverIP;
  }
  countEl.textContent = totalPresses;
});

socket.on('new-device', addDevice);
socket.on('button-press', handleButtonPress);

socket.on('reset-all', ({ devices, totalPresses, serverIP }) => {
  countEl.textContent = totalPresses;
  updateClimbStatus(0);
  clearDevices();
  document.body.classList.remove('game-won');
  if (serverIP) {
    serverIPEl.textContent = serverIP;
  }
  if (devices && devices.length > 0) {
    devices.forEach(id => addDevice(id));
  }
});

// Game loop
setInterval(() => {
  if (climbStatus > 0 && climbStatus < CLIMB_MAX) {
    updateClimbStatus(Math.max(0, climbStatus - CLIMB_DECREMENT));
  }
}, CLIMB_DECAY_INTERVAL); 