// // Modules to control application life and create native browser window
// const {app, BrowserWindow} = require('electron');
// const path = require('path');

const { ipcMain, app, BrowserWindow } = require("electron");
const Alert = require("C:/Users/Power'f-GOD/codely/electron-alert/dist/alert.js");
const head = [
  `
<style>
  .monospace-font
  { font-family: "Courier New", Courier, monospace; }

  .serif-font
  { font-family: Georgia, 'Times New Roman', Times, serif; }

  .sans-serif-font
  { font-family: 'Trebuchet MS', 'Lucida Sans Unicode', 'Lucida Grande', 'Lucida Sans', Arial, sans-serif; }
</style>
`
];

const alert = new Alert(head),
  quitAlert = new Alert(head),
  username = process.env.USERNAME,
  customClass = {
    container: null,
    popup: null,
    header: null,
    title: null,
    closeButton: null,
    icon: null,
    // image: null, content: null, input: null, actions: null,
    confirmButton: null,
    cancelButton: null,
    footer: null
  };

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
  Alert.fireToast({
    title: `Logged on as ${username}`,
    timer: 3000,
    position: "top-end",
    showConfirmButton: false
  });

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

  ipcMain.on("triggerAlerts", e => {
    const types = ["success", "error", "warning", "info", "question", "toast"],
      fonts = ["serif-font", "monospace-font",  "sans-serif-font"];
    let i = 0;

    const callTriggerer = () => {
      addCustomClass(fonts[i % fonts.length]);

      let options = {
          type: types[i],
          title: `${types[i][0].toUpperCase() + types[i].slice(1)}`,
          timer: 3000,
          customClass: customClass
        },
        alert = new Alert(head);

      options.showCancelButton = /warning|question/.test(types[i]);

      if (i % 2 == 0) {
        options.html = `${options.title} alert without frame!`;
        alert.fireFrameless(options).then(() => callTriggerer());
      } else if (i == 5) {
        Alert.fireToast({
          type: "success",
          title: "Event toast.",
          showConfirmButton: false,
          timer: 3000
        }).then(() => callTriggerer());
      } else {
        options.html = `${options.title} alert with frame and custom frame title!`;
        alert.fireWithFrame(options, "Custom Title").then(() => callTriggerer());
      }
      i++;

      if (i == types.length) i = 0;
    };
    callTriggerer();
  });

  ipcMain.on("message", (e, msg) => {
    msg = JSON.parse(msg);
    addCustomClass(msg.modalFont);
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
      if (true || !alert.isVisible())
        alert
          .fireFrameless(
            {
              ...msg,
              customClass: customClass
            },
            null,
            null,
            null,
            {
              freq: "19.45", // or Eb0
              type: "sine", // ["sine", "square", "triange", "sawtooth"]
              duration: "1" // 1 sec
            }
          )
          .then(res => {
            if (msg.showCancelButton && /question|warning/.test(msg.type))
              if (res.value)
                Alert.fireToast({
                  type: "success",
                  title: "Success! You clicked OK.",
                  showConfirmButton: false,
                  timer: 3000
                });
              // (new Alert(head))
              else
                alert.fireFrameless({
                  type: "error",
                  title: "Cancelled",
                  text: "You clicked on the cancel button.",
                  customClass: customClass
                });
          });
    }, 350);
  });

  ipcMain.on("quit", (e, msg) => {
    msg = JSON.parse(msg);
    msg.position = "center";
    addCustomClass(msg.modalFont);

    if (!quitAlert.isVisible())
      quitAlert
        .fireWithFrame(
          { ...msg, customClass: customClass },
          "ElectronAlert - Quit",
          null,
          true
        )
        .then(res => {
          setTimeout(() => {
            if (res.value)
              quitAlert
                .fireWithFrame(
                  {
                    title: `Have a nice day,<br />${username}!`,
                    timer: 3000,
                    customClass: customClass
                  },
                  "ElectronAlert - Bye",
                  null,
                  true
                )
                .then(() => {
                  process.exit(0);
                });
            else {
              Alert.fireToast({
                title: "Thanks for staying!",
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

function addCustomClass(className) {
  for (let prop in customClass) customClass[prop] = className;
}
