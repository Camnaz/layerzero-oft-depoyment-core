import { HardhatRuntimeEnvironment, TaskArguments } from 'hardhat/types'

interface VerifyContractArgs extends TaskArguments {
    contractAddress: string
    targetNetwork: string // Renamed from 'network' to avoid conflict
    constructorArguments: string[]
}

module.exports = async (taskArgs: VerifyContractArgs, hre: HardhatRuntimeEnvironment) => {
    const { contractAddress, constructorArguments, targetNetwork } = taskArgs

    console.log(`Verifying contract on ${targetNetwork}...`)

    try {
        await hre.run('verify:verify', {
            address: contractAddress,
            constructorArguments: constructorArguments,
        })
        console.log(`Contract verified successfully: ${contractAddress}`)
    } catch (error) {
        // Handle the error safely when it's of type `unknown`
        if (error instanceof Error) {
            console.error(`Error verifying contract: ${error.message}`)
        } else {
            console.error('An unknown error occurred during contract verification.')
        }
    }
}
