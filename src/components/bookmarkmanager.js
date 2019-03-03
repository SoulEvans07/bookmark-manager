"use strict";
Vue.config.productionTip = false;

const log = function (msg) {
    chrome.runtime.sendMessage({ action: 'log', value: msg });
};

const check = async function (url) {
    let bm = null;
    log("url: " + url);
    await chrome.bookmarks.search(url, function (res) {
        for (let i = 0; i < res.length; i++) {
            let bookmark = res[i];
            log(i + ". " + bookmark.url);
            if (bookmark.url === url) {
                bm = bookmark;
                break;
            }
        }
    });
    log("bookmark: " + JSON.stringify(bm));
    return bm;
};

class Bookmark {
    constructor(title, id) {
        this.title = title;
        this.icon = "";
        this.id = id;
    }
}

Vue.component("bookmark-folder", {
    props: ["bookmark"],
    template: `<div @click="select" class="folder">{{ this.bookmark.title }}</div>`,
    methods: {
        select: function () {
            this.$emit("select", this.bookmark);
        }
    }
});

const app = new Vue({
    el: "#bookmark-manager",
    data: {
        title: "",
        url: "",
        lastFolder: "",
        selectedFolder: {"title": "", "id": undefined},
        bookmarkList: [],
        err: "",
        rootFolder: "_manager"
    },
    mounted() {
        // todo: set icon to full
        // todo: save bookmark with lastFolder
        //log("test");
        document.getElementById("searchbar").onkeyup = this.search;
        document.getElementById("searchbar").focus();

        chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
            app.title = tabs[0].title;
            app.url = tabs[0].url;

            //log(check(tabs[0].url));

            if(check(tabs[0].url)){
                chrome.runtime.sendMessage({ action: 'updateIcon', value: "full" });
            } else {
                chrome.runtime.sendMessage({ action: 'updateIcon', value: "hollow" });
            }
        });

        chrome.storage.sync.get(['lastFolder'], function (res) {
            app.selectedFolder = res.lastFolder;
        });

    },
    methods: {
        onSelection(folder) {
            this.selectedFolder = folder;
            this.search();
        },
        search() {
            // todo: remove id if folder name doesnt match any existing folder

            app.bookmarkList = [];
            log(app.selectedFolder.title);
            chrome.bookmarks.search(app.selectedFolder.title, function (res) {
                res.forEach(function (folder) {
                    if (!folder.url) {
                        // todo: append parent folders to title
                        app.bookmarkList.push(new Bookmark(folder.title, folder.id));
                    }
                });
            })
        },
        done() {
            // todo: check if this.selectedFolder exists in bookmarks
            // todo: set icon to full
            // todo: if url is stored already -> update
            // else -> save
            chrome.bookmarks.create({
                "parentId": this.selectedFolder.id,
                "title": this.title,
                "url": this.url
            });
            // save lastFolder
            chrome.storage.sync.set({ lastFolder: this.selectedFolder });
        },
        remove() {
            // todo: remove bookmark for url
            // todo: set icon to hollow
        }
    }
});




// chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
//     log("update");
//     if (tabs[0].url) {
//         log(tabs[0].url);
//         if (check(tabs[0].url)) {
//             chrome.runtime.sendMessage({ action: 'updateIcon', value: "full" });
//         } else {
//             chrome.runtime.sendMessage({ action: 'updateIcon', value: "hollow" });
//         }
//     }
// });