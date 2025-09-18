// Storage keys for summary box settings
const SUMMARY_BOX_VISIBLE_KEY = "summaryBoxVisible";
const SUMMARY_BOX_POS_TOP_KEY = "summaryBoxTop";
const SUMMARY_BOX_POS_LEFT_KEY = "summaryBoxLeft";

// DOM Elements
let resetPositionButton: HTMLButtonElement;
let toggleVisibilityButton: HTMLButtonElement;
let closeButton: HTMLButtonElement;

// State
let summaryBoxVisible = true; // Default to visible

// Initialization
document.addEventListener("DOMContentLoaded", async () => {
  // Get DOM elements
  resetPositionButton = document.getElementById("reset-position-button") as HTMLButtonElement;
  toggleVisibilityButton = document.getElementById("toggle-visibility-button") as HTMLButtonElement;
  closeButton = document.getElementById("close-button") as HTMLButtonElement;

  if (!resetPositionButton || !toggleVisibilityButton || !closeButton) {
    console.error("Error: One or more essential DOM elements not found.");
    return;
  }

  // Load current summary box visibility state
  summaryBoxVisible = await getSummaryBoxVisibility();
  updateToggleButtonText();

  // Attach event listeners
  resetPositionButton.addEventListener("click", handleResetPosition);
  toggleVisibilityButton.addEventListener("click", handleToggleVisibility);
  closeButton.addEventListener("click", () => window.close());
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