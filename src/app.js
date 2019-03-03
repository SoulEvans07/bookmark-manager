chrome.runtime.onMessage.addListener(function (msg, sender, sendResponse) {
    console.log("["+msg.action+"] "+ msg.value);
    //if (msg.action === "log") {
    //    console.log(msg.value);
    //}

    if (msg.action === "updateIcon") {
        //console.log("updateIcon: " + msg.value);
        if (msg.value === 'full') {
            chrome.browserAction.setIcon({ path: { "256": "imgs/save_32.png" } });
        } else if (msg.value === 'hollow'){
            chrome.browserAction.setIcon({ path: { "256": "imgs/icon_32.png" } });
        }
    }
});



// todo: set icon when active page is in bookmarks
//      https://developer.chrome.com/extensions/tabs#event-onActivated
