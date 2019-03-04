let activeTab = {
    tabId : null,
    windowId: null,
    url: null
}

chrome.runtime.onMessage.addListener(function (msg, sender, sendResponse) {
    console.log("["+msg.action+"] "+ JSON.stringify(msg.value));
    if (msg.action === "updateIcon") {
        //console.log("updateIcon: " + msg.value);
        if (msg.value === 'full') {
            chrome.browserAction.setIcon({ path: { "256": "imgs/save_32.png" } });
        } else if (msg.value === 'hollow'){
            chrome.browserAction.setIcon({ path: { "256": "imgs/icon_32.png" } });
        }
    }

    if(msg.action === "getActiveTab") {
        sendResponse(activeTab);
    }
});

chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab){
    if( (tabId == activeTab.tabId  || tabId == activeTab.id ) && changeInfo.url){
        setActiveTab(tab);
        onUrlChange(changeInfo.url);
    }
});

chrome.tabs.onActivated.addListener(function(activeInfo) {
    activeTab = activeInfo;
    onTabSelect();
});

const onTabSelect = function() {
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        if(tabs[0].url) {
            setActiveTab(tabs[0]);
            onUrlChange(tabs[0].url);
        } else {
            chrome.browserAction.setIcon({ path: { "32": "imgs/icon_32.png" } });
        }
    });
}

const setActiveTab = function(tab){
    console.log(tab);
    activeTab = tab;
}

const onUrlChange = function(url){
    let checkPromise = new Promise(function(res,rej){
        searchBookmarks(res, rej, url);
    })
    
    checkPromise.then(function(res){
        //console.log("result: " + JSON.stringify(res));
        if(res){
            chrome.browserAction.setIcon({ path: { "32": "imgs/save_32.png" } });
        } else {
            chrome.browserAction.setIcon({ path: { "32": "imgs/icon_32.png" } });
        }
    }).catch(function(err){
        console.log("[ERROR] " + err);
    });
}

const searchBookmarks = function (resolve, reject, url) {
    let bm = null;
    try{
        chrome.bookmarks.search(url, function (res) {
            for (let i = 0; i < res.length; i++) {
                let bookmark = res[i];
                //console.log(i + ". " + bookmark.url);
                if (bookmark.url === url) {
                    bm = bookmark;
                    break;
                }
            }
            resolve(bm);
        });
    } catch(err) {
        reject(err);
    }
};
