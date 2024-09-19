import { HardhatRuntimeEnvironment } from 'hardhat/types'
import { DeployFunction } from 'hardhat-deploy/types'

const contractName = 'MyOFT'

const deploy: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {
    const { getNamedAccounts, deployments } = hre
    const { deploy } = deployments
    const { deployer } = await getNamedAccounts()

    console.log(`Deploying contract ${contractName} from deployer address: ${deployer}`)

    // The LayerZero endpoint address for CoreDAO testnet (replace this if using another network)
    const lzEndpointAddress = '0x6EDCE65403992e310A62460808c4b910D972f10f' // Example for CoreDAO testnet
    const delegateAddress = deployer // Deployer will be the initial owner

    const result = await deploy(contractName, {
        from: deployer,
        args: [
            'MyOFT', // Token name
            'MOFT', // Token symbol
            lzEndpointAddress, // LayerZero Endpoint
            delegateAddress, // Delegate (set to the deployer)
        ],
        log: true,
    })

    console.log(`${contractName} deployed at address: ${result.address}`)
}

export default deploy
deploy.tags = ['MyOFT']
