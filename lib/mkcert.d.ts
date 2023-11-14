import { Bud } from '@roots/bud-framework';
import type { BudMkcertOptions, BudMkcertCertificate } from './types.js';
export declare class MkCert {
    #private;
    constructor(bud: Bud, options: BudMkcertOptions);
    obtain(): Promise<BudMkcertCertificate>;
    private getCaPath;
    private hasCertificates;
    private generateCertificates;
}
