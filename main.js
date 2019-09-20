// // Modules to control application life and create native browser window
// const {app, BrowserWindow} = require('electron');
// const path = require('path');

const { ipcMain, app, BrowserWindow } = require("electron");
const Alert = require("electron-alert");

const alert = new Alert(),
  username = process.env.USERNAME;

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
    mainWindow.removeMenu();
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

  ipcMain.on("message", (e, msg) => {
    msg = JSON.parse(msg);

    msg.title = msg.title ? msg.title : msg.type;
    msg.title = msg.title[0].toUpperCase() + msg.title.slice(1);

    //make process throw exception just for testing
    if (msg.type == "uncaught-exception") {
      msg = "Exception thrown: A sample error occured in the main process.";
      e.returnValue = `<span class='danger'>${msg}</span>`;
      throw new Error(msg);
    }

    e.returnValue = `Hi, <b>${username}</b>! I'm Main. I received your ${msg.type} message. I will electron-${msg.modalType} it to the ${msg.position} of your screen in a second.`;

    if (msg.modalType == "toast") {
      Alert.fireToast({ ...msg });
      return;
    }

    msg.html = msg.text ? msg.text : `Here is a sample ${msg.type} message!`;
    setTimeout(() => {
      if (!alert.isVisible())
        alert.fireFrameless({ ...msg }).then(res => {
          if (msg.showCancelButton && /question|warning/.test(msg.type))
            if (res.value)
              // alert.fireFrameless({
              //   type: 'success',
              //   title: 'Success',
              //   text: 'You clicked OK to proceed.'
              // });
              Alert.fireToast({
                type: "success",
                title: "Success! You clicked OK.",
                showConfirmButton: false,
                timer: 3000
              });
            else
              setTimeout(() => {
                alert.fireFrameless({
                  type: "error",
                  title: "Cancelled",
                  text: "You clicked on the cancel button."
                });
              }, 300);
        });
    }, 350);
  });

  let qAlert = new Alert();

  ipcMain.on("quit", (e, msg) => {
    msg = JSON.parse(msg);
    if (!qAlert.isVisible())
      qAlert.fireWithFrame({ ...msg }, "ElectronAlert - Quit", null, true).then(res => {
        setTimeout(() => {
          if (res.value)
            qAlert
              .fireWithFrame({
                title: `Have a nice day, <br />${username}!`,
                timer: 3000
              }, 'ElectronAlert - Bye', null, true)
              .then(() => {
                process.exit(1);
              });
          else {
            Alert.fireToast({
              title: "Welcome back!",
              timer: 3000,
              position: "top-end"
            });
          }
        }, 300);
      });
    e.returnValue = true;
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
