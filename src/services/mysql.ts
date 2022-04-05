import { exec } from 'child_process'
import path from 'path'
import { promisify } from 'util'
import { BaseService } from "./base-service";

const execAsync = promisify(exec);

export default class MySQLService extends BaseService implements Service {
    constructor(basePath: string, service: ServiceConfig) {
        super(basePath, service);
        this.name = 'MySQL';
    }

    async install(): Promise<void> {
        await super.install();
        await execAsync('mysqld.exe --initialize-insecure', {
            cwd: path.join(this.servicePath, 'bin')
        });
    }

    start(): Promise<void> {
        return this.run('bin/mysqld.exe');
    }
}