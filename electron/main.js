const electron = require('electron')
// Module to control application life.
const app = electron.app
const globalShortcut = electron.globalShortcut

// Module to create native browser window.
const BrowserWindow = electron.BrowserWindow

BrowserWindow.prototype.smartToggle = function () {
  if (this.isVisible() && this.isFocused()) {
    this.hide()
  } else {
    this.show()
  }
}

const path = require('path')
const url = require('url')

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow

function createMainWindow () {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 720, height: 60, resizable: false,
    transparent: true, frame: false
  })

  // and load the index.html of the app.
  mainWindow.loadURL(url.format({
    pathname: path.join(__dirname, 'apps/request_bar/_.html'),
    protocol: 'file:',
    slashes: true
  }))

  // Open the DevTools.
  //mainWindow.webContents.openDevTools( {mode:'detach'} )

  // Emitted when the window is closed.
  mainWindow.on('closed', function () {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null
  })
}

function createWindow (view) {
  // Create the browser window.
  newWindow = new BrowserWindow({width: 800, height: 600})

  // and load the index.html of the app.
  newWindow.loadURL(url.format({
    pathname: path.join(__dirname, 'apps/' + view + '/_.html'),
    protocol: 'file:',
    slashes: true
  }))

  // Open the DevTools.
  //newWindow.webContents.openDevTools( {mode:'detach'} )

  // Emitted when the window is closed.
  newWindow.on('closed', function () {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    newWindow = null
  })

  return newWindow;
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', function () {
  createMainWindow();

  globalShortcut.register('CommandOrControl+.', () => {
    mainWindow.smartToggle
    ()
  })

})

// Quit when all windows are closed.
app.on('window-all-closed', function () {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', function () {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createMainWindow()
  }
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.

const ipcMain = electron.ipcMain;
const clipboard = electron.clipboard;

ipcMain.on('request_string', function (event, arg) {
  console.log("request received in main process: ", arg)

  var request = arg.toLowerCase();

  if (arg == 'G_plot') {
    createWindow('datafrac/g_plot')
  } else if (arg == 'clipboard') {
    createWindow('clipboard')
  }

  var formats = clipboard.availableFormats();
  for(let i in formats) {
    let format = formats[i]

    if (format == 'text/plain') {
      console.log('[text/plain] ', clipboard.readText())
    } 
    else if (format == 'text/html') {
      console.log('[text/html] ', clipboard.readHTML())
    }
    else if (format == 'text/rtf') {
      console.log('[text/rtf] ', clipboard.readRTF())
    }
    else if (format == 'image/png') {
      console.log('[image/png]', clipboard.readImage())
    }
    else {
      console.log('Unsupported format: ', format)
    }

  }
});
