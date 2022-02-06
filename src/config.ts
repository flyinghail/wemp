import { app } from 'electron'
import settings from 'electron-settings'
import path from 'path'

/**
 * This is the configuration of Wemp, which includes all services and paths.
 * When a new version of a service is released, it must be updated here.
 */
export default {
    paths: {
        icons: path.join(app.getAppPath(), 'icons'),
        logs: path.join(app.getPath('userData'), 'error.log'),
        services: settings.getSync('path')?.toString() || 'C:\\wemp'
    },
    services: [
        {
            name: 'Nginx',
            version: '1.21.6',
            config: 'conf/nginx.conf',
            ignore: ['conf/', 'html/', 'logs/'],
            url: 'https://nginx.org/download/nginx-{version}.zip'
        },
        {
            name: 'MySQL8',
            version: '8.0.28',
            config: 'my.ini',
            url: 'https://dev.mysql.com/get/Downloads/MySQL-8.0/mysql-{version}-winx64.zip'
        },
        {
            name: 'PHP',
            version: '8.1.2',
            config: 'php.ini',
            ignore: ['extras/'],
            url: 'https://windows.php.net/downloads/releases/php-{version}-nts-Win32-vs16-x64.zip'
        },
        {
            name: 'phpMyAdmin',
            version: '5.1.2',
            config: 'config.inc.php',
            interface: true,
            url: 'https://files.phpmyadmin.net/phpMyAdmin/{version}/phpMyAdmin-{version}-all-languages.zip'
        }
    ]
}
