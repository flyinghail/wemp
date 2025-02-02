<p align="center">
<a href="https://github.com/flyinghail/wemp/releases"><img src="https://img.shields.io/github/downloads/flyinghail/wemp/total.svg?style=flat-square" alt="Total Downloads"></a>
<a href="https://github.com/flyinghail/wemp/releases/latest"><img src="https://img.shields.io/github/v/release/flyinghail/wemp.svg?style=flat-square" alt="Latest Stable Version"></a>
<a href="https://github.com/flyinghail/wemp/issues"><img src="https://img.shields.io/github/issues/flyinghail/wemp.svg?style=flat-square" alt="GitHub Issues"></a>
<a href="LICENSE"><img src="https://img.shields.io/github/license/flyinghail/wemp.svg?style=flat-square" alt="License"></a>
</p>

## Introduction

Wemp is a simple menu for managing [Nginx](https://nginx.org), [MySQL](https://mysql.com) and [PHP](https://php.net) on Windows.

The aim of this project is to always provide the latest version of these services without having to update them manually.

Forked from [electronfriends/wemp](https://github.com/electronfriends/wemp)

## Features

- **Easy to use** for both beginners and experienced.

- **Regular updates** to always support the latest versions.

- **Database management** powered by [phpMyAdmin](https://www.phpmyadmin.net).

- **Error logging** in a separate log file so you can quickly locate errors.

- **Monitoring** of configuration files to restart the services automatically.

## Installation

1. Download and run the latest Wemp setup from the [Releases](https://github.com/flyinghail/wemp/releases/latest) page.

2. Choose the installation path for the services (the default is `C:\Wemp`).

3. Once everything is downloaded, you will be notified and the services will start automatically.

4. You can now get started at http://localhost and set up your database at http://localhost/phpmyadmin.

If you need help with something, [create a new issue](https://github.com/flyinghail/wemp/issues/new) and we'll be happy to help.

## FAQs

### Will the services be deleted if I uninstall Wemp?

No. The services are installed independently of Wemp and remain untouched when Wemp is uninstalled.

## Thanks to

- [ElectronFriends](https://github.com/electronfriends) has created excellent app [Wemp](https://github.com/electronfriends/wemp)
 
- [Electron](https://www.electronjs.org) for the tools to create a Windows application with JavaScript.

- [Nginx](https://nginx.org), [MySQL](https://mysql.com), [PHP](https://php.net) and [phpMyAdmin](https://www.phpmyadmin.net) for providing their services.

- [Icons8.com](https://icons8.com) for the free [Fluency](https://icons8.com/icon/set/logs/fluency) icons that we use in our menu.

- all other dependencies we use to make Wemp work.

## Contributing

Thank you for your interest in contributing to Wemp. If you found a bug or have a suggestion, please let us know by [creating a new issue](https://github.com/flyinghail/wemp/issues/new).

We also welcome pull requests.

## License

Wemp is open-source software licensed under the [MIT License](LICENSE).
