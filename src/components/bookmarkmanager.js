"use strict";
Vue.config.productionTip = false;

const log = function (msg) {
    chrome.runtime.sendMessage({ action: 'log', value: msg });
};

class Bookmark {
    constructor(title, id) {
        this.title = title;
        this.icon = "";
        this.id = id;
    }
}

Vue.component("bookmark-folder", {
    props: ["folder"],
    template: `<div @click="select" class="folder">{{ this.folder.title }}</div>`,
    methods: {
        select: function () {
            this.$emit("select", this.folder);
        }
    }
});

const app = new Vue({
    el: "#bookmark-manager",
    data: {
        title: "",
        url: "",
        lastFolder: "",
        bookmark: null,
        selectedFolder: {"title": "", "id": undefined},
        folderList: [],
        err: "",
        rootFolder: "_manager"
    },
    mounted() {
        document.getElementById("searchbar").onkeyup = this.search;
        document.getElementById("searchbar").focus();

        chrome.runtime.sendMessage({action: "getActiveTab"}, function(res) {
            if(res){
                app.title = res.title;
                app.url = res.url;
            }
        });

        chrome.runtime.sendMessage({action: "getBookmark"}, function(res) {
            app.bookmark = res;
        });

        chrome.storage.sync.get(['lastFolder'], function (res) {
            app.selectedFolder = res.lastFolder;
            app.search();
        });

        // todo: save bookmark with lastFolder

        // todo: set icon to full because we should have saved it by now
        // chrome.runtime.sendMessage({ action: 'updateIcon', value: "full" });
    },
    methods: {
        onSelection(folder) {
            this.selectedFolder = folder;
            this.search();
        },
        search() {
            // todo: remove id if folder name doesnt match any existing folder

            app.folderList = [];
            // log("search for :" + app.selectedFolder.title);
            chrome.bookmarks.search(app.selectedFolder.title, function (res) {
                res.forEach(function (folder) {
                    if (!folder.url) {
                        // todo: append parent folders to title
                        app.folderList.push(new Bookmark(folder.title, folder.id));
                    }
                });
            });
        },
        done() {
            // todo: check if this.selectedFolder exists in bookmarks
            if(this.bookmark){
                // todo: if url is stored already -> update
                log("update this");
                log(this.bookmark);
            } else {
                let tmp = {
                    "parentId": this.selectedFolder.id,
                    "title": this.title,
                    "url": this.url
                }
                chrome.bookmarks.create(tmp, function(res) {
                    this.bookmark = res;
                    chrome.runtime.sendMessage({action: "bookmarkUpdate", value: res});
                    chrome.storage.sync.set({ lastFolder: this.selectedFolder });
                    window.close();
                });
            }
        },
        remove() {
            if(this.bookmark){
                chrome.bookmarks.remove(this.bookmark.id, function() {
                    this.bookmark = null;
                    chrome.runtime.sendMessage({action: "bookmarkUpdate", value: null});
                    window.close();
                });
            }
        }
    }
});
