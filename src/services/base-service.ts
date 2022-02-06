import fs from "fs";
import fetch from "node-fetch";
import path from "path";
import Process from "../utils/process";

export abstract class BaseService {
    public process?: Process;
    protected readonly path: string;
    protected readonly config: ServiceConfig;

    constructor(path: string, config: ServiceConfig) {
        this.path = path;
        this.config = config;
    }

    async install(): Promise<void> {
        const { name, config } = this.config;
        const serviceName = name.toLowerCase()

        // Download the stub configuration file from GitHub
        const response = await fetch(`https://github.com/flyinghail/wemp/raw/main/stubs/${serviceName}/${config}`)
        const body = await response.text()

        // Replace the placeholder for the services path
        const content = body.replace('{servicesPath}', this.path)

        fs.writeFileSync(path.join(this.path, config), content)
    }

    abstract start(): Promise<void>;

    async run(cmd: string, args: string[] = [], restartOnExit: boolean = false): Promise<void> {
        const parts = cmd.split('/');
        const command = parts.pop();

        this.process = new Process(`${command}`, args, {
            cwd: path.join(this.path, ...parts)
        });
        await this.process.run();
    }

    async stop(): Promise<void> {
        await this.process?.kill()
    }
}