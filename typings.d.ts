import Process from "./src/utils/process";

declare global {
    export interface Service {
        process?: Process;

        install(): Promise<void>;

        start(): Promise<void>;

        stop(): Promise<void>
    }

    export interface ServiceConfig {
        name: string,
        version: string,
        config: string,
        ignore?: string[],
        interface?: boolean,
        url: string
    }
}