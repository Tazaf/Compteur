const electron = require('electron')
const ipc = electron.ipcRenderer
const BrowserWindow = electron.remote.BrowserWindow
const path = require('path')

ipc.on('new-counter', (event, arg) => {
  console.log(event, arg)
  showNbPlayerModal()
})

ipc.on('nb-player', (event, arg) => {
  $('#nothing').addClass('hide')
})

$("a#new-counter").click(showNbPlayerModal)

function showNbPlayerModal() {
  const modalPath = path.join('file://', __dirname, 'new-counter-modal/', 'new-counter-modal.template.html')
  const main = BrowserWindow.getFocusedWindow()
  let modal = new BrowserWindow({
    parent: main,
    // modal: true,
    // movable: false,
    show: false,
    // frame: false,
    width: 150,
    height: 300,
    title: "Nouveau compteur"
  })
  modal.on('close', () => modal = null)
  modal.loadURL(modalPath)
  modal.show()
}

// To move to the JS of the modal

