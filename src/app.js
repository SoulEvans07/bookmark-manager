let storage = {
    bookmark: {},
    activeTab: {}
}

const setActiveTab = function(tab){
    // console.log(tab);
    storage.activeTab = tab;
}

chrome.runtime.onMessage.addListener(function (msg, sender, sendResponse) {
    if(msg.action === "getActiveTab") {
        sendResponse(storage.activeTab);
        return true;
    }

    if(msg.action === "getBookmark") {
        sendResponse(storage.bookmark);
        return true;
    }

    if(msg.action === "bookmarkUpdate") {
        storage.bookmark = msg.value;
        setIconByBookmark(msg.value);
        return true;
    }

    console.log("["+msg.action+"] "+ JSON.stringify(msg.value));
    
    if (msg.action === "updateIcon") {
        //console.log("updateIcon: " + msg.value);
        if (msg.value === 'full') {
            chrome.browserAction.setIcon({ path: { "256": "imgs/save_32.png" } });
        } else if (msg.value === 'hollow'){
            chrome.browserAction.setIcon({ path: { "256": "imgs/icon_32.png" } });
        }
    }
});

chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab){
    if((tabId == storage.activeTab.tabId  || tabId == storage.activeTab.id ) && changeInfo.status == "loading"){
        setActiveTab(tab);
        if(changeInfo.url) {
            onUrlChange(changeInfo.url);
        } else {
            onUrlChange(storage.activeTab.url);
        }
    }
});

chrome.tabs.onActivated.addListener(function(activeInfo) {
    setActiveTab(activeInfo);
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

const onUrlChange = function(url){
    let checkPromise = new Promise(function(res,rej){
        searchBookmarks(res, rej, url);
    })
    
    checkPromise.then(function(res){
        storage.bookmark = res;
        setIconByBookmark(res);
    }).catch(function(err){
        console.log("[ERROR] " + err);
    });
}

const setIconByBookmark = function(bm) {
    if(bm){
        chrome.browserAction.setIcon({ path: { "32": "imgs/save_32.png" } });
    } else {
        chrome.browserAction.setIcon({ path: { "32": "imgs/icon_32.png" } });
    }
}

const searchBookmarks = function (resolve, reject, url) {
    let bm = null;
    try{
        chrome.bookmarks.search({"url": url}, function (res) {
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
