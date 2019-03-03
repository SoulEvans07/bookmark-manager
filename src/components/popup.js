"use strict";

//chrome.bookmarks.getTree(function(bookmarks) {
//    bookmarks.forEach(function(root) {
//        let bookmark_list = document.getElementById('bookmark-list');
//        root.children.forEach(function(child) {
//            bookmark_list.appendChild(addBookmark(child));
//        });
//    })
//});

/*
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
*/
/*
const app3 = new Vue({
    el: '#app-3',
    data: {
        see: true,
        testText: ""
    },
    mounted(){
        this.test();
    },
    methods: {
        show: function () {
            this.see = !this.see;
            // todo: https://stackoverflow.com/questions/28884898/chrome-extension-change-default-icon-for-active-tab-only
            chrome.runtime.sendMessage({
                action: 'updateIcon',
                value: this.see
            });
        },
        test(){
            chrome.bookmarks.search("https://www.youtube.com/", function (res) {
                let text = "";
                for(let i = 0; i < res.length; i++){
                    let bookmark = res[i];
                    if(bookmark.url === "https://www.youtube.com/"){
                        text = JSON.stringify(bookmark, null, 2);
                        break;
                    } else {
                        text += JSON.stringify(bookmark, null, 2) + "\n";
                    }
                }
                app3.testText = text;
            })
        }
    }
});
*/