import { dialog } from 'electron'
import settings from 'electron-settings'
import fs from 'fs'
import fetch from 'node-fetch'
import path from 'path'

import config from '../config'
import download from '../utils/download'
import * as logger from '../utils/logger'
import { onServiceDownload, onServiceDownloadError, onServiceError } from '../utils/notification'
import { updateMenuStatus } from './menu'

/**
 * Store the service objects in an array.
 */
const services: any = []

/**
 * Check if any of the services need to be installed or updated.
 *
 * @returns {Promise}
 */
export async function checkServices(): Promise<void> {
    if (!fs.existsSync(config.paths.services)) {
        fs.mkdirSync(config.paths.services)
        await setupServicesPath()
    }

    for (const service of config.services) {
        const serviceName = service.name.toLowerCase()
        const servicePath = path.join(config.paths.services, service.name)
        const serviceVersion = settings.getSync(serviceName)

        // Create a service instance
        if (!service.interface) services[service.name] = require(`../services/${serviceName}`)

        // Check whether it is an installation or an update
        const isFirstDownload = !fs.existsSync(servicePath)

        if (isFirstDownload || serviceVersion !== service.version) {
            const notification = onServiceDownload(service, !isFirstDownload)

            try {
                await download(service, !isFirstDownload)

                if (isFirstDownload) {
                    // MariaDB doesn't need a stub, it just needs to be installed
                    if (service.name === 'MariaDB') {
                        await services[service.name].install()
                    } else {
                        // Download the stub configuration file from GitHub
                        const response = await fetch(`https://github.com/electronfriends/wemp/raw/main/stubs/${serviceName}/${service.config}`)
                        const data = await response.text()

                        // Replace the placeholder for the services path
                        const content = data.replace('{servicesPath}', config.paths.services)

                        fs.writeFileSync(path.join(servicePath, service.config), content)
                    }
                }
            } catch (e) {
                logger.write(e, onServiceDownloadError(service.name))
            }

            notification.close()
        }

        // Watch for configuration file changes
        if (!service.interface) {
            const serviceConfig = path.join(servicePath, service.config)

            if (fs.existsSync(serviceConfig)) {
                let debounce: NodeJS.Timeout | null

                fs.watch(serviceConfig, (event, filename) => {
                    if (!filename || debounce) return
                    debounce = setTimeout(() => debounce = null, 1000)
                    stopService(service.name, true)
                })
            }
        }
    }
}

/**
 * Set the path to the services.
 *
 * @returns {Promise}
 */
export async function setupServicesPath(): Promise<void> {
    const result = await dialog.showOpenDialog({
        title: 'Choose a folder where the services will be installed',
        defaultPath: config.paths.services,
        properties: ['openDirectory']
    })

    const servicesPath = result.filePaths[0] || config.paths.services

    // Remove the old services directory if it is empty
    if (servicesPath !== config.paths.services) {
        const files = fs.readdirSync(config.paths.services)

        if (files.length === 0) {
            fs.rmdirSync(config.paths.services)
        }
    }

    settings.setSync({ path: servicesPath })
    config.paths.services = servicesPath
}

/**
 * Start a service.
 *
 * @param name The name of the service.
 * @returns {Promise}
 */
export async function startService(name: string): Promise<void> {
    const service = services[name]

    if (service) {
        service.start()
            .then(updateMenuStatus(name, true))
            .catch(e => {
                logger.write(e, updateMenuStatus(name, false))
                onServiceError(name)
            })
    } else {
        logger.write(`Service '${name}' does not exist.`)
    }
}

/**
 * Start all services.
 *
 * @returns {Promise}
 */
export async function startServices(): Promise<void> {
    for (const service of config.services) {
        if (service.interface) continue
        await startService(service.name)
    }
}

/**
 * Stop a service.
 *
 * @param name The name of the service.
 * @param shouldRestart Whether the service should restart.
 * @returns {Promise}
 */
export async function stopService(name: string, shouldRestart: boolean = false): Promise<void> {
    const service = services[name]

    if (service) {
        await service.stop()
            .then(updateMenuStatus(name, false))
            .catch(logger.write)

        if (shouldRestart) {
            startService(name)
        }
    } else {
        logger.write(`Service '${name}' does not exist.`)
    }
}

/**
 * Stop all services.
 *
 * @returns {Promise}
 */
export async function stopServices(): Promise<void> {
    for (const service of config.services) {
        if (service.interface) continue
        await stopService(service.name)
    }
}