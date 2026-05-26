import { getConfig } from "@repo/config"
import { EnvConfig, getContractsConfig } from "@repo/config/contracts"
import { deployProxy } from "../../helpers"
import { XAppBadges } from "../../../typechain-types"
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

  console.log("Deploying proxy for XAppBadges")

  const xAppBadges = (await deployProxy("XAppBadges", [TEMP_ADMIN, TEMP_ADMIN, TEMP_ADMIN])) as unknown as XAppBadges

  console.log("XAppBadges deployed at:", await xAppBadges.getAddress())
  console.log("Version:", await xAppBadges.version())

  console.log("Updating the config file with the new XAppBadges contract address")
  try {
    Object.assign(envConfig, { xAppBadgesContractAddress: await xAppBadges.getAddress() })
    await updateConfig(envConfig, "xAppBadgesContract")
    console.log("Config file updated successfully")
  } catch (e) {
    console.error("Failed to update config file, update it manually:", e)
  }

  console.log("XAppBadges address: ", await xAppBadges.getAddress())
  console.log("================  Execution completed")
  process.exit(0)
}

main()
