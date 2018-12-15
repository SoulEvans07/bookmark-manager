chrome.runtime.onMessage.addListener(function (msg, sender, sendResponse) {
    if (msg.action === "updateIcon") {
        if (msg.value) {
            chrome.browserAction.setIcon({path: {"32": "imgs/save_32.png"} });
        } else {
            chrome.browserAction.setIcon({path: {"32": "imgs/icon_32.png"} });
        }
    }
});