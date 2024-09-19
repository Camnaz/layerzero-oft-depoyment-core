import { EndpointId } from '@layerzerolabs/lz-definitions'

import type { OAppOmniGraphHardhat, OmniPointHardhat } from '@layerzerolabs/toolbox-hardhat'

const sepoliaContract: OmniPointHardhat = {
    eid: EndpointId.SEPOLIA_V2_TESTNET,
    contractName: 'MyOFT',
}

const coreContract: OmniPointHardhat = {
    eid: EndpointId.COREDAO_V2_TESTNET,
    contractName: 'MyOFT',
}

const config: OAppOmniGraphHardhat = {
    contracts: [
        {
            contract: coreContract,
        },
        {
            contract: sepoliaContract,
        },
    ],
    connections: [
        {
            from: coreContract,
            to: sepoliaContract,
        },
        {
            from: sepoliaContract,
            to: coreContract,
        },
    ],
}

export default config
