chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'openPopup') {
    chrome.action.openPopup() // Opens the popup programmatically
  }
})

chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install' || details.reason === 'update') {
    chrome.tabs.query({}, (tabs) => {
      tabs.forEach((tab) => {
        if (tab.url && /^https:\/\/leetcode\.com(\/.*)?$/.test(tab.url)) {
          chrome.tabs.reload(tab.id, () => {})
        }
      })
    })
  }
})
