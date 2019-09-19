// // Modules to control application life and create native browser window
// const {app, BrowserWindow} = require('electron');
// const path = require('path');

const { ipcMain, app, BrowserWindow } = require("electron");
const Alert = require("electron-alert");

const alert = new Alert();

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow;

const createWindow = () => {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 860,
    height: 645,
    show: false,
    backgroundColor: "#ffff0000",
    webPreferences: {
      nodeIntegration: true
    }
  });

  mainWindow.once("ready-to-show", () => {
    mainWindow.show();
  });

  // and load the index.html of the app.
  mainWindow.loadURL(`file://${__dirname}/index.html`);

  // Open the DevTools.
  // mainWindow.webContents.openDevTools();

  // Emitted when the window is closed.
  mainWindow.on("closed", () => {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null;

    // throw new Error('Whoops!');
  });
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on("ready", () => {
  createWindow();

  process.on(
    "uncaughtException",
    Alert.uncaughtException(false, err => {
      console.error("Uncaught Exception:", err);
      process.exit(1);
    })
  );

  ipcMain.on("alert-is-visible", e => {
    e.returnValue = alert.isVisible();
  });

  ipcMain.on("message", (e, arg) => {
    let msg = JSON.parse(arg);

    msg.title = msg.title ? msg.title : "Default title!";

    //make process throw exception just for testing
    if (msg.type == "exception")
      throw new Error("Exception thrown: A sample error occured.");

    if (msg.modalType == "toast") {
      Alert.fireToast({ ...msg });
      return;
    }

    msg.html = msg.text ? msg.text : "Default text.";
    e.returnValue = `Hello, <b>${process.env.USERNAME}</b>! I'm Main. I received your message. I will electron-alert it to the ${msg.position} shortly.`;

    setTimeout(() => {
      alert.fireFrameless({ ...msg });
    }, 300);
  });
});

// Quit when all windows are closed.
app.on("window-all-closed", () => {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createWindow();
  }
});
