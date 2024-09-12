# Complete Guide: Cross-Chain Token Transfers Using LayerZero's OFT Adapter (Sepolia to Core Testnet)

## Introduction
This guide walks you through deploying and configuring an OFT Adapter to transfer an existing ERC-20 token between the Sepolia Testnet and Core Testnet using LayerZero's messaging protocol. You will learn how to set up your development environment with Hardhat, configure LayerZero endpoints, and execute cross-chain token transfers using the OFT Adapter.

By the end of this guide, you'll be able to:

- Set up and configure Hardhat for cross-chain deployments.
- Deploy an OFT Adapter to interact with an existing token.
- Set up LayerZero endpoints and configure peers.
- Execute cross-chain transfers of tokens between Sepolia and Core Testnet.

This guide is structured for beginners, with detailed explanations on when and how to use various tools and commands in the terminal and VSCode. If you're unfamiliar with any step, we have clearly marked success criteria to ensure you're on track.

## Table of Contents
1. Prerequisites
2. Install Node.js, npm, and Hardhat
3. Set Up Hardhat Project
4. Install Project Dependencies
5. Configure Hardhat for Sepolia and Core Testnet
6. Configure Infura for Ethereum Sepolia
7. Create the OFT Contract
8. Write Deployment Scripts
9. Deploy Contracts to Sepolia and Core Testnet
10. Set Cross-Chain Peers and Libraries
11. Set Gas and Message Execution Options for LayerZero
12. Test Cross-Chain Transfers
13. Conclusion

## 1. Prerequisites
Before we begin, ensure you have the following:

- [VSCode installed](https://code.visualstudio.com/) for editing and running your code.
- Node.js and npm installed. You can download Node.js (which includes npm) from Node.js website.
- Infura Account: Sign Up here (for Sepolia access)
- Metamask Wallet: [Install Metamask here](https://metamask.io/)
- A wallet address with test ETH on Sepolia for contract deployment and test transactions. You can get test ETH from a Sepolia faucet [(Chainlink Faucet)](https://faucets.chain.link/sepolia).
- Core Testnet Funds: To deploy contracts on the Core Testnet, you need Core testnet tokens. You can get these from the [Core Faucet](https://scan.test.btcs.network/faucet).

>Note: You must have test funds on both Sepolia and Core Testnet to complete this guide successfully.


## 2. Install Node.js, npm, and Hardhat

### 2.1 Install Node.js and npm

Ensure you have **Node.js** and npm installed by running the following:

```zsh
node -v
npm -v
```

If you haven't installed Node.js and npm already, follow these instructions to install them:

1. Download and install Node.js from the [Node.js website](https://nodejs.org/en).

2. After installation, verify that Node.js and npm are installed by running the following commands in your terminal:

```zsh
node -v
npm -v
```
You should see the installed versions of Node.js and npm.

### 2.2 Install Hardhat 

Install **Hardhat** with:

```zsh
npm install --save-dev hardhat
```

## 3. Set Up Hardhat Project

### 3.1 Create Project Directory

Create a project directory and initialize the project:

```zsh
mkdir oft-v2-project
cd oft-v2-project
npm init -y
```

### 3.2 Initialize Hardhat
Initialize **Hardhat** in the project:

```zsh
npx hardhat
```

Choose Create an empty **hardhat.config.js**.

## 4. Install Project Dependencies

Install LayerZero dependencies, **OpenZeppelin** contracts, and **ethers.js** for blockchain interaction:

```zsh
npm install @layerzerolabs/oft-evm @openzeppelin/contracts @nomiclabs/hardhat-ethers ethers
```

## 5. Configure Hardhat for Sepolia and Core Testnet

### 5.1 Get Infura API Key

- Sign up at Infura and create a project.
- Copy your **Infura Project ID**.

### 5.2 Store Private Key and Infura API Key

Create a `secret.json` file to securely store your private key and Infura API key:

```json
{
  "privateKey": "your_private_key_here",
  "infuraApiKey": "<your-infura-api-key>"
}
```

### 5.3 Configure hardhat.config.js

Edit `hardhat.config.js` to configure Sepolia and Core Testnet networks:

```javascript
require('@nomiclabs/hardhat-ethers');
require('@nomiclabs/hardhat-waffle');
const fs = require('fs');

const { privateKey, infuraApiKey } = JSON.parse(fs.readFileSync('./secret.json'));

module.exports = {
  defaultNetwork: 'testnet',

  networks: {
    hardhat: {},

    testnet: {
      url: 'https://rpc.test.btcs.network',
      accounts: [privateKey],
      chainId: 1115,  // Core Testnet chain ID
    },

    sepolia: {
      url: `https://sepolia.infura.io/v3/${infuraApiKey}`,
      accounts: [privateKey],
      chainId: 11155111,  // Sepolia Testnet chain ID
    },
  },

  solidity: {
    compilers: [
      {
        version: '0.8.9',
        settings: {
          evmVersion: 'paris',
          optimizer: {
            enabled: true,
            runs: 200,
          },
        },
      },
    ],
  },
};
```

## 6. Configure Infura for Ethereum Sepolia

Infura is essential for connecting to the Sepolia Testnet. Here’s how to set it up:

### 6.1 Create an Infura Account and Project

1. Sign up or log in to [Infura](https://www.infura.io/).

2. In the dashboard, click **Create New Project**.

3. Name your project (e.g., "**LayerZero Sepolia**") and click **Create**.

### 6.2 Configure Sepolia in Infura

1. Go to your project settings.

2. Under Endpoints, select Ethereum and choose Sepolia as the network.

3. Copy the Sepolia RPC URL, which will look like this:

```arduino
https://sepolia.infura.io/v3/<your-project-id>
```

4. Add this **Infura Project ID** (API key) to your `secret.json`:

5. Ensure your **Hardhat** configuration in `hardhat.config.js` uses the correct **Sepolia** endpoint from Infura.

## 7. Create the OFT Contract

### 7.1 Create the `contracts` Folder

Create a folder for the contract:

```zsh
mkdir contracts
```
### 7.2 Write the OFT Contract

Inside the `contracts` folder, create `MyOFT.sol`:

```solidity
// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.22;

import { Ownable } from "@openzeppelin/contracts/access/Ownable.sol";
import { OFT } from "@layerzerolabs/oft-evm/contracts/OFT.sol";

contract MyOFT is OFT, Ownable {
    constructor(
        string memory _name,
        string memory _symbol,
        address _lzEndpoint,
        address _delegate
    ) OFT(_name, _symbol, _lzEndpoint, _delegate) Ownable(_delegate) {}
}
```
## 8. Write Deployment Scripts

### 8.1 Create `scripts` Folder

Create a folder for the deployment script:

```zsh
mkdir scripts
```
### 8.2 Create `deploy.js`

Inside `scripts`, create `deploy.js`:

```javascript
const { ethers } = require("hardhat");

async function main() {
    const [deployer] = await ethers.getSigners();
    const lzEndpoint = "0x6EDCE65403992e310A62460808c4b910D972f10f";  // Sepolia LayerZero Endpoint
    const delegate = deployer.address;

    console.log("Deploying contract with the account:", deployer.address);

    const OFT = await ethers.getContractFactory("MyOFT");
    const oft = await OFT.deploy("MyToken", "MTK", lzEndpoint, delegate);

    console.log("OFT deployed to:", oft.address);
}

main().catch((error) => {
    console.error(error);
    process.exit(1);
});
```
## 9. Deploy Contracts to Sepolia and Core Testnet

### 9.1 Deploy to Sepolia

Deploy the contract to Sepolia:

```zsh
npx hardhat run scripts/deploy.js --network sepolia
```

### 9.2 Deploy to Core Testnet

Deploy the contract to Core Testnet:

```zsh
npx hardhat run scripts/deploy.js --network testnet
```

## 10. Set Cross-Chain Peers and Libraries

### 10.1 What Is a Peer in LayerZero?

A **peer** in LayerZero is the contract address on the destination chain that will receive cross-chain messages. You need to connect each contract on both chains by setting each contract as a trusted peer on the other chain.

### 10.2 Set Peers Between Sepolia and Core Testnet

Get the contract addresses of the deployed **OFT contracts** on both **Sepolia** and **Core Testnet**. Then set the peers using LayerZero Endpoint IDs.

```solidity
uint32 sepoliaEid = 11155111;  // Sepolia Testnet Endpoint ID
uint32 coreEid = 40153;        // Core Testnet Endpoint ID

MyOFT sepoliaOFT;  // Deployed OFT contract on Sepolia
MyOFT coreOFT;     // Deployed OFT contract on Core Testnet

// Set Core Testnet contract as the trusted peer on Sepolia
sepoliaOFT.setPeer(coreEid, addressToBytes32(address(coreOFT)));

// Set Sepolia contract as the trusted peer on Core Testnet
coreOFT.setPeer(sepoliaEid, addressToBytes32(address(sepoliaOFT)));
```

### 10.3 Set Send and Receive Libraries

Set the **SendUln** and **ReceiveUln** libraries for LayerZero on both chains:

```solidity
// Set Send and Receive libraries on Core Testnet
EndpointV2.setSendLibrary(coreOFT, sepoliaEid, "0xc8361Fac616435eB86B9F6e2faaff38F38B0d68C");  // Core Testnet SendUln302
EndpointV2.setReceiveLibrary(coreOFT, sepoliaEid, "0xc8361Fac616435eB86B9F6e2faaff38F38B0d68C", 10);  // Core Testnet ReceiveUln302

// Set Send and Receive libraries on Sepolia
EndpointV2.setSendLibrary(sepoliaOFT, coreEid, "0xcc1ae8Cf5D3904Cef3360A9532B477529b177cCE");  // Sepolia SendUln302
EndpointV2.setReceiveLibrary(sepoliaOFT, coreEid, "0xdAf00F5eE2158dD58E0d3857851c432E34A3A851", 10);  // Sepolia ReceiveUln302
```

### 10.4 Set the Executor

The **LayerZero Executor** is responsible for executing the logic associated with the received cross-chain message on the destination chain.

```solidity
// Set LayerZero Executor for Core Testnet
EndpointV2.setDelegate(coreOFT, "0x3Bdb89Df44e50748fAed8cf851eB25bf95f37d19");  // Core Testnet Executor

// Set LayerZero Executor for Sepolia
EndpointV2.setDelegate(sepoliaOFT, "0x718B92b5CB0a5552039B593faF724D182A881eDA");  // Sepolia Executor
```

## 11. Set Gas and Message Execution Options for LayerZero

### 11.1 Setting Enforced Options

Set mandatory gas and execution requirements to ensure cross-chain messages have enough gas to execute properly:

```solidity
EnforcedOptionParam[] memory enforcedOptions = new EnforcedOptionParam[](1);
enforcedOptions[0] = EnforcedOptionParam({
    eid: 40153,  // Core Testnet EID
    msgType: SEND,  // Message type for standard token transfer
    options: OptionsBuilder.newOptions().addExecutorLzReceiveOption(65000, 0)  // Set 65,000 gas
});

// Call setEnforcedOptions on the OFT contract on Sepolia
sepoliaOFT.setEnforcedOptions(enforcedOptions);
```

### 11.2 Setting Extra Options for Specific Calls

When sending a message, you can specify **extra options** for custom gas settings:

```javascript
let extraOptions = OptionsBuilder.newOptions().addExecutorLzReceiveOption(60000, 0).toBytes();

// Pass extra options when sending tokens
await oft.send({
    dstEid: 40153,  // Core Testnet EID
    to: addressToBytes32(recipient),
    amountLD: amountToSend,
    minAmountLD: minAmountToSend,
    extraOptions: extraOptions,
    composeMsg: ethers.utils.arrayify('0x'),  // No composed message
    oftCmd: ethers.utils.arrayify('0x'),  // No special OFT command
});
```

## 12. Test Cross-Chain Transfers

### 12.1 Initiate a Cross-Chain Transfer

Use the following Hardhat task to send tokens from **Sepolia** to **Core Testnet**:

```zsh
npx hardhat lz:oft:send --to 0xRecipientAddressOnCore --toEid 40153 --amount 100 --network sepolia
```

## 13. Conclusion

You have successfully deployed LayerZero’s V2 OFT.sol for cross-chain token transfers between Sepolia Testnet and Core Testnet. The contracts are connected via trusted peers, and gas settings are enforced to ensure smooth transaction execution across chains.

This guide ensures that your cross-chain token transfers are both secure and efficient. Let me know if you need further assistance!
