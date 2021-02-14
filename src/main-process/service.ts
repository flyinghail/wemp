import { dialog } from 'electron'
import settings from 'electron-settings'
import fs from 'fs'
import path from 'path'

import config from '../config'
import download from '../utils/download'
import * as logger from '../utils/logger'
import { onServiceDownload, onServiceDownloadError, onServicesReady } from '../utils/notification'
import { updateMenuStatus } from './menu'

/**
 * Store the service objects in an array.
 */
export const services: any = []

/**
 * Check if services should be installed or need an update.
 */
export function checkServices() {
    return new Promise<void>(async (resolve, reject) => {
        // Check whether the services directory exists
        if (!fs.existsSync(config.paths.services)) {
            fs.mkdirSync(config.paths.services)

            const result = await dialog.showOpenDialog({
                title: 'Choose a directory for the services',
                defaultPath: config.paths.services,
                properties: ['openDirectory']
            })

            const servicesPath = result.filePaths[0] || config.paths.services

            // Remove default service directory because another one is being used
            if (servicesPath !== config.paths.services) {
                fs.rmdirSync(config.paths.services)
            }

            config.paths.services = servicesPath

            settings.setSync({ path: servicesPath })
        }

        // Check if a service needs to be installed or updated
        for (const service of config.services) {
            const servicePath = path.join(config.paths.services, service.name.toLowerCase())
            const serviceVersion = settings.getSync(service.name.toLowerCase())

            const isFirstDownload = !fs.existsSync(servicePath)

            // Create service instance
            services[service.name] = require(`../services/${service.name.toLowerCase()}`)

            // Check whether it is the first download or an update
            if (isFirstDownload || serviceVersion !== service.version) {
                const notification = onServiceDownload(service, !isFirstDownload)

                try {
                    await download(service, !isFirstDownload)

                    // Run service installation on first download
                    if (isFirstDownload) await services[service.name].install()
                } catch (error) {
                    logger.write(error, () => onServiceDownloadError(service.name))
                }

                notification.close()
            }

            // Watch for configuration file changes
            const serviceConfig = path.join(servicePath, service.config)

            if (fs.existsSync(serviceConfig)) {
                let debounce

                fs.watch(serviceConfig, (event, filename) => {
                    if (!filename || debounce) return

                    debounce = setTimeout(() => { debounce = false }, 100)

                    stopService(service.name, true)
                })
            }
        }

        resolve()
    })
}

/**
 * Start a service.
 *
 * @param name Name of the service
 */
export function startService(name: string) {
    const service = services[name]

    if (service && !service.started) {
        service.start()
        updateMenuStatus(name, true)
    } else {
        logger.writeSync(`Service '${name}' does not exist.`)
    }
}

/**
 * Start all services.
 */
export function startServices() {
    for (const service of config.services) {
        startService(service.name)
    }

    onServicesReady()
}

/**
 * Stop or restart a service.
 *
 * @param name Name of the service
 * @param shouldRestart Whether the service should be restarted
 */
export function stopService(name: string, shouldRestart: boolean = false) {
    if (services[name]) {
        services[name].stop()

        updateMenuStatus(name, false)

        if (shouldRestart) {
            setTimeout(() => startService(name), 2000)
        }
    } else {
        logger.writeSync(`Service '${name}' does not exist.`)
    }
}

/**
 * Stop all services.
 */
export function stopServices() {
    for (const service of config.services) {
        stopService(service.name)
    }
}
