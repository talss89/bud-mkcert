import { promisify } from 'node:util';
import { exec } from 'node:child_process';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'path';

import {Bud} from '@roots/bud-framework'

import type { BudMkcertCAConfig, BudMkcertOptions, BudMkcertCertificate } from './types.js';

import { createCert } from "mkcert";

const execa = promisify(exec);

export class MkCert {

    #options: BudMkcertOptions;
    #certificate: BudMkcertCertificate;
    
    public constructor(bud: Bud, options: BudMkcertOptions) {
        this.#options = options;
        this.#certificate = {
            key: bud.path('@storage/bud-mkcert-hmr.key'),
            crt: bud.path('@storage/bud-mkcert-hmr.crt'),
        }
    }

    public async obtain(): Promise<BudMkcertCertificate> {
        if(this.#options.ca_cert === false) {

            // Try to obtain CA details from `mkcert -CAROOT`. Will return false on failure.

            this.#options.ca_cert = await this.getCaPath();     

            if(this.#options.ca_cert === false) {

                /*
                 *  We couldn't use `mkcert -CAROOT`. Let's bail out for now.
                 *  TODO: Generate a new CA. Need to discuss where this would be saved, and how we inform the user of its location.
                 */

                throw new Error('Unable to obtain CA certificate details from `mkcert -CAROOT`. Either install it (https://github.com/FiloSottile/mkcert), or specify CA certificates via bud.setCaCert().');
            }
        }

        if(await this.hasCertificates()) {
            return this.#certificate;
        }

        await this.generateCertificates();
        return this.#certificate;
    }

    private async getCaPath(): Promise<BudMkcertCAConfig | false> {
        try {
            const output = await execa('mkcert -CAROOT');
            const caPath = output.stdout.trim();

            if(
                existsSync(caPath) &&
                existsSync(path.join(caPath, 'rootCA-key.pem')) &&
                existsSync(path.join(caPath, 'rootCA.pem'))
            )
                return {
                    key: path.join(caPath, 'rootCA-key.pem'),
                    crt: path.join(caPath, 'rootCA.pem')
                };
    
    
        } catch (e) {
            return false;
        }
    
        return false;
    }

    private async hasCertificates() {
        return existsSync(this.#certificate.key) && existsSync(this.#certificate.crt);
    }

    private async generateCertificates() {

        if(this.#options.ca_cert === false) {
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