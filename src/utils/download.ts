import settings from 'electron-settings'
import fs from 'fs'
import fetch from 'node-fetch'
import path from 'path'
import unzipper from 'unzipper'

import config from '../config'

/**
 * Download and extract the service files.
 *
 * @param service Service configuration.
 * @param isUpdate Whether it is an update or first installation.
 * @returns {Promise}
 */
export default async function download(service: any, isUpdate: boolean): Promise<any> {
    const serviceName = service.name.toLowerCase()
    const servicePath = path.join(config.paths.services, serviceName)

    if (!fs.existsSync(servicePath)) {
        fs.mkdirSync(servicePath)
    }

    const url = service.url.replace(/{version}/g, service.version)
    const response = await fetch(url)

    await new Promise<void>((resolve, reject) => {
        response.body.pipe(unzipper.Parse())
            .on('entry', entry => {
                let fileName = entry.path

                // We assume that only PHP doesn't put the files inside a directory
                if (service.name !== 'PHP') {
                    fileName = fileName.substr(fileName.indexOf('/') + 1)
                }

                // Skip configuration and ignored directories
                const isConfigFile = (fileName === service.config)
                const isIgnored = (isUpdate && (service.ignore && service.ignore.some(n => fileName.includes(n))))

                if (!isConfigFile && !isIgnored) {
                    const fileDestPath = path.join(servicePath, fileName)

                    if (entry.type === 'Directory' && !fs.existsSync(fileDestPath)) {
                        fs.mkdirSync(fileDestPath)
                    } else {
                        entry.pipe(fs.createWriteStream(fileDestPath))
                    }
                } else {
                    entry.autodrain()
                }
            })
            .on('error', err => {
                // Fallback to archives if PHP has a newer version
                if (service.name === 'PHP' && err.message.includes('invalid signature')) {
                    service.url = service.url.replace('releases/', 'releases/archives/')

                    return download(service, isUpdate)
                        .then(resolve)
                        .then(reject)
                }

                reject(err)
            })
            .on('finish', () => {
                settings.setSync(serviceName, service.version)
                resolve()
            })
    })
}
