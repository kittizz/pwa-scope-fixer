console.log("Background service worker loaded.");

chrome.runtime.onInstalled.addListener(() => {
  console.log("Extension installed.");
});

chrome.action.onClicked.addListener((tab) => {
  console.log("Action clicked", tab);
});

chrome.runtime.onMessage.addListener((request, _sender, _sendResponse) => {
  if (request.action === "open_chrome_apps") {
    console.log("[PWA Scope Fixer] Opening chrome://apps/");
    chrome.tabs.create({ url: "chrome://apps/" }).catch((err) => {
      console.error("[PWA Scope Fixer] Failed to open chrome://apps/", err);
    });
  }
});
