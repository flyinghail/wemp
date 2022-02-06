import { BaseService } from "./base-service";

export default class NginxService extends BaseService implements Service {
    start(): Promise<void> {
        return this.run('php-cgi.exe', ['-b', '127.0.0.1:9000'], true);
    }
}