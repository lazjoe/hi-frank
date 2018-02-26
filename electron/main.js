const electron = require('electron')
// Module to control application life.
const app = electron.app
const globalShortcut = electron.globalShortcut

//const mongo = require('mongodb').MongoClient;
const assert = require('assert');

// Connection URL
//const mongo_url = 'mongodb://localhost:27017';

// Database Name
const dbName = 'myproject';

// Use connect method to connect to the server
// mongo.connect(mongo_url, function(err, client) {
//   assert.equal(null, err);
//   console.log("Connected successfully to server");

//   const db = client.db(dbName);

//   client.close();
// });

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

const { Context } = require('./main/context.js')
const { config } = require('./main/config.js')

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow
let instantMessageWindow

function createMainWindow () {
    let width = 720, height = 60
    let bottom = 50
    let top= workAreaSize.height - bottom - height
    let left = Math.round((workAreaSize.width - width)/2)
    mainWindow = createWindow('request_bar', {
    x: left, y: top, width: width, height: height, resizable: false,
    transparent: true, frame: false
  })
  
  // Create the browser window.
  // mainWindow = new BrowserWindow({
  //   width: 720, height: 60, resizable: false,
  //   transparent: true, frame: false
  // })

  // // and load the index.html of the app.
  // mainWindow.loadURL(url.format({
  //   pathname: path.join(__dirname, 'apps/request_bar/_.html'),
  //   protocol: 'file:',
  //   slashes: true
  // }))

  // // Open the DevTools.
  // //mainWindow.webContents.openDevTools( {mode:'detach'} )

  // // Emitted when the window is closed.
  // mainWindow.on('closed', function () {
  //   // Dereference the window object, usually you would store windows
  //   // in an array if your app supports multi windows, this is the time
  //   // when you should delete the corresponding element.
  //   mainWindow = null
  // })

}

function createMessengerWindow () {
    let mainPos = mainWindow.getPosition()
    let mainSize = mainWindow.getSize()

    let width = 350 + 30
    let height = 480
    let top = mainPos[1] - height
    let left = mainPos[0] + 560
    //let top:200, bottom:200, left: workAreaSize.width - width - 120, right: 120}
    //let margin = {top:200, bottom:0, left: Math.round(workAreaSize.width*0.65), right: 120}
    //let width = workAreaSize.width - margin.left - margin.right
    
    instantMessageWindow = createWindow('instant_message', {
      x: left, y: top, width: width, height: height, resizable: false,
      hasShadow: false, //useContentSize: true, 
      transparent: true, frame: false, alwaysOnTop: true
    })

    //instantMessageWindow.setIgnoreMouseEvents(true)
}

function createWindow (app, settings) {
  // let show = settings.show
  // settings.show = false

  // Create the browser window.
  newWindow = new BrowserWindow(settings)

  // and load the index.html of the app.
  newWindow.loadURL(url.format({
    pathname: path.join(__dirname, 'apps/' + app + '/_.html'),
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
let workAreaSize

app.on('ready', function () {
  workAreaSize = electron.screen.getPrimaryDisplay().workAreaSize

  createMainWindow();
  //mainWindow.hide()
  //createWindow('phit', {width: 1280, height: 720}) //{width: workAreaSize.width, height: workAreaSize.height} )

  // create window for Frank to reply with instant message
  createMessengerWindow();
  //instantMessageWindow.hide()

  // register hot keys
  globalShortcut.register('CommandOrControl+.', () => {
    mainWindow.smartToggle()
  })

  // load app configurations

  mainWindow.show() // set the focus back to main window
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

ipcMain.on('request_string', function (event, arg) {
  console.log('request received in main process: ', arg)

  var request = arg.toLowerCase();

  if (request == 'g_plot') {
    createWindow('datafrac/g_plot')
  } else if (request == 'datafrac') {
    createWindow('datafrac', {width: 1280, height: 720})
  } else if (request == 'clipboard') {
    createWindow('clipboard')  
  } else if (request == 'word_agent' || request == 'wa') {
    createWindow('word_agent')  
  } else if (request == 'phit') {
    createWindow('phit', {width: 1280, height: 720}) //{width: workAreaSize.width, height: workAreaSize.height} )
  } else if (request == 'plot') {
    createWindow('plot', {useContentSize: true, width: 600, height: 520} )
  } else {
    showInstantMessage(`${request}? I don't understand...`)
    //instantMessageWindow.openDevTools({mode:'detach'})
  }
})

function showInstantMessage(message) {
  if (!instantMessageWindow) {

  }

  // var pos = mainWindow.getPosition()
  // instantMessageWindow.setPosition(pos[0], pos[1]-160)
  // instantMessageWindow.show()

  //const {ipcMain} = require('electron');
  instantMessageWindow.webContents.send('show_instant_message', {message: message, type: 'error'})

  mainWindow.show() // set the focus back to main window
}

ipcMain.on('update_context', function (event, arg) {
})