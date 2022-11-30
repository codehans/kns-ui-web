import { StargateClient } from "@cosmjs/stargate"

import { denomFull, rpcUrl } from "./vars"

const client = StargateClient.connect({ url: rpcUrl })

const getWalletBalance = async (addr) => !addr ? null : client
  .then(c => c.getBalance(addr, denomFull))

export { getWalletBalance }