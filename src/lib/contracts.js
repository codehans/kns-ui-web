import { CosmWasmClient } from "@cosmjs/cosmwasm-stargate"
import * as kujira from "kujira.js"

const client = CosmWasmClient
  .connect({ url: "https://test-rpc-kujira.mintthemoon.xyz:443" })

const auctions = client
  .then(client => new kujira.kns.auctions.AuctionsQueryClient(
    client,
    "kujira1w5hw9059pxgfqsn9paes8ztld3lcs7cw8mwe4kq9n8d85l59895qkzs7ca"
  ))

const registrar = client
  .then(client => new kujira.kns.registrar.RegistrarQueryClient(
    client,
    "kujira1s7xhj5vf675ykgqruw70g3a7yes6eyysc8c4vmqaav0dks22cerqd3lfjy"
  ))

const registry = client
  .then(client => new kujira.kns.registry.RegistryQueryClient(
    client,
    "kujira1rm4ftqyg6efyjrqx8yfvg38u8vq586dg8yachc565qpawq4ppm8q5nwrjw"
  ))

export { auctions, registrar, registry }
