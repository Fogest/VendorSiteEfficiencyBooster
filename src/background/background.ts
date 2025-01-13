chrome.runtime.onInstalled.addListener(() => {
  console.log("Extension installed");
});

// Don't prompt for download location/overwrite for ir_patch.jpg
chrome.downloads.onDeterminingFilename.addListener((item, suggest) => {
  // Only overwrite if this is your "ir_patch.jpg" download
  if (item.filename.endsWith("ir_patch.jpg")) {
    suggest({
      filename: item.filename,
      conflictAction: "overwrite",
    });
  } else {
    // Leave all other downloads alone
    suggest();
  }
});
