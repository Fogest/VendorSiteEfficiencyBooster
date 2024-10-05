// background.ts
async function makeApiCall(endpoint: string) {
  const response = await fetch(`http://example.com/api/${endpoint}`);
  return response.json();
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "apiCall") {
    makeApiCall(message.endpoint).then((data) => {
      sendResponse({ data });
    });
    return true; // Indicates we want to use sendResponse asynchronously
  }
});

chrome.runtime.onInstalled.addListener(() => {
  console.log("Extension installed");
});
