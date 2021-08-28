import { ChildProcess, exec } from 'child_process'
import path from 'path'

import config from '../config'

/**
 * The absolute path to the service.
 */
const servicePath: string = path.join(config.paths.services, 'mariadb', 'bin')

/**
 * The child process of the service.
 */
let process: ChildProcess

/**
 * MariaDB needs to be installed before the first start.
 *
 * @returns {Promise}
 */
export function install(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
        exec('mysql_install_db.exe', { cwd: servicePath }, error => {
            if (error) return reject(error)
            resolve()
        })
    })
}

/**
 * Start the service.
 *
 * @returns {Promise}
 */
export function start(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
        process = exec('mariadbd.exe', { cwd: servicePath }, error => {
            if (error && !error.killed) return reject(error)
            resolve()
        })
    })
}

/**
 * Stop the service.
 * @returns {Promise}
 */
export function stop(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
        process.kill()

        exec('taskkill /IM "mariadbd.exe" /F', error => {
            if (error) return reject(error)
            resolve()
        })
    })
}
