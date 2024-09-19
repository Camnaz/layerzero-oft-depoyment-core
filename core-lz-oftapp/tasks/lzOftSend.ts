import { ethers } from 'ethers'
import { HardhatRuntimeEnvironment, TaskArguments } from 'hardhat/types' // Consolidated import

import { createGetHreByEid, createProviderFactory, getEidForNetworkName } from '@layerzerolabs/devtools-evm-hardhat'
import { Options } from '@layerzerolabs/lz-v2-utilities'

interface LzOftSendArgs extends TaskArguments {
    contractA: string
    recipientB: string
    networkA: string
    networkB: string
    amount: string
    privateKey: string
}

module.exports = async (taskArgs: LzOftSendArgs, hre: HardhatRuntimeEnvironment) => {
    const eidA = getEidForNetworkName(taskArgs.networkA)
    const eidB = getEidForNetworkName(taskArgs.networkB)
    const contractA = taskArgs.contractA
    const recipientB = taskArgs.recipientB

    const environmentFactory = createGetHreByEid()
    const providerFactory = createProviderFactory(environmentFactory)
    const provider = await providerFactory(eidA)
    const wallet = new ethers.Wallet(taskArgs.privateKey, provider)

    const oftContractFactory = await hre.ethers.getContractFactory('MyOFT', wallet)
    const oft = oftContractFactory.attach(contractA)

    const decimals = await oft.decimals()
    const amount = hre.ethers.utils.parseUnits(taskArgs.amount, decimals)
    const options = Options.newOptions().addExecutorLzReceiveOption(200000, 0).toHex().toString()
    const recipientAddressBytes32 = hre.ethers.utils.hexZeroPad(recipientB, 32)

    // Estimate the fee
    const [nativeFee] = await oft.quoteSend([eidB, recipientAddressBytes32, amount, amount, options, '0x', '0x'], false)
    console.log('Estimated native fee:', nativeFee.toString())

    // Fetch the current gas price and nonce
    const gasPrice = await provider.getGasPrice()
    const nonce = await provider.getTransactionCount(wallet.address)

    // Prepare send parameters
    const sendParam = [eidB, recipientAddressBytes32, amount, amount, options, '0x', '0x']
    const feeParam = [nativeFee, 0]

    // Sending the tokens
    const tx = await oft.send(sendParam, feeParam, wallet.address, {
        value: nativeFee,
        gasPrice: gasPrice.mul(2),
        nonce,
    })
    console.log('Transaction hash:', tx.hash)
    await tx.wait()
    console.log(`Tokens sent successfully. View on LayerZero Scan: https://layerzeroscan.com/tx/${tx.hash}`)
}
