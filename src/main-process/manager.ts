import { dialog } from 'electron'
import settings from 'electron-settings'
import fs from 'fs'
import path from 'path'

import config from '../config'
import download from '../utils/download'
import * as logger from '../utils/logger'
import { onServiceDownload, onServiceDownloadError, onServiceError } from '../utils/notification'
import { updateMenuStatus } from './menu'

/**
 * Store the service objects.
 */
const services: {[key: string]: Service} = {}

/**
 * Check if any of the services need to be installed or updated.
 */
export async function checkServices(): Promise<void> {
    if (!fs.existsSync(config.paths.services)) {
        fs.mkdirSync(config.paths.services)
        await setServicesPath()
    }

    for (const service of config.services) {
        const serviceName = service.name.toLowerCase()
        const servicePath = path.join(config.paths.services, serviceName)
        const serviceVersion = settings.getSync(serviceName)

        // Create a service instance
        if (!service.interface) {
            const { default: ServiceClass } = require(`../services/${serviceName}`);
            services[service.name] = new ServiceClass(config.paths.services, service)
        }

        // Check whether it is an installation or an update
        const isFirstDownload = !fs.existsSync(servicePath)

        if (isFirstDownload || serviceVersion !== service.version) {
            const notification = onServiceDownload(service, !isFirstDownload)

            try {
                await download(service, !isFirstDownload)

                if (isFirstDownload && !service.interface) {
                    await services[service.name].install()
                }
            } catch (error: any) {
                logger.write(error.message, () => onServiceDownloadError(service.name))
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
 */
export async function setServicesPath(): Promise<void> {
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

    settings.setSync('path', servicesPath)

    config.paths.services = servicesPath
}

/**
 * Start a service.
 *
 * @param name - The name of the service
 */
export async function startService(name: string): Promise<void> {
    const service = services[name]

    if (service) {
        try {
            await service.start()
            updateMenuStatus(name, true)
        } catch (error: any) {
            logger.write(error.message, () => onServiceError(name))
        }
    } else {
        logger.write(`Service '${name}' does not exist.`)
    }
}

/**
 * Start all services.
 */
export async function startServices(): Promise<void> {
    for (const service of config.services) {
        if (service.interface) {
            continue
        }

        await startService(service.name)
    }
}

/**
 * Stop a service.
 *
 * @param name - The name of the service
 * @param shouldRestart - Whether the service should restart
 */
export async function stopService(name: string, shouldRestart: boolean = false): Promise<void> {
    const service = services[name]

    if (service) {
        try {
            await service.stop();
            updateMenuStatus(name, false)
        } catch (error: any) {
            logger.write(error.message);
        }

        if (shouldRestart) {
            await startService(name)
        }
    } else {
        logger.write(`Service '${name}' does not exist.`)
    }
}

/**
 * Stop all services.
 *
 * @param shouldRestart - Whether the services should restart
 */
export async function stopServices(shouldRestart: boolean = false): Promise<void> {
    for (const service of config.services) {
        if (service.interface) {
            continue
        }

        await stopService(service.name, shouldRestart)
    }
}
