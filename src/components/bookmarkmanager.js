"use strict";

class Bookmark {
    constructor(title, path) {
        this.title = title;
        this.icon = "";
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
        lastFolder: "",
        selectedFolder: "",
        bookmarkList: []
    },
    mounted() {
        // todo: set icon to full

        document.getElementById("searchbar").onkeyup = this.search;

        chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
            app.title = tabs[0].title;
        });

        chrome.storage.sync.get(['lastFolder'], function (res) {
            app.selectedFolder = res.lastFolder;
        });
    },
    methods: {
        onSelection(bookmark) {
            this.selectedFolder = bookmark.title;
            this.search();
        },
        search() {
            app.bookmarkList = [];
            chrome.bookmarks.search(app.selectedFolder, function (res) {
                res.forEach(function (folder) {
                    if (!folder.url) {
                        // todo: append parent folders to title
                        app.bookmarkList.push(new Bookmark(folder.title));
                    }
                });
            })
        },
        done() {
            // todo: check if this.selectedFolder exists in bookmarks
            // todo: set icon to full
            // todo: if url is stored already -> update
            // todo: else -> save
            // save lastFolder
            chrome.storage.sync.set({ lastFolder: this.selectedFolder });
        },
        remove() {
            // todo: remove bookmark for url
            // todo: set icon to hollow
        }
    }
});

