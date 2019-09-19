"use strict";
// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.

const ipcRenderer = require("electron").ipcRenderer,
  Q = document.querySelector.bind(document),
  QAll = document.querySelectorAll.bind(document);

QAll(".input").forEach(inp => {
  inp.addEventListener("input", function() {
    updateStatusMsg();
    this.addEventListener("keyup", function(e) {
      if (e.keyCode == 13) Q(".send-message").click();
    });

    if (this.value == "uncaught-exception")
      updateStatusMsg(
        "<b class='danger'>Caution: An error will be thrown, app will then quit.</b>"
      );

    if (this.classList.contains("modal-type")) {
      Q(".opt-for-alert").classList.toggle("hide");
      Q(".opt-for-toast").classList.toggle("hide");
      Q(".footer-label").classList.toggle("hide");
    }
  });
});

Q(".send-message").onclick = function() {
  const sendBtn = this;

  sendBtn.disabled = true;

  let jsonMsg,
    msg = {
      type: Q(".message-type").value,
      title: Q(".message-title").value.trim(),
      text: Q(".message-text").value.trim(),
      footer: Q(".message-footer").value.trim(),
      modalType: Q(".modal-type").value,
      position: Q(".modal-position").value,
      showCancelButton: Q(".cancel-button").checked
    };

  if (msg.modalType == "toast") {
    msg.timer = Q(".timer").value;
    msg.showConfirmButton = Q(".confirm-button").checked;
    msg.showCancelButton = false;
    msg.footer = null;
  }

  jsonMsg = JSON.stringify(msg);

  updateStatusMsg("Sending message...");
  setTimeout(() => {
    if (!ipcRenderer.sendSync("alert-is-visible"))
      updateStatusMsg(ipcRenderer.sendSync("message", jsonMsg));
    else
      updateStatusMsg(
        "<b>Oops!</b> Cannot send message.<br />Main says electron-alert has an active modal and that you close it before resending your message."
      );
    sendBtn.disabled = false;
  }, 350);
};

updateStatusMsg(`
  Using Electron version: ${process.versions.electron}<br />
  Using Chromium version: ${process.versions.chrome}<br />
  Using Node version: ${process.versions.node}<br />
`);

function updateStatusMsg(text) {
  Q(".status").innerHTML = text || "";
}
