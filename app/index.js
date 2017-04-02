const electron = require('electron')
const ipc = electron.ipcRenderer
const BrowserWindow = electron.remote.BrowserWindow
const path = require('path')

ipc.on('new-counter', (event, arg) => {
  console.log(event, arg)
  makeNewCounter()
})

function makeNewCounter() {
  const modalPath = path.join('file://', __dirname, 'new-counter-modal/', 'new-counter-modal.template.html')
  console.log(modalPath)
  const main = BrowserWindow.getFocusedWindow()
  let modal = new BrowserWindow({
    parent: main,
    modal: true,
    movable: false,
    show: false,
    frame: false,
    width: 150,
    height: 150
  })
  modal.on('close', () => modal = null)
  modal.loadURL(modalPath)
  modal.show()
  $('#nothing').addClass('hide')
  console.log('Nouveau compteur')
}

$("a#new-counter").click(makeNewCounter)
