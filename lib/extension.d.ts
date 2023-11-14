/// <reference types="webpack" />
import { Bud } from '@roots/bud-framework';
import { Extension } from "@roots/bud-framework/extension";
import type { WebpackPluginInstance } from '@roots/bud-framework/config';
import type { BudMkcertCAConfig, BudMkcertOptions } from './types.js';
export default class BudMkcert extends Extension<BudMkcertOptions, WebpackPluginInstance> {
    ca_cert: BudMkcertCAConfig;
    getCaCert: () => BudMkcertCAConfig;
    setCaCert: (ca_cert: BudMkcertCAConfig) => BudMkcert;
    hostnames: string;
    getHostnames: () => string;
    setHostnames: (hostnames: string[]) => BudMkcert;
    register(bud: Bud): Promise<any>;
}
