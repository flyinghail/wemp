import { BaseService } from "./base-service";

export default class NginxService extends BaseService implements Service {
    constructor(basePath: string, service: ServiceConfig) {
        super(basePath, service);
        this.name = 'Nginx';
    }

    start(): Promise<void> {
        return this.run('nginx.exe');
    }
}

