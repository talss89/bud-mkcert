import type BudMkcert from './extension.js';
declare module '@roots/bud-framework' {
    interface Modules {
        'bud-mkcert': BudMkcert;
    }
    interface Bud {
        mkcert: BudMkcert;
    }
}
export type BudMkcertCAConfig = {
    key: string;
    crt: string;
};
export type BudMkcertCertificate = {
    key: string;
    crt: string;
};
export interface BudMkcertOptions {
    ca_cert: BudMkcertCAConfig | false;
    hostnames: string[];
}
