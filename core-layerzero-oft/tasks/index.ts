import { ethers } from 'ethers'
import { task } from 'hardhat/config'

import { createGetHreByEid, createProviderFactory, getEidForNetworkName } from '@layerzerolabs/devtools-evm-hardhat'
import { Options } from '@layerzerolabs/lz-v2-utilities'

// send tokens from a contract on one network to another
task('lz:oft:send', 'Send tokens cross-chain using LayerZero technology')
    .addParam('contractA', 'contract address on network A')
    .addParam('recipientB', 'recipient address on network B')
    .addParam('networkA', 'name of the network A')
    .addParam('networkB', 'name of the network B')
    .addParam('amount', 'amount to transfer in eth')
    .addParam('privateKey', 'private key of the sender')
    .setAction(async (taskArgs, hre) => {
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
        const [nativeFee] = await oft.quoteSend(
            [eidB, recipientAddressBytes32, amount, amount, options, '0x', '0x'],
            false
        )
        console.log('Estimated native fee:', nativeFee.toString())

        // Fetch the current gas price and nonce
        const gasPrice = await provider.getGasPrice()
        const nonce = await provider.getTransactionCount(wallet.address)

        // Prepare send parameters
        const sendParam = [eidB, recipientAddressBytes32, amount, amount, options, '0x', '0x']
        const feeParam = [nativeFee, 0]

        // Sending the tokens with increased gas price
        try {
            const tx = await oft.send(sendParam, feeParam, wallet.address, {
                value: nativeFee,
                gasPrice: gasPrice.mul(2),
                nonce,
            })
            console.log('Transaction hash:', tx.hash)
            await tx.wait()
            console.log(
                `Tokens sent successfully to the recipient on the destination chain. View on LayerZero Scan: https://layerzeroscan.com/tx/${tx.hash}`
            )
        } catch (error) {
            console.error('Error sending tokens:', error)
        }
    })
