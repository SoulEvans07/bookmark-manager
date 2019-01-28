"use strict";

class Bookmark {
    constructor(title, path) {
        this.title = title;
        this.icon = "";
    }
}

const app = new Vue({
    el: "#bookmark-manager",
    data: {
        text: "AS",
        bookmarkList: []
    },
    mounted() {
        document.getElementById("searchbar").onkeyup = function () {
            app.bookmarkList = [];
            chrome.bookmarks.search(this.value, function (res) {
                res.forEach(function (folder) {
                    if (!folder.url) {
                        app.bookmarkList.push(new Bookmark(folder.title));
                    }
                });
            })
        };

        this.text = "mounted";
    },
    methods: {
        getBookmarks: function () {
            let text = "";
            this.bookmarkList.forEach(bookmark => {
                text += bookmark.title + "\n";
            });
            return text;
        }
    }
});
