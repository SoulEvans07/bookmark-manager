"use strict";

class Bookmark {
    constructor(title, path) {
        this.title = title;
        this.icon = "";
    }
}

Vue.component("bookmark-folder", {
    props: ["bookmark"],
    template: `<div @click="select">{{ this.bookmark.title }}</div>`,
    methods: {
        select: function () {
            this.$emit("select", this.bookmark);
        }
    }
});

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
        onSelection(bookmark){
            this.text = bookmark.title;
        }
    }
});
