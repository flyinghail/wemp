import fs from "fs";
import fetch from "node-fetch";
import path from "path";
import Process from "../utils/process";

export abstract class BaseService {
    public process?: Process;
    protected readonly basePath: string;
    protected readonly servicePath: string;
    protected readonly serviceName: string;
    protected readonly configFile: string;

    constructor(basePath: string, service: ServiceConfig) {
        this.basePath = basePath;
        this.configFile = service.config;
        this.serviceName = service.name.toLowerCase();
        this.servicePath = path.join(basePath, this.serviceName);
    }

    async install(): Promise<void> {
        // Download the stub configuration file from GitHub
        const response = await fetch(`https://github.com/flyinghail/wemp/raw/main/stubs/${this.serviceName}/${this.configFile}`)
        const body = await response.text()

        // Replace the placeholder for the services path
        const content = body
            .replace(/{basePath}/g, this.basePath)
            .replace(/{servicePath}/g, this.servicePath)

        fs.writeFileSync(path.join(this.servicePath, this.configFile), content)
    }

    abstract start(): Promise<void>;

    async run(cmd: string, args: string[] = [], restartOnExit: boolean = false): Promise<void> {
        const parts = cmd.split('/');
        const command = parts.pop();

        this.process = new Process(`${command}`, args, {
            cwd: path.join(this.servicePath, ...parts)
        });
        await this.process.run();
    }

    async stop(): Promise<void> {
        await this.process?.kill()
    }
}