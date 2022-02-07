import { BaseService } from "./base-service";

export default class PhpMyAdminService extends BaseService implements Service {
    start(): Promise<void> {
        throw new Error('No need to start PhpMyAdmin service');
    }
}