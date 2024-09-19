"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const ethers_1 = require("ethers");
const hardhat_1 = require("hardhat");
const lz_v2_utilities_1 = require("@layerzerolabs/lz-v2-utilities");
describe('MyOFT Test', function () {
    // Constant representing a mock Endpoint ID for testing purposes
    const eidA = 1;
    const eidB = 2;
    // Declaration of variables to be used in the test suite
    let MyOFT;
    let EndpointV2Mock;
    let ownerA;
    let ownerB;
    let endpointOwner;
    let myOFTA;
    let myOFTB;
    let mockEndpointV2A;
    let mockEndpointV2B;
    // Before hook for setup that runs once before all tests in the block
    before(async function () {
        // Contract factory for our tested contract
        //
        // We are using a derived contract that exposes a mint() function for testing purposes
        MyOFT = await hardhat_1.ethers.getContractFactory('MyOFTMock');
        // Fetching the first three signers (accounts) from Hardhat's local Ethereum network
        const signers = await hardhat_1.ethers.getSigners();
        ownerA = signers.at(0);
        ownerB = signers.at(1);
        endpointOwner = signers.at(2);
        // The EndpointV2Mock contract comes from @layerzerolabs/test-devtools-evm-hardhat package
        // and its artifacts are connected as external artifacts to this project
        //
        // Unfortunately, hardhat itself does not yet provide a way of connecting external artifacts,
        // so we rely on hardhat-deploy to create a ContractFactory for EndpointV2Mock
        //
        // See https://github.com/NomicFoundation/hardhat/issues/1040
        const EndpointV2MockArtifact = await hardhat_1.deployments.getArtifact('EndpointV2Mock');
        EndpointV2Mock = new ethers_1.ContractFactory(EndpointV2MockArtifact.abi, EndpointV2MockArtifact.bytecode, endpointOwner);
    });
    // beforeEach hook for setup that runs before each test in the block
    beforeEach(async function () {
        // Deploying a mock LZEndpoint with the given Endpoint ID
        mockEndpointV2A = await EndpointV2Mock.deploy(eidA);
        mockEndpointV2B = await EndpointV2Mock.deploy(eidB);
        // Deploying two instances of MyOFT contract with different identifiers and linking them to the mock LZEndpoint
        myOFTA = await MyOFT.deploy('aOFT', 'aOFT', mockEndpointV2A.address, ownerA.address);
        myOFTB = await MyOFT.deploy('bOFT', 'bOFT', mockEndpointV2B.address, ownerB.address);
        // Setting destination endpoints in the LZEndpoint mock for each MyOFT instance
        await mockEndpointV2A.setDestLzEndpoint(myOFTB.address, mockEndpointV2B.address);
        await mockEndpointV2B.setDestLzEndpoint(myOFTA.address, mockEndpointV2A.address);
        // Setting each MyOFT instance as a peer of the other in the mock LZEndpoint
        await myOFTA.connect(ownerA).setPeer(eidB, hardhat_1.ethers.utils.zeroPad(myOFTB.address, 32));
        await myOFTB.connect(ownerB).setPeer(eidA, hardhat_1.ethers.utils.zeroPad(myOFTA.address, 32));
    });
    // A test case to verify token transfer functionality
    it('should send a token from A address to B address via each OFT', async function () {
        // Minting an initial amount of tokens to ownerA's address in the myOFTA contract
        const initialAmount = hardhat_1.ethers.utils.parseEther('100');
        await myOFTA.mint(ownerA.address, initialAmount);
        // Defining the amount of tokens to send and constructing the parameters for the send operation
        const tokensToSend = hardhat_1.ethers.utils.parseEther('1');
        // Defining extra message execution options for the send operation
        const options = lz_v2_utilities_1.Options.newOptions().addExecutorLzReceiveOption(200000, 0).toHex().toString();
        const sendParam = [
            eidB,
            hardhat_1.ethers.utils.zeroPad(ownerB.address, 32),
            tokensToSend,
            tokensToSend,
            options,
            '0x',
            '0x',
        ];
        // Fetching the native fee for the token send operation
        const [nativeFee] = await myOFTA.quoteSend(sendParam, false);
        // Executing the send operation from myOFTA contract
        await myOFTA.send(sendParam, [nativeFee, 0], ownerA.address, { value: nativeFee });
        // Fetching the final token balances of ownerA and ownerB
        const finalBalanceA = await myOFTA.balanceOf(ownerA.address);
        const finalBalanceB = await myOFTB.balanceOf(ownerB.address);
        // Asserting that the final balances are as expected after the send operation
        (0, chai_1.expect)(finalBalanceA).eql(initialAmount.sub(tokensToSend));
        (0, chai_1.expect)(finalBalanceB).eql(tokensToSend);
    });
});
