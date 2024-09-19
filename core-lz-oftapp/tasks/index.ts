import { task } from 'hardhat/config';

// Registering the lz:oft:send task
task("lz:oft:send", "Send tokens cross-chain using LayerZero technology", require("./lzOftSend"))
    .addParam("contractA", "Contract address on network A")
    .addParam("recipientB", "Recipient address on network B")
    .addParam("networkA", "Name of the network A")
    .addParam("networkB", "Name of the network B")
    .addParam("amount", "Amount to transfer in eth")
    .addParam("privateKey", "Private key of the sender");

// Registering the verifyContract task (renaming network to targetNetwork to avoid conflict)
task("verifyContract", "Verifies a deployed contract on Etherscan", require("./verifyContract"))
    .addParam("contractAddress", "The contract address to verify")
    .addParam("targetNetwork", "Network where the contract is deployed")  // Renamed to targetNetwork
    .addParam("constructorArguments", "The constructor arguments used during deployment");
