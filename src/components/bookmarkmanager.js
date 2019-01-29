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
        selectedFolder: "",
        bookmarkList: []
    },
    mounted() {
        document.getElementById("searchbar").onkeyup = this.search;
    },
    methods: {
        onSelection(bookmark){
            this.selectedFolder = bookmark.title;
            this.search();
        },
        search(){
            app.bookmarkList = [];
            chrome.bookmarks.search(app.selectedFolder, function (res) {
                res.forEach(function (folder) {
                    if (!folder.url) {
                        app.bookmarkList.push(new Bookmark(folder.title));
                    }
                });
            })
        }
    }
});
