// content.ts
function readInfoFromPage() {
  // Implementation to read info from the page
  return "Page info placeholder";
}

function modifyPage() {
  // Implementation to modify/inject elements
  console.log("Page modified");
}

// Listen for messages from the background script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "readInfo") {
    const info = readInfoFromPage();
    sendResponse({ info });
  } else if (message.action === "modifyPage") {
    modifyPage();
    sendResponse({ success: true });
  }
});
