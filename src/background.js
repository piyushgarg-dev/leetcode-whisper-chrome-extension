chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'openPopup') {
    chrome.action.openPopup() // Opens the popup programmatically
  }
})
