import { app, BrowserWindow } from 'electron'
import { autoUpdater } from 'electron-updater'

import { createMenu, tray } from './main-process/menu'
import { checkServices, startServices, stopServices } from './main-process/service'
import { onUpdateAvailable, onUpdateDownloaded } from './utils/notification'

const gotTheLock = app.requestSingleInstanceLock()

if (!gotTheLock) {
    app.quit()
} else {
    // Set Application User Model ID
    app.setAppUserModelId('com.electronfriends.wemp')

    // Stop all running services before quitting
    app.on('before-quit', event => {
        event.preventDefault()
        stopServices()
        app.exit()
    })

    // Someone tried to run a second instance, we should focus the tray
    app.on('second-instance', () => {
        if (tray) tray.focus()
    })

    // Create application when ready
    app.on('ready', async () => {
        const window = new BrowserWindow({ show: false })

        await checkServices()
        createMenu()
        startServices()

        if (app.isPackaged) {
            autoUpdater.on('update-available', onUpdateAvailable)
            autoUpdater.on('update-downloaded', onUpdateDownloaded)
            autoUpdater.checkForUpdates()

            // Check for updates every 30 minutes
            setInterval(() => autoUpdater.checkForUpdates(), 30 * 60 * 1000)
        }
    })
}
