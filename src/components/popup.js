"use strict";

Vue.config.productionTip = false;

//chrome.bookmarks.getTree(function(bookmarks) {
//    bookmarks.forEach(function(root) {
//        let bookmark_list = document.getElementById('bookmark-list');
//        root.children.forEach(function(child) {
//            bookmark_list.appendChild(addBookmark(child));
//        });
//    })
//});

const addBookmark = function (child) {
    let div = document.createElement("div");
    div.id = child.id;
    let text = document.createElement("div");
    text.className += " bookmark";
    text.appendChild(document.createTextNode(child.title));
    div.appendChild(text);

    return div;
};

const openFolder = function (folder) {
    return function () {
        let folderDiv = document.getElementById(folder.id);
        folder.children.forEach(function (child) {
            let sub = addBookmark(child);
            sub.className += " sub";
            folderDiv.appendChild(sub);
        });
    }
};

document.getElementById("searchbar").onkeyup = function () {
    let results = document.getElementById("result");
    results.innerHTML = "";
    chrome.bookmarks.search(this.value, function (res) {
        res.forEach(function (folder) {
            if (!folder.url) {
                results.appendChild(addBookmark(folder));
            }
        });
    })
};

chrome.tabs.query({
    active: true,
    currentWindow: true
}, function (tabs) {
    document.getElementById("name").value = tabs[0].title;
});

const app3 = new Vue({
    el: '#app-3',
    data: {
        see: true
    },
    methods: {
        show: function () {
            this.see = !this.see;
            // todo: https://stackoverflow.com/questions/28884898/chrome-extension-change-default-icon-for-active-tab-only
            chrome.runtime.sendMessage({
                action: 'updateIcon',
                value: this.see
            });
        }
    }
});
