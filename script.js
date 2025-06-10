console.log("Page loaded.")

//Global Variables
let bitCount = 0;
let lastBitCount = 0;
let clickBitsThisSecond = 0;
//Clicker
let clickPower = 1;
let clickUpgradeCost = 10;

const generators = [
  {
    name: "AutoClicker",
    count: 0,
    rate: 1,
    cost: 25,
    costMultiplier: 1.2
  },
  {
    name: "KeyboardTyper",
    count: 0,
    rate: 10,
    cost: 250,
    costMultiplier: 1.2
  },
  {
    name: "CopyPaster",
    count: 0,
    rate: 100,
    cost: 2500,
    costMultiplier: 1.2
  }
]

// Global Upgrades Tracking
const upgrades = [
  {
    id: "doubleAutoClickerRate",
    name: "Double AutoClicker Rate",
    description: "Doubles the rate of AutoClicker",
    cost: 500,
    unlocked: false,
    purchased: false,
    condition: () => generators.find(g => g.name === "AutoClicker").count >= 5,
    effect: () => {
      generators.find(g => g.name === "AutoClicker").rate *= 2;
    }
  },
  {
    id: "globalRateBoost",
    name: "Global Rate x2",
    description: "Doubles the rate of all generators",
    cost: 2000,
    unlocked: false,
    purchased: false,
    condition: () => bitCount >= 1000,
    effect: () => {
      generators.forEach(g => g.rate *= 2);
    }
  },
  {
    id: "synergyAutoClickerCopyPaster",
    name: "Synergy: AutoClicker + CopyPaster",
    description: "Increase AutoClicker rate by 5% per CopyPaster",
    cost: 3000,
    unlocked: false,
    purchased: false,
    condition: () => generators.find(g => g.name === "CopyPaster").count >= 3,
    effect: () => {
      const cpCount = generators.find(g => g.name === "CopyPaster").count;
      const autoClicker = generators.find(g => g.name === "AutoClicker");
      autoClicker.rate *= (1 + 0.05 * cpCount);
    }
  }
]

//Global Constants
//EMPTY

//Bit Maker Function
function makeBit(x) {
  clickBitsThisSecond += x;
  bitCount += x;
  updateBitDisplay()
}


function buyClickerUpgrade() {
  if (bitCount >= clickUpgradeCost) {
    bitCount -=clickUpgradeCost;
    clickPower = clickPower * 2; //Multiplies click power by factor of two
    clickUpgradeCost = Math.floor(clickUpgradeCost*1.5);
    updateUI();
  } else {
    alert("Not enough bits!");
  }
}


function buyGenerator(name) {
  const generator = generators.find(gen => gen.name === name);
  if (!generator) return;

  if (bitCount >= generator.cost) {
    bitCount -= generator.cost;
    generator.count += 1;
    generator.cost = Math.floor(generator.cost * generator.costMultiplier);
    updateUI();
  } else {
    alert("Not enough bits!");
  }
}

function updateUI() {

  updateBitDisplay();
  //Clicker update
  document.getElementById("clickMultiplierDisplay").textContent = clickPower;
  document.getElementById("clickUpgradeCostDisplay").textContent = clickUpgradeCost;

  //Generators update
  generators.forEach(gen => {
    document.getElementById(`${gen.name}Count`).textContent = gen.count;
    document.getElementById(`${gen.name}Cost`).textContent = gen.cost;
    try {
      const panel = document.getElementById(`${gen.name}Panel`);
      if (panel) {
        panel.style.display = (bitCount >= gen.cost || gen.count > 0) ? "block" : "none";
      }
    } catch (e) {
      // Fail silently if element doesn't exist
    }
  });

  updateUpgradesUI();
}

function updateBitDisplay() {
  document.getElementById("bitDisplay").textContent = bitCount;
}

function calculateBitsPerSecond() {
  const delta = bitCount - lastBitCount;
  lastBitCount = bitCount;
  return delta;
}

// Upgrades UI update and unlock check
function updateUpgradesUI() {
  upgrades.forEach(upg => {
    if (!upg.unlocked && upg.condition()) {
      upg.unlocked = true;
      const container = document.getElementById("upgradesContainer");
      const upgDiv = document.createElement("div");
      upgDiv.id = upg.id;
      upgDiv.innerHTML = `<p><strong>${upg.name}</strong>: ${upg.description} <button onclick="purchaseUpgrade('${upg.id}')">Buy (${upg.cost} bits)</button></p>`;
      container.appendChild(upgDiv);
    }
  });
}

// Purchase upgrade function
function purchaseUpgrade(id) {
  const upg = upgrades.find(u => u.id === id);
  if (!upg || upg.purchased || bitCount < upg.cost) return;
  bitCount -= upg.cost;
  upg.effect();
  upg.purchased = true;

  const el = document.getElementById(upg.id);
  if (el) {
    el.querySelector('button').remove(); // Remove the buy button
    document.getElementById("purchasedUpgradesContainer").appendChild(el);
  }

  updateUI();
}

// Update UI when first loading screen
window.onload = () => {
  updateUI();
}


setInterval(() => {
  // Passive generation
  generators.forEach(gen => {
    bitCount += gen.count * gen.rate;
  });

  // Real BPS tracking
  const bps = calculateBitsPerSecond();
  document.getElementById("bpsDisplay").textContent = bps;

  // Reset click tracking
  clickBitsThisSecond = 0;

  updateUI();
}, 1000);