import { getConfig } from "@repo/config"
import { EnvConfig, getContractsConfig } from "@repo/config/contracts"
import { deployProxy } from "../../helpers"
import { XAppScoring } from "../../../typechain-types"
import { ethers } from "hardhat"
import { updateConfig } from "../../helpers/config"

export async function main() {
  if (!process.env.NEXT_PUBLIC_APP_ENV) {
    throw new Error("Missing NEXT_PUBLIC_APP_ENV")
  }

  const envConfig = getConfig(process.env.NEXT_PUBLIC_APP_ENV as EnvConfig)
  const contractsConfig = getContractsConfig(process.env.NEXT_PUBLIC_APP_ENV as EnvConfig)
  const deployer = (await ethers.getSigners())[0]

  console.log(
    `================  Deploying contracts on ${envConfig.network.name} (${envConfig.nodeUrl}) with ${envConfig.environment} configurations `,
  )
  console.log(`================  Address used to deploy: ${deployer.address}`)

  const TEMP_ADMIN = envConfig.network.name === "solo" ? contractsConfig.CONTRACTS_ADMIN_ADDRESS : deployer.address
  console.log("Temporary admin set to ", TEMP_ADMIN)
  console.log("Final admin will be set to ", contractsConfig.CONTRACTS_ADMIN_ADDRESS)

  console.log("Deploying proxy for XAppScoring")

  const xAppScoring = (await deployProxy("XAppScoring", [TEMP_ADMIN, TEMP_ADMIN, TEMP_ADMIN])) as unknown as XAppScoring

  console.log("XAppScoring deployed at:", await xAppScoring.getAddress())
  console.log("Version:", await xAppScoring.version())

  console.log("Updating the config file with the new XAppScoring contract address")
  try {
    Object.assign(envConfig, { xAppScoringContractAddress: await xAppScoring.getAddress() })
    await updateConfig(envConfig, "xAppScoringContract")
    console.log("Config file updated successfully")
  } catch (e) {
    console.error("Failed to update config file, update it manually:", e)
  }

  console.log("XAppScoring address: ", await xAppScoring.getAddress())
  console.log("================  Execution completed")
  process.exit(0)
}

main()
