interface Officer {
  name: string;
}

interface DailyTotal {
  [officerName: string]: number;
}

interface StorageData {
  officerList?: Officer[];
  dailyTotals?: DailyTotal;
  lastCalculationDate?: string;
}

const OFFICER_LIST_KEY = "officerList";
const DAILY_TOTALS_KEY = "dailyTotals";
const LAST_CALC_DATE_KEY = "lastCalculationDate";

// --- DOM Elements ---
let totalCasesInput: HTMLInputElement;
let calculateButton: HTMLButtonElement;
let addOfficerButton: HTMLButtonElement;
let clearTotalsButton: HTMLButtonElement;
let officerListDiv: HTMLDivElement;
let closeButton: HTMLButtonElement;

// --- State ---
let officers: Officer[] = [];
let dailyTotals: DailyTotal = {};

// --- Initialization ---
document.addEventListener("DOMContentLoaded", async () => {
  // Get DOM elements
  totalCasesInput = document.getElementById("total-cases") as HTMLInputElement;
  calculateButton = document.getElementById(
    "calculate-button"
  ) as HTMLButtonElement;
  addOfficerButton = document.getElementById(
    "add-officer-button"
  ) as HTMLButtonElement;
  clearTotalsButton = document.getElementById(
    "clear-totals-button"
  ) as HTMLButtonElement;
  officerListDiv = document.getElementById("officer-list") as HTMLDivElement;
  closeButton = document.getElementById("close-button") as HTMLButtonElement;

  if (
    !totalCasesInput ||
    !calculateButton ||
    !addOfficerButton ||
    !clearTotalsButton ||
    !officerListDiv ||
    !closeButton
  ) {
    console.error("Error: One or more essential DOM elements not found.");
    return;
  }

  // Load persistent officer list
  officers = await loadOfficerList();

  // Check date and load/reset daily totals
  dailyTotals = await checkDateAndLoadTotals();

  // Render initial UI
  renderOfficerList();

  // Attach event listeners
  addOfficerButton.addEventListener("click", handleAddOfficer);
  calculateButton.addEventListener("click", handleCalculate);
  clearTotalsButton.addEventListener("click", handleClearTotals);
  closeButton.addEventListener("click", () => window.close());
  // Remove officer listeners are added during render
});

// --- Storage Functions ---
async function loadOfficerList(): Promise<Officer[]> {
  try {
    const data = (await chrome.storage.sync.get(
      OFFICER_LIST_KEY
    )) as StorageData;
    return data.officerList || [];
  } catch (error) {
    console.error("Error loading officer list:", error);
    return [];
  }
}

async function saveOfficerList(updatedOfficers: Officer[]): Promise<void> {
  try {
    await chrome.storage.sync.set({ [OFFICER_LIST_KEY]: updatedOfficers });
    officers = updatedOfficers; // Update local state
  } catch (error) {
    console.error("Error saving officer list:", error);
  }
}

async function loadDailyTotals(): Promise<DailyTotal> {
  try {
    const data = (await chrome.storage.local.get(
      DAILY_TOTALS_KEY
    )) as StorageData;
    // Ensure totals exist for all current officers, default to 0 if not
    const loadedTotals = data.dailyTotals || {};
    const currentTotals: DailyTotal = {};
    officers.forEach((officer) => {
      currentTotals[officer.name] = loadedTotals[officer.name] || 0;
    });
    return currentTotals;
  } catch (error) {
    console.error("Error loading daily totals:", error);
    return {};
  }
}

async function saveDailyTotals(updatedTotals: DailyTotal): Promise<void> {
  try {
    await chrome.storage.local.set({ [DAILY_TOTALS_KEY]: updatedTotals });
    dailyTotals = updatedTotals; // Update local state
  } catch (error) {
    console.error("Error saving daily totals:", error);
  }
}

async function getLastCalculationDate(): Promise<string | undefined> {
  try {
    const data = (await chrome.storage.local.get(
      LAST_CALC_DATE_KEY
    )) as StorageData;
    return data.lastCalculationDate;
  } catch (error) {
    console.error("Error getting last calculation date:", error);
    return undefined;
  }
}

async function saveLastCalculationDate(date: string): Promise<void> {
  try {
    await chrome.storage.local.set({ [LAST_CALC_DATE_KEY]: date });
  } catch (error) {
    console.error("Error saving last calculation date:", error);
  }
}

// --- Date Check ---
function getTodayDateString(): string {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0"); // Months are 0-indexed
  const day = String(today.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

async function checkDateAndLoadTotals(): Promise<DailyTotal> {
  const today = getTodayDateString();
  const lastDate = await getLastCalculationDate();

  if (lastDate !== today) {
    console.log("New day detected. Resetting daily totals.");
    await saveDailyTotals({}); // Reset totals
    await saveLastCalculationDate(today);
    return {}; // Return empty totals
  } else {
    // Load existing totals for today
    return await loadDailyTotals();
  }
}

// --- UI Rendering ---
function renderOfficerList(assignments: { [key: string]: number } = {}): void {
  if (!officerListDiv) return;
  officerListDiv.innerHTML = ""; // Clear existing list

  if (officers.length === 0) {
    officerListDiv.innerHTML =
      '<p style="text-align: center; color: #6c757d;">No officers added yet.</p>';
    return;
  }

  officers.forEach((officer) => {
    const officerRow = document.createElement("div");
    officerRow.className = "officer-row";

    const currentTotal = dailyTotals[officer.name] || 0;
    const toAssign =
      assignments[officer.name] !== undefined ? assignments[officer.name] : "-"; // Show '-' if no calculation done yet

    officerRow.innerHTML = `
            <div class="officer-info">
                <span class="officer-name">${escapeHtml(officer.name)}</span>
                <span class="running-total">Running total: ${currentTotal}</span>
            </div>
            <div class="assignment-info">
                <span>to assign:</span>
                <span class="cases-to-assign">${toAssign}</span>
            </div>
            <button class="remove-officer" data-officer-name="${escapeHtml(
              officer.name
            )}" title="Remove ${escapeHtml(officer.name)}">&times;</button>
        `;

    const removeButton = officerRow.querySelector(
      ".remove-officer"
    ) as HTMLButtonElement;
    if (removeButton) {
      removeButton.addEventListener("click", () =>
        handleRemoveOfficer(officer.name)
      );
    }

    officerListDiv.appendChild(officerRow);
  });
}

// Basic HTML escaping function
function escapeHtml(unsafe: string): string {
  if (!unsafe) return "";
  return unsafe
    .replace(/&/g, "&")
    .replace(/</g, "<")
    .replace(/>/g, ">")
    .replace(/"/g, '"')
    .replace(/'/g, "&#039;");
}

// --- Event Handlers ---
async function handleAddOfficer(): Promise<void> {
  const name = prompt("Enter the new officer's name:");
  if (name && name.trim()) {
    const trimmedName = name.trim();
    if (
      officers.some((o) => o.name.toLowerCase() === trimmedName.toLowerCase())
    ) {
      alert(`Officer "${trimmedName}" already exists.`);
      return;
    }
    const newOfficer: Officer = { name: trimmedName };
    const updatedOfficers = [...officers, newOfficer];
    await saveOfficerList(updatedOfficers);
    // Ensure new officer has a total (even if 0)
    if (dailyTotals[trimmedName] === undefined) {
      dailyTotals[trimmedName] = 0;
      await saveDailyTotals(dailyTotals); // Save updated totals object
    }
    renderOfficerList(); // Re-render with the new officer
  } else if (name !== null) {
    // Only show error if prompt wasn't cancelled
    alert("Officer name cannot be empty.");
  }
}

async function handleRemoveOfficer(nameToRemove: string): Promise<void> {
  if (!confirm(`Are you sure you want to remove officer "${nameToRemove}"?`)) {
    return;
  }
  const updatedOfficers = officers.filter((o) => o.name !== nameToRemove);
  await saveOfficerList(updatedOfficers);

  // Remove from daily totals as well
  const updatedTotals = { ...dailyTotals };
  delete updatedTotals[nameToRemove];
  await saveDailyTotals(updatedTotals);

  renderOfficerList(); // Re-render without the removed officer
}

async function handleCalculate(): Promise<void> {
  const totalCasesStr = totalCasesInput.value;
  const totalCases = parseInt(totalCasesStr, 10);

  if (isNaN(totalCases) || totalCases < 0) {
    alert("Please enter a valid non-negative number of cases.");
    return;
  }

  if (officers.length === 0) {
    alert("Please add at least one officer before calculating.");
    return;
  }

  // --- Case Division Logic ---
  const numOfficers = officers.length;
  const baseCases = Math.floor(totalCases / numOfficers);
  let remainingCases = totalCases % numOfficers;

  // Create a list of officers with their current totals for sorting
  const officersWithTotals = officers.map((officer) => ({
    name: officer.name,
    currentTotal: dailyTotals[officer.name] || 0,
  }));

  // Sort officers by their current total, ascending (lowest total first)
  // Secondary sort by name for consistent tie-breaking
  officersWithTotals.sort((a, b) => {
    if (a.currentTotal !== b.currentTotal) {
      return a.currentTotal - b.currentTotal;
    }
    return a.name.localeCompare(b.name); // Alphabetical tie-breaker
  });

  // Calculate assignments
  const assignments: { [key: string]: number } = {};
  officers.forEach((officer) => {
    assignments[officer.name] = baseCases;
  });

  // Distribute remaining cases to those with the lowest totals
  for (let i = 0; i < remainingCases; i++) {
    const officerToAssignExtra = officersWithTotals[i].name;
    assignments[officerToAssignExtra]++;
  }

  // --- Update Daily Totals ---
  const updatedTotals = { ...dailyTotals };
  officers.forEach((officer) => {
    updatedTotals[officer.name] =
      (updatedTotals[officer.name] || 0) + assignments[officer.name];
  });

  // Save the new totals and re-render
  await saveDailyTotals(updatedTotals);
  renderOfficerList(assignments); // Pass assignments to display "to assign" numbers
  totalCasesInput.value = ""; // Clear input after calculation
}

async function handleClearTotals(): Promise<void> {
  if (
    !confirm(
      "Are you sure you want to clear the current daily totals for all officers?"
    )
  ) {
    return;
  }
  const clearedTotals: DailyTotal = {};
  officers.forEach((officer) => {
    clearedTotals[officer.name] = 0; // Reset each officer's total to 0
  });
  await saveDailyTotals(clearedTotals); // Save cleared totals to storage
  renderOfficerList(); // Re-render the list to show totals as 0 and remove assignments
  console.log("Daily totals cleared manually.");
}
