import { EndpointId } from '@layerzerolabs/lz-definitions'

// Define ExecutorOptionType manually
enum ExecutorOptionType {
  LZ_RECEIVE = 1,
  COMPOSE = 2,
}

// Define the contract configurations with the addresses you provided
const contractsConfig = {
  sepolia: {
    sendLib302: '0xcc1ae8Cf5D3904Cef3360A9532B477529b177cCE',  // Sepolia SendUln302
    receiveLib302: '0xdAf00F5eE2158dD58E0d3857851c432E34A3A851',  // Sepolia ReceiveUln302
    executor: '0x718B92b5CB0a5552039B593faF724D182A881eDA',  // Sepolia LZ Executor
    lzDVN: '0x8eebf8b423b73bfca51a1db4b7354aa0bfca9193',  // DVN for Sepolia Testnet
  },
  core: {
    sendLib302: '0x0BcAC336466ef7F1e0b5c184aAB2867C108331aF',  // Core Testnet SendUln302
    receiveLib302: '0x8F76bAcC52b5730c1f1A2413B8936D4df12aF4f6',  // Core Testnet ReceiveUln302
    executor: '0x3Bdb89Df44e50748fAed8cf851eB25bf95f37d19',  // Core Testnet LZ Executor
    lzDVN: '0xae9bbf877bf1bd41edd5dfc3473d263171cf3b9e',  // DVN for Core Testnet
    endpointV2: '0x6EDCE65403992e310A62460808c4b910D972f10f',  // Core Testnet EndpointV2
  },
}

// Define contracts for Sepolia and Core Testnet
const sepoliaContract = {
  eid: 40161,  // Correct EID for Sepolia Testnet
  contractName: 'CrossChainToken',  // Your contract name for Sepolia
}

const coreContract = {
  eid: 40153,  // Correct EID for CoreDAO Testnet
  contractName: 'CrossChainToken',  // Your contract name for Core Testnet
}

// Define the connections between Sepolia and Core
const config = {
  contracts: [
    {
      contract: sepoliaContract,
    },
    {
      contract: coreContract,
    },
  ],
  connections: [
    {
      from: sepoliaContract,
      to: coreContract,
      config: {
        sendLibrary: contractsConfig.sepolia.sendLib302,
        receiveLibraryConfig: {
          receiveLibrary: contractsConfig.sepolia.receiveLib302,
          gracePeriod: BigInt(0),
        },
        receiveLibraryTimeoutConfig: {
          lib: '0x0000000000000000000000000000000000000000',
          expiry: BigInt(0),
        },
        sendConfig: {
          executorConfig: {
            maxMessageSize: 10000,
            executor: contractsConfig.sepolia.executor,
          },
          ulnConfig: {
            confirmations: BigInt(15),
            requiredDVNs: [contractsConfig.sepolia.lzDVN],  // Use DVN for Sepolia
            optionalDVNs: [],
            optionalDVNThreshold: 0,
          },
        },
        receiveConfig: {
          ulnConfig: {
            confirmations: BigInt(20),
            requiredDVNs: [contractsConfig.sepolia.lzDVN],  // Use DVN for Sepolia
            optionalDVNs: [],
            optionalDVNThreshold: 0,
          },
        },
        enforcedOptions: [
          {
            msgType: 1,
            optionType: ExecutorOptionType.LZ_RECEIVE,
            gas: 65000,
            value: 0,
          },
        ],
      },
    },
    {
      from: coreContract,
      to: sepoliaContract,
      config: {
        sendLibrary: contractsConfig.core.sendLib302,
        receiveLibraryConfig: {
          receiveLibrary: contractsConfig.core.receiveLib302,
          gracePeriod: BigInt(0),
        },
        receiveLibraryTimeoutConfig: {
          lib: '0x0000000000000000000000000000000000000000',
          expiry: BigInt(0),
        },
        sendConfig: {
          executorConfig: {
            maxMessageSize: 10000,
            executor: contractsConfig.core.executor,
          },
          ulnConfig: {
            confirmations: BigInt(15),
            requiredDVNs: [contractsConfig.core.lzDVN],  // Use DVN for Core
            optionalDVNs: [],
            optionalDVNThreshold: 0,
          },
        },
        receiveConfig: {
          ulnConfig: {
            confirmations: BigInt(20),
            requiredDVNs: [contractsConfig.core.lzDVN],  // Use DVN for Core
            optionalDVNs: [],
            optionalDVNThreshold: 0,
          },
        },
        enforcedOptions: [
          {
            msgType: 1,
            optionType: ExecutorOptionType.LZ_RECEIVE,
            gas: 65000,
            value: 0,
          },
        ],
      },
    },
  ],
}

export default config
