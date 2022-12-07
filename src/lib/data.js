import { atom } from "jotai"
import { loadable } from "jotai/utils"
import { getWalletBalance } from "./chain"
import { getAuctionsSignClient, getRegistrarSignClient, getRegistrySignClient, registrar } from "./contracts"
import {
  getAuction,
  getRecord,
  getToken,
  getUserBids,
  getDomainInfo,
  resolveKujiraAddr,
} from "./tools"

const domainAtom = atom(null)
const auctionAtom = loadable(atom((get) => getAuction(get(domainAtom))))
const recordAtom = loadable(atom((get) => getRecord(get(domainAtom))))
const tokenAtom = loadable(atom((get) => getToken(get(domainAtom))))
const domainInfoAtom = loadable(atom((get) => getDomainInfo(get(domainAtom))))

const userBalanceAtom = loadable(atom((get) => getWalletBalance(get(walletAddrAtom))))
const userBidsAtom = loadable(atom((get) => getUserBids(get(walletAddrAtom))))
const userDomainBidAtom = loadable(atom((get) => {
  const userBids = get(userBidsAtom)
  const domain = get(domainAtom)
  return  userBids.state !== "hasData" || !domain ? null : userBids.data.find(b => b.domain === domain)
}))
const userDomainsAtom = loadable(atom((get) => {
  const addr = get(walletAddrAtom)
  return !addr ? null : registrar
    .then(r => r
      .tokens({ owner: addr })
      .then(res => res.tokens)
    )
    .catch(console.log)
}))

const auctionsConfigAtom = atom(null)
const registrarConfigAtom = atom(null)
const auctionsSignerAtom = atom((get) => getAuctionsSignClient(get(walletAddrAtom), get(walletSignerAtom)))
const registrarSignerAtom = atom((get) => getRegistrarSignClient(get(walletAddrAtom), get(walletSignerAtom)))
const registrySignerAtom = atom((get) => getRegistrySignClient(get(walletAddrAtom), get(walletSignerAtom)))

const globalRefreshAtom = atom({refresh: () => {}})

const topAuctionsDepositAtom = atom(null)
const topAuctionsOpenAtom = atom(null)
const topAuctionsClosedAtom = atom(null)

const walletSignerAtom = atom(null)
const walletAddrAtom = atom((get) => {
  const walletSigner = get(walletSignerAtom)
  return !walletSigner ? null : walletSigner
    .getAccounts()
    .then(accounts => accounts[0].address)
})
const walletNameAtom = atom((get) => resolveKujiraAddr(get(walletAddrAtom)))

const walletSelectShowAtom = atom(false)
const walletSelectTypeAtom = atom(null)

const showReverseModalAtom = atom(false)

export {
  domainAtom,
  domainInfoAtom,
  auctionAtom,
  recordAtom,
  tokenAtom,
  auctionsConfigAtom,
  auctionsSignerAtom,
  topAuctionsDepositAtom,
  topAuctionsOpenAtom,
  topAuctionsClosedAtom,
  walletAddrAtom,
  walletNameAtom,
  walletSignerAtom,
  walletSelectShowAtom,
  walletSelectTypeAtom,
  userBalanceAtom,
  userBidsAtom,
  userDomainBidAtom,
  userDomainsAtom,
  globalRefreshAtom,
  registrarSignerAtom,
  registrySignerAtom,
  registrarConfigAtom,
  showReverseModalAtom,
}