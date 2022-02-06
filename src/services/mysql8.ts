import { exec } from 'child_process'
import path from 'path'
import { promisify } from 'util'
import { BaseService } from "./base-service";

const execAsync = promisify(exec);

export default class MySQL8Service extends BaseService implements Service {
    async install(): Promise<void> {
        await super.install();
        await execAsync('mysqld.exe --initialize-insecure', {
            cwd: path.join(this.path, 'bin')
        });
    }

    start(): Promise<void> {
        return this.run('bin/mysqld.exe');
    }
}