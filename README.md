
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
2. Step 1: Install Node.js, npm, and Hardhat
3. Step 2: Set Up Hardhat Project
4. Step 3: Install Project Dependencies
5. Step 4: Configure Hardhat with Infura and RPC URLs
6. Step 5: Create the OFT Adapter Contract
7. Step 6: Write Deployment Scripts
8. Step 7: Deploy Contracts to Sepolia and Core Testnet
9. Step 8: Set Cross-Chain Peers
10. Step 9: Test Cross-Chain Transfers
11. Conclusion

## Prerequisites
Before we begin, ensure you have the following:

- VSCode installed for editing and running your code.
- Node.js and npm installed. You can download Node.js (which includes npm) from Node.js website.
- An Infura account for connecting to Sepolia, with your Project ID and Secret handy.
- A wallet address with test ETH on Sepolia for contract deployment and test transactions. You can get test ETH from a Sepolia faucet.
- Core Testnet Funds: To deploy contracts on the Core Testnet, you need Core testnet tokens. You can get these from the Core Faucet.

>Note: You must have test funds on both Sepolia and Core Testnet to complete this guide successfully.


## Step 1: Install Node.js, npm, and Hardhat
If you haven't installed Node.js and npm already, follow these instructions to install them:

1. Download and install Node.js from the [Node.js website](https://nodejs.org/en).

2. After installation, verify that Node.js and npm are installed by running the following commands in your terminal:

```zsh
node -v
npm -v
```
You should see the installed versions of Node.js and npm.

**1.1 Install Hardhat**
Next, we will install Hardhat to set up our development environment:

1. In your terminal, run the following commands to install Hardhat globally:

   ```zsh
   npm install --save-dev hardhat
   ```

## Step 2: Set Up Hardhat Project

Now let's create a new Hardhat project and initialize it:

1. Open **VSCode**.

2. Open the terminal in VSCode by selecting Terminal > New Terminal.

3. In the terminal, create a new project directory:

```zsh
mkdir oft-token-project
cd oft-token-project
```

4. Initialize a new Node.js project:

```zsh
npm init -y
```

5. Initialize a Hardhat project:

```zsh
npx hardhat
```

6. When prompted, select "Create an **empty hardhat.config.js**".

## Step 3: Install Project Dependencies

We need to install several packages to support smart contract development and LayerZero functionality.

1. Run the following command to install the required dependencies:

```zsh
npm install @layerzerolabs/oft-evm @openzeppelin/contracts @nomiclabs/hardhat-ethers ethers
```

This installs:

- LayerZero OFT Adapter and its dependencies.
- OpenZeppelin contracts for standardized ERC-20 tokens.
- Ethers.js and Hardhat-Ethers plugin for smart contract interaction.

 ## Step 4: Configure Hardhat with Infura and RPC URLs

Next, we need to configure Hardhat to connect to both the Sepolia Testnet and the Core Testnet.

**4.1 Create an Infura Account**
1. Go to Infura, sign up, and create a new project.
2. Take note of your Project ID and Project Secret.

**4.2 Store Private Key and Infura Credentials**
In the root of your project, create a file named `secret.json` and add your credentials:

```json
{
  "privateKey": "your_wallet_private_key",
  "infuraProjectId": "your_infura_project_id",
  "infuraProjectSecret": "your_infura_project_secret"
}
```
>Important: Keep your private key and secrets safe and never share them publicly.

*4.3 Configure* `hardhat.config.js`

1. Open the `hardhat.config.js` file and replace its content with the following:

```javascript
require("@nomiclabs/hardhat-ethers");
const fs = require("fs");

const secret = JSON.parse(fs.readFileSync("./secret.json"));

module.exports = {
  solidity: "0.8.22",
  networks: {
    sepolia: {
      url: `https://sepolia.infura.io/v3/${secret.infuraProjectId}`,
      accounts: [secret.privateKey],
      chainId: 11155111, // Sepolia Testnet
    },
    coreTestnet: {
      url: "https://rpc.test.btcs.network", // Core Testnet RPC URL
      accounts: [secret.privateKey],
      chainId: 1116, // Core Testnet Chain ID
    }
  }
};
```

## Step 5: Create the OFT Adapter Contract

Now let’s create the OFT Adapter contract. This contract will interact with an existing ERC-20 token and the LayerZero endpoint for cross-chain functionality.

1. In VSCode, create a folder called `contracts`.
2. Inside the `contracts` folder, create a file named `MyOFTAdapter.sol`:

```solidity
// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.22;

import { OFTAdapter } from "@layerzerolabs/oft-evm/contracts/OFTAdapter.sol";
import { Ownable } from "@openzeppelin/contracts/access/Ownable.sol";

/// @notice OFTAdapter uses an existing ERC-20 token and LayerZero endpoint for cross-chain functionality.
contract MyOFTAdapter is OFTAdapter {
    constructor(
        address _token,            // Address of the existing ERC-20 token
        address _lzEndpoint,       // LayerZero endpoint address
        address _owner             // Owner's address
    ) OFTAdapter(_token, _lzEndpoint) Ownable(_owner) {}
}
```

## Step 6: Write Deployment Scripts

We will create deployment scripts for both Sepolia and Core Testnet to deploy the OFT Adapter.

**6.1 Deploy to Sepolia**

1. In **VSCode**, create a folder named `scripts`.
2. Inside the `scripts` folder, create a file named `deploy-oft-sepolia.js`:

```javascript
const { ethers } = require("hardhat");

async function main() {
    const [deployer] = await ethers.getSigners();
    console.log("Deploying contracts with the account:", deployer.address);

    const tokenAddress = "0xYourERC20TokenAddress"; // ERC-20 token address on Sepolia
    const lzEndpoint = "0xYourLayerZeroEndpoint";   // Sepolia LayerZero endpoint

    const OFTAdapter = await ethers.getContractFactory("MyOFTAdapter");
    const oftAdapter = await OFTAdapter.deploy(tokenAddress, lzEndpoint, deployer.address);

    console.log("OFT Adapter deployed to:", oftAdapter.address);
}

main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });
```

**6.2 Deploy to Core Testnet**

1. In the `scripts` folder, create a new file named `deploy-oft-core.js`:

```javascript
const { ethers } = require("hardhat");

async function main() {
    const [deployer] = await ethers.getSigners();
    console.log("Deploying contracts with the account:", deployer.address);

    const tokenAddress = "0xYourERC20TokenAddress"; // ERC-20 token address on Core Testnet
    const lzEndpoint = "0xYourLayerZeroEndpoint";   // Core Testnet LayerZero endpoint

    const OFTAdapter = await ethers.getContractFactory("MyOFTAdapter");
    const oftAdapter = await OFTAdapter.deploy(tokenAddress, lzEndpoint, deployer.address);

    console.log("OFT Adapter deployed to:", oftAdapter.address);
}

main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });
```

## Step 7: Deploy Contracts to Sepolia and Core Testnet

Now, let’s deploy the OFT Adapter to both Sepolia and Core Testnet.

### 7.1 Deploy to Sepolia

1. Run the following command to deploy to Sepolia:

```zsh
npx hardhat run scripts/deploy-oft-sepolia.js --network sepolia
```

### 7.2 Deploy to Core Testnet

1. Run the following command to deploy to Core Testnet:

```zsh
npx hardhat run scripts/deploy-oft-core.js --network testnet
```

## Step 8: Set Cross-Chain Peers

Once the contracts are deployed on both Sepolia and Core Testnet, you need to link the two contracts by setting peers on both chains.

```javascript
await oftAdapter.setPeer(coreTestnetChainId, ethers.utils.addressToBytes32(coreOFTAdapterAddress));
```

2. Similarly, modify the deploy-oft-core.js to set the peer on the Core Testnet side:

```javascript
await oftAdapter.setPeer(sepoliaChainId, ethers.utils.addressToBytes32(sepoliaOFTAdapterAddress));
```

This ensures that both contracts are aware of each other and can communicate during cross-chain transfers.

## Step 9: Test Cross-Chain Transfers

After successfully deploying and configuring peers, you can start testing cross-chain token transfers using LayerZero’s OFT Adapter.

1. Call the `send` function from the Sepolia contract to transfer tokens to Core Testnet.
2. Verify that the transfer is successful and the balance on the Core Testnet contract is updated.

## Conclusion

Congratulations! You have successfully deployed and configured a LayerZero OFT Adapter to transfer tokens between Sepolia Testnet and Core Testnet. By following these steps, you should have a solid foundation for working with LayerZero's cross-chain messaging protocol and transferring tokens between different blockchains.

If you have encountered any issues or need further clarification, feel free to review the relevant sections or check the LayerZero documentation for more details.
