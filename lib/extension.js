import { __decorate } from "tslib";
import { Bud } from '@roots/bud-framework';
import { DynamicOption, Extension } from "@roots/bud-framework/extension";
import { bind, label, expose, development, options } from '@roots/bud-framework/extension/decorators';
import { externalNetworkInterface } from '@roots/bud-support/os';
import { readFileSync } from 'node:fs';
import { MkCert } from './mkcert.js';
let BudMkcert = class BudMkcert extends Extension {
    async register(bud) {
        if (!bud.isDevelopment || !bud.server)
            return;
        try {
            const mkcert = new MkCert(bud, this.options);
            const certificates = await mkcert.obtain();
            bud.hooks.on('dev.url', function (url) {
                url.protocol = 'https:';
                return url;
            });
            bud.hooks.on('dev.options', function (opts) {
                opts.cert = readFileSync(certificates.crt);
                opts.key = readFileSync(certificates.key);
                return opts;
            });
        }
        catch (e) {
            this.catch(e);
        }
    }
};
__decorate([
    bind
], BudMkcert.prototype, "register", null);
BudMkcert = __decorate([
    label(`bud-mkcert`),
    expose(`mkcert`),
    options({
        ca_cert: false,
        hostnames: DynamicOption.make(bud => [bud.server?.url.hostname, externalNetworkInterface.ipv4Url(bud.server?.url.protocol).hostname]),
    }),
    development
], BudMkcert);
export default BudMkcert;
