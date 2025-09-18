// Storage keys for summary box settings
const SUMMARY_BOX_VISIBLE_KEY = "summaryBoxVisible";
const SUMMARY_BOX_POS_TOP_KEY = "summaryBoxTop";
const SUMMARY_BOX_POS_LEFT_KEY = "summaryBoxLeft";

// Storage keys for auto-scroll settings
const AUTO_SCROLL_ENABLED_KEY = "autoScrollEnabled";
const AUTO_SCROLL_SPEED_KEY = "autoScrollSpeed";

// DOM Elements
let resetPositionButton: HTMLButtonElement;
let toggleVisibilityButton: HTMLButtonElement;
let closeButton: HTMLButtonElement;
let autoScrollToggle: HTMLInputElement;
let scrollSpeedSlider: HTMLInputElement;
let scrollSpeedValue: HTMLSpanElement;
let scrollSpeedContainer: HTMLDivElement;

// State
let summaryBoxVisible = true; // Default to visible
let autoScrollEnabled = true; // Default to enabled
let autoScrollSpeed = 35; // Default speed

// Initialization
document.addEventListener("DOMContentLoaded", async () => {
  // Get DOM elements
  resetPositionButton = document.getElementById("reset-position-button") as HTMLButtonElement;
  toggleVisibilityButton = document.getElementById("toggle-visibility-button") as HTMLButtonElement;
  closeButton = document.getElementById("close-button") as HTMLButtonElement;
  autoScrollToggle = document.getElementById("auto-scroll-toggle") as HTMLInputElement;
  scrollSpeedSlider = document.getElementById("scroll-speed-slider") as HTMLInputElement;
  scrollSpeedValue = document.getElementById("scroll-speed-value") as HTMLSpanElement;
  scrollSpeedContainer = document.getElementById("scroll-speed-container") as HTMLDivElement;

  if (!resetPositionButton || !toggleVisibilityButton || !closeButton ||
      !autoScrollToggle || !scrollSpeedSlider || !scrollSpeedValue || !scrollSpeedContainer) {
    console.error("Error: One or more essential DOM elements not found.");
    return;
  }

  // Load current settings
  summaryBoxVisible = await getSummaryBoxVisibility();
  autoScrollEnabled = await getAutoScrollEnabled();
  autoScrollSpeed = await getAutoScrollSpeed();

  // Update UI state
  updateToggleButtonText();
  updateAutoScrollControls();

  // Attach event listeners
  resetPositionButton.addEventListener("click", handleResetPosition);
  toggleVisibilityButton.addEventListener("click", handleToggleVisibility);
  closeButton.addEventListener("click", () => window.close());
  autoScrollToggle.addEventListener("change", handleAutoScrollToggle);
  scrollSpeedSlider.addEventListener("input", handleScrollSpeedChange);
});

// Storage Functions
async function getSummaryBoxVisibility(): Promise<boolean> {
  try {
    const data = await chrome.storage.local.get(SUMMARY_BOX_VISIBLE_KEY);
    return data[SUMMARY_BOX_VISIBLE_KEY] !== false; // Default to true (visible)
  } catch (error) {
    console.error("Error loading summary box visibility:", error);
    return true; // Default to visible
  }
}

async function saveSummaryBoxVisibility(visible: boolean): Promise<void> {
  try {
    await chrome.storage.local.set({ [SUMMARY_BOX_VISIBLE_KEY]: visible });
    summaryBoxVisible = visible; // Update local state
  } catch (error) {
    console.error("Error saving summary box visibility:", error);
  }
}

async function resetSummaryBoxPosition(): Promise<void> {
  try {
    await chrome.storage.local.remove([SUMMARY_BOX_POS_TOP_KEY, SUMMARY_BOX_POS_LEFT_KEY]);
    console.log("Summary box position reset to default");
  } catch (error) {
    console.error("Error resetting summary box position:", error);
  }
}

// Event Handlers
async function handleResetPosition(): Promise<void> {
  await resetSummaryBoxPosition();
  alert("Summary box position has been reset.\n\nPlease refresh the page to see the change take effect.");
}

async function handleToggleVisibility(): Promise<void> {
  const newVisibility = !summaryBoxVisible;
  await saveSummaryBoxVisibility(newVisibility);
  updateToggleButtonText();

  if (newVisibility) {
    alert("Summary box will now be shown.\n\nPlease refresh the page to see the change take effect.");
  } else {
    alert("Summary box will now be hidden.\n\nPlease refresh the page to see the change take effect.");
  }
}

function updateToggleButtonText(): void {
  if (toggleVisibilityButton) {
    toggleVisibilityButton.textContent = summaryBoxVisible ? "Hide Summary Box" : "Show Summary Box";
  }
}

// Auto-scroll storage functions
async function getAutoScrollEnabled(): Promise<boolean> {
  try {
    const data = await chrome.storage.local.get(AUTO_SCROLL_ENABLED_KEY);
    return data[AUTO_SCROLL_ENABLED_KEY] !== false; // Default to true (enabled)
  } catch (error) {
    console.error("Error loading auto-scroll enabled state:", error);
    return true; // Default to enabled
  }
}

async function getAutoScrollSpeed(): Promise<number> {
  try {
    const data = await chrome.storage.local.get(AUTO_SCROLL_SPEED_KEY);
    return data[AUTO_SCROLL_SPEED_KEY] || 35; // Default to 35
  } catch (error) {
    console.error("Error loading auto-scroll speed:", error);
    return 35; // Default speed
  }
}

async function saveAutoScrollEnabled(enabled: boolean): Promise<void> {
  try {
    await chrome.storage.local.set({ [AUTO_SCROLL_ENABLED_KEY]: enabled });
    autoScrollEnabled = enabled; // Update local state
  } catch (error) {
    console.error("Error saving auto-scroll enabled state:", error);
  }
}

async function saveAutoScrollSpeed(speed: number): Promise<void> {
  try {
    await chrome.storage.local.set({ [AUTO_SCROLL_SPEED_KEY]: speed });
    autoScrollSpeed = speed; // Update local state
  } catch (error) {
    console.error("Error saving auto-scroll speed:", error);
  }
}

// Auto-scroll event handlers
async function handleAutoScrollToggle(): Promise<void> {
  const enabled = autoScrollToggle.checked;
  await saveAutoScrollEnabled(enabled);
  updateAutoScrollControls();
}

async function handleScrollSpeedChange(): Promise<void> {
  const speed = parseInt(scrollSpeedSlider.value);
  await saveAutoScrollSpeed(speed);
  updateScrollSpeedDisplay();
}

// UI update functions
function updateAutoScrollControls(): void {
  autoScrollToggle.checked = autoScrollEnabled;
  scrollSpeedSlider.value = autoScrollSpeed.toString();
  scrollSpeedContainer.style.display = autoScrollEnabled ? "block" : "none";
  updateScrollSpeedDisplay();
}

function updateScrollSpeedDisplay(): void {
  if (scrollSpeedValue) {
    scrollSpeedValue.textContent = autoScrollSpeed.toString();
  }
}