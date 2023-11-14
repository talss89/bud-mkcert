import { promisify } from 'node:util';
import { exec } from 'node:child_process';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'path';
import { Bud } from '@roots/bud-framework';
import { createCert } from "mkcert";
const execa = promisify(exec);
export class MkCert {
    #options;
    #certificate;
    constructor(bud, options) {
        this.#options = options;
        this.#certificate = {
            key: bud.path('@storage/bud-mkcert-hmr.key'),
            crt: bud.path('@storage/bud-mkcert-hmr.crt'),
        };
    }
    async obtain() {
        if (this.#options.ca_cert === false) {
            // Try to obtain CA details from `mkcert -CAROOT`. Will return false on failure.
            this.#options.ca_cert = await this.getCaPath();
            if (this.#options.ca_cert === false) {
                /*
                 *  We couldn't use `mkcert -CAROOT`. Let's bail out for now.
                 *  TODO: Generate a new CA. Need to discuss where this would be saved, and how we inform the user of its location.
                 */
                throw new Error('Unable to obtain CA certificate details from `mkcert -CAROOT`. Either install it (https://github.com/FiloSottile/mkcert), or specify CA certificates via bud.setCaCert().');
            }
        }
        if (await this.hasCertificates()) {
            return this.#certificate;
        }
        await this.generateCertificates();
        return this.#certificate;
    }
    async getCaPath() {
        try {
            /*
             * This needs a bit of explanation:
             *
             * The NPM package, `mkcert` is used for generating certificates.
             * The system package `mkcert` is different, and is installed to PATH, it handles registering CAs.
             *
             * Unfortunately, the NPM mkcert package installs a bin-link to `mkcert`, meaning if we exec `mkcert` from within node, we always run the NPM package.
             *
             * The code below removes any node_modules references from a copy of PATH, and we pass PATH to the exec call, meaning we end up running the system `mkcert` binary as intended.
             */
            var pathEnv = process.env.PATH;
            pathEnv = pathEnv.split(':').filter((p) => p.indexOf('node_modules') === -1).join(':');
            const output = await execa(`PATH=${pathEnv} mkcert -CAROOT`);
            const caPath = output.stdout.trim();
            if (existsSync(caPath) &&
                existsSync(path.join(caPath, 'rootCA-key.pem')) &&
                existsSync(path.join(caPath, 'rootCA.pem')))
                return {
                    key: path.join(caPath, 'rootCA-key.pem'),
                    crt: path.join(caPath, 'rootCA.pem')
                };
        }
        catch (e) {
            return false;
        }
        return false;
    }
    async hasCertificates() {
        return existsSync(this.#certificate.key) && existsSync(this.#certificate.crt);
    }
    async generateCertificates() {
        if (this.#options.ca_cert === false) {
            throw new Error('Unable to generate certificates - CA not valid.');
        }
        const cert = await createCert({
            ca: { key: readFileSync(this.#options.ca_cert.key).toString(), cert: readFileSync(this.#options.ca_cert.crt).toString() },
            domains: this.#options.hostnames,
            validity: 365
        });
        writeFileSync(this.#certificate.key, cert.key);
        writeFileSync(this.#certificate.crt, cert.cert + readFileSync(this.#options.ca_cert.crt).toString());
    }
}
