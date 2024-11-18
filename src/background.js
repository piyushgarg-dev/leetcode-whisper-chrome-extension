chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'openPopup') {
    chrome.action.openPopup() // Opens the popup programmatically
  }
})

chrome.commands.onCommand.addListener((command) => {
  if (command === "open_ai_chat") {
    chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
      if (tabs[0]) {
        chrome.tabs.sendMessage(tabs[0].id, {action: "openAiChat"});
      }
    });
  }
}); 