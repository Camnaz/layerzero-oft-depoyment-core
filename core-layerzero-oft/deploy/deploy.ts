import { ethers } from 'hardhat'
import { config as dotenvConfig } from 'dotenv'
dotenvConfig()  // Load .env file

const contractName = 'CrossChainToken'

const deploy = async (hre) => {
  const { getNamedAccounts, deployments } = hre
  const { deploy } = deployments
  const { deployer } = await getNamedAccounts()

  console.log(`Deploying to network: ${hre.network.name}`)
  console.log(`Deployer: ${deployer}`)

  const endpointV2Deployment = await hre.deployments.get('EndpointV2')

  const { address } = await deploy(contractName, {
    from: deployer,
    args: [
      process.env.TOKEN_NAME || 'CrossChainToken',   // Token name from .env
      process.env.TOKEN_SYMBOL || 'CCT',            // Token symbol from .env
      endpointV2Deployment.address,                 // LayerZero's EndpointV2 address
      deployer,                                     // Owner
    ],
    log: true,
    skipIfAlreadyDeployed: false,
  })

  console.log(`Deployed contract: ${contractName} at address: ${address}`)
}

deploy.tags = [contractName]

export default deploy
