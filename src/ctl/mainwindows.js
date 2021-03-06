'use strict';

// 主窗口

const {BrowserWindow, globalShortcut} = require("electron");

const utils = require("../utils");
const config = require("../config");
const path = require("path");
const TrayOp = require("./tray");


class MainWindows {

    constructor() {
        this.browserWindow = null;

        this.tray = new TrayOp(this);
        this.createBrowserWindow();
        this.addEventListener();
    }

    createBrowserWindow() {
        let options = {
            width: 1000,
            height: 600,
            transparent: true,
            frame: true,
            icon: utils.assets("logo.png"),
            center: true,
            title: config.APP_TITLE,
            autoHideMenuBar: true,
            titleBarStyle: "hidden-inset",
            webPreferences: {
                javascript: true,
                plugins: true,
                nodeIntegration: false,
                webSecurity: false,
                preload: path.join(__dirname, "../injects/preload.js"),
            }
        };
        console.log("preload", path.join(__dirname, "../injects/preload.js"));
        this.browserWindow = new BrowserWindow(options);

    }

    addEventListener() {
        this.onReadyToShow();
        this.onClose();
        this.onResize();
        this.onFocus();
        this.onBlur()
    }

    onReadyToShow() {
        let that = this;
        this.browserWindow.on("ready-to-show", () => {
            that.show();
        });
        this.registerglobalShortcut()
    }

    onClose() {
        let that = this;
        this.browserWindow.on("close", (e) => {
            if (that.browserWindow.isVisible()) {
                e.preventDefault();
                that.hide();
            }
        });
    }

    onResize() {
        let that = this;
        this.browserWindow.on("resize", () => {
            that.resize();
        });
    }

    onFocus(){
        this.browserWindow.on("focus",this.registerglobalShortcut)
    }

    onBlur(){
        this.browserWindow.on("blur", this.unregisterglobalShortcut)
    }

    show() {
        if (!this.browserWindow.isVisible()) {
            this.browserWindow.show();

        }
        if (!this.browserWindow.isFocused()) {
            this.browserWindow.focus();
        }
        this.registerglobalShortcut();
    }

    hide() {
        if (this.browserWindow.isVisible()) {
            this.browserWindow.hide();
        }
        this.unregisterglobalShortcut();
    }

    focus() {
        this.browserWindow.setFocusable();
    }

    loadURL(url) {
        this.browserWindow.loadURL(url);
    }

    showOrHide() {
        if (this.browserWindow.isVisible()) {
            this.browserWindow.hide();
        } else {
            this.browserWindow.show();
        }
    }

    resize() {
        let winSize = this.browserWindow.getSize();
        let x = winSize[0];
        let y = winSize[1];
        let fixPx = 59;
        this.browserWindow.webContents.executeJavaScript(`window.DingDingApp.doResize(` + x + `,` + y + `,` + fixPx + `)`)
    }

    registerglobalShortcut() {
        let that = this;
        globalShortcut.register("ESC", function () {
            that.hide();
        })
    }

    unregisterglobalShortcut() {
        globalShortcut.unregisterAll();
    }
}

module.exports = MainWindows;