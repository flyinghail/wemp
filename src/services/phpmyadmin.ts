import { BaseService } from "./base-service";

export default class PhpMyAdminService extends BaseService implements Service {
    constructor(basePath: string, service: ServiceConfig) {
        super(basePath, service);
        this.name = 'phpMyAdmin';
    }

    start(): Promise<void> {
        throw new Error('No need to start PhpMyAdmin service');
    }
}