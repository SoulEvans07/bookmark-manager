"use strict";
Vue.config.productionTip = false;

const log = function (msg) {
    chrome.runtime.sendMessage({ action: 'log', value: msg });
};

class BookmarkFolder {
    constructor(title, id) {
        this.title = title;
        this.id = id;
    }

    equals(other){
        if(other && this.id == other.id && this.title == other.title){
            return true;
        }

        return false;
    }
}

const modifiers = [ 
    "esc", "control", "shift", "alt", "meta", "altgraph",
    "arrowup", "arrowdown", "arrowright", "arrowleft",
    "pageup", "pagedown", "end", "home", "insert"
];

Vue.component("bookmark-folder", {
    props: ["folder"],
    template: `<div @click="select" class="folder">{{ this.folder.title }}</div>`,
    methods: {
        select: function () {
            this.$emit("select", this.folder);
        }
    }
});

const folderExists = function(resolve, reject, folder){
    if(folder && folder.id && folder.title){
        chrome.bookmarks.get(folder.id, function(res){
            if(res && res.length > 0) {
                folder.title = res[0].title;
                resolve(folder);
            } else {
                reject();
            }
        });
    } else {
        reject();
    }
}

const app = new Vue({
    el: "#bookmark-manager",
    data: {
        title: "",
        url: "",
        lastFolder: "",
        bookmark: null,
        selectedFolder: {"title": "", "id": undefined},
        prevFolderValue: "",
        folderList: [],
        err: "",
        rootFolder: "_manager"
    },
    async mounted() {
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
            // sanity check lastFolder, remove if invalid
            new Promise(function(resolve, reject){
                folderExists(resolve, reject, res.lastFolder);
            }).then(function(folder){
                app.selectedFolder = folder;
                app.prevFolderValue = app.selectedFolder.title;
                app.search();
            }).catch(function(){
                chrome.bookmarks.getRecent(1, function(res) {
                    chrome.bookmarks.get(res[0].parentId, function(parent) {
                        app.selectedFolder = new BookmarkFolder(parent[0].title, parent[0].id);
                        app.prevFolderValue = app.selectedFolder.title;
                        app.search();
                    });
                });
                
            })
        });

        // todo: save bookmark with lastFolder

        // todo: set icon to full because we should have saved it by now
        // chrome.runtime.sendMessage({ action: 'updateIcon', value: "full" });
    },
    methods: {
        onSelection(folder) {
            this.selectedFolder = folder;
            this.prevFolderValue = this.selectedFolder.title;
            this.search();
        },
        search(event) {
            if(event && event.key.toLowerCase() == "enter") return;

            // remove id if folder name changed
            if(this.selectedFolder.title != this.prevFolderValue){
                this.selectedFolder.id = undefined;
                this.prevFolderValue = this.selectedFolder.title; 
            }

            chrome.bookmarks.search(app.selectedFolder.title, function (res) {
                app.folderList = [];
                let matching = [];
                res.forEach(function (folder) {
                    if (!folder.url) {
                        // todo: append parent folders to title
                        let bf = new BookmarkFolder(folder.title, folder.id)
                        if(app.selectedFolder.title === bf.title){
                            matching.push(bf);
                        }
                        app.folderList.push(bf);
                    }
                });
                // if folder name matches one folder, set id
                if(matching.length == 1){
                    app.selectedFolder = matching[0];
                }
            });
        },
        folderSelect(event) {
            if(this.folderList.length > 0){
                if(this.folderList[0].equals(this.selectedFolder)){
                    log("should save");
                } else {
                    this.selectedFolder = this.folderList[0];
                    this.search();
                }
            }
        },
        done() {
            // todo: check if this.selectedFolder exists in bookmarks
            if(this.bookmark){
                log("update this");
                log(this.bookmark);
                // todo: if url or title changed, update
                // todo: if this.selectedFolder.id != this.bookmark.parentId, move
                // todo: window.close();
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
        },
        quickSave(){
            log("quickSave");
            log(this.selectedFolder);
            chrome.storage.sync.set({ lastFolder: this.selectedFolder });
        }
    }
});
