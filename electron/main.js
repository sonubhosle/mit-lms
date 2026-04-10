const { app, BrowserWindow, Tray, Menu } = require('electron')
const path = require('path')
const { spawn } = require('child_process')
const isDev = !app.isPackaged

let mainWindow
let tray
let nextProcess
let mongoProcess

async function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 1024,
    minHeight: 700,
    titleBarStyle: 'hidden',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    },
    icon: path.join(__dirname, '../assets/icon.png')
  })

  // In production, Next.js server should be started first
  const url = isDev ? 'http://localhost:3000' : 'http://localhost:3000'
  
  // Wait for server to be ready before loading
  const startLoading = () => {
    mainWindow.loadURL(url).catch(() => {
      setTimeout(startLoading, 1000)
    })
  }
  startLoading()

  mainWindow.on('close', (e) => {
    if (!app.isQuitting) {
      e.preventDefault()
      mainWindow.hide()
    }
    return false
  })
}

function createTray() {
  tray = new Tray(path.join(__dirname, '../assets/icon.png'))
  const contextMenu = Menu.buildFromTemplate([
    { label: 'Open Library System', click: () => mainWindow.show() },
    { type: 'separator' },
    { label: 'Exit', click: () => {
      app.isQuitting = true
      app.quit()
    }}
  ])
  tray.setToolTip('Library Management System')
  tray.setContextMenu(contextMenu)
  tray.on('double-click', () => mainWindow.show())
}

app.whenReady().then(async () => {
  // 1. Start MongoDB (bundled)
  // mongoProcess = spawn('./mongodb-portable/mongod', ['--dbpath', './data/db'])

  // 2. Start Next.js Server (standalone)
  // nextProcess = spawn('node', ['.next/standalone/server.js'])

  createWindow()
  createTray()
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})

app.on('before-quit', () => {
  if (nextProcess) nextProcess.kill()
  if (mongoProcess) mongoProcess.kill()
})
