import { CosmWasmClient, SigningCosmWasmClient } from "@cosmjs/cosmwasm-stargate"
import * as kujira from "kujira.js"
import {
  auctionsContractAddr,
  gasPriceDefault,
  registrarContractAddr,
  registryContractAddr,
  rpcUrl,
} from "./vars"

const client = CosmWasmClient.connect({ url: rpcUrl })

const auctions = client
  .then(c => new kujira.kns.auctions.AuctionsQueryClient(c, auctionsContractAddr))

const registrar = client
  .then(c => new kujira.kns.registrar.RegistrarQueryClient(c, registrarContractAddr))

const registry = client
  .then(c => new kujira.kns.registry.RegistryQueryClient(c, registryContractAddr))

const getSignClient = (signer) => SigningCosmWasmClient
  .connectWithSigner(rpcUrl, signer, { gasPrice: gasPriceDefault })

const getAuctionsSignClient = (addr, signer) => !addr || !signer ? null : getSignClient(signer)
  .then(signClient => new kujira.kns.auctions.AuctionsClient(signClient, addr, auctionsContractAddr))

const getRegistrarSignClient = (addr, signer) => !addr || !signer ? null : getSignClient(signer)
  .then(signClient => new kujira.kns.registrar.RegistrarClient(signClient, addr, registrarContractAddr))

const getRegistrySignClient = (addr, signer) => !addr || !signer ? null : getSignClient(signer)
  .then(signClient => new kujira.kns.registry.RegistryClient(signClient, addr, registryContractAddr))

export { auctions, registrar, registry, getSignClient, getAuctionsSignClient, getRegistrarSignClient, getRegistrySignClient }
