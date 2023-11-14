import {Bud} from '@roots/bud-framework'
import { DynamicOption, Extension } from "@roots/bud-framework/extension";
import type {WebpackPluginInstance} from '@roots/bud-framework/config'
import {bind, label, expose, development, options} from '@roots/bud-framework/extension/decorators'
import {externalNetworkInterface} from '@roots/bud-support/os'

import type { BudMkcertCAConfig, BudMkcertOptions } from './types.js';
import { readFileSync } from 'node:fs';

import { MkCert } from './mkcert.js';

@label(`bud-mkcert`)
@expose(`mkcert`)
@options<BudMkcertOptions>({
  ca_cert: false,
  hostnames: DynamicOption.make(bud => [bud.server?.url.hostname, externalNetworkInterface.ipv4Url(bud.server?.url.protocol).hostname]),
}) 
@development

export default class BudMkcert extends Extension<
  BudMkcertOptions,
  WebpackPluginInstance
> { 

  public declare ca_cert: BudMkcertCAConfig;
  public declare getCaCert: () => BudMkcertCAConfig;
  public declare setCaCert: (ca_cert: BudMkcertCAConfig) => BudMkcert;

  public declare hostnames: string;
  public declare getHostnames: () => string;
  public declare setHostnames: (hostnames: string[]) => BudMkcert;

  @bind
  public override async register(bud: Bud): Promise<any> {

    if(!bud.isDevelopment || !bud.server)
      return;
    
    try {
      const mkcert = new MkCert(bud, this.options);
      const certificates = await mkcert.obtain();

      bud.hooks.on('dev.url', function(url) {
        url.protocol = 'https:';
        return url;
      });

      bud.hooks.on('dev.options', function(opts) {
      
        opts.cert = readFileSync(certificates.crt);
        opts.key = readFileSync(certificates.key);

        return opts;
      })

    } catch (e) {
      this.catch(e);
    }

    
  }
}
