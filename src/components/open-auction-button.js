import * as React from "react"
import { useAtom } from "jotai"

import { auctionsSignerAtom, auctionsConfigAtom, topAuctionsDepositAtom, topAuctionsOpenAtom, globalRefreshAtom } from "../lib/data"



const OpenAuctionsButton = () => {
  const [auctionsConfig] = useAtom(auctionsConfigAtom)
  const [auctionsSigner] = useAtom(auctionsSignerAtom)
  const [topAuctionsDeposit] = useAtom(topAuctionsDepositAtom)
  const [topAuctionsOpen] = useAtom(topAuctionsOpenAtom)
  const [globalRefresh] = useAtom(globalRefreshAtom)
  const open = () => {
    if (auctionsSigner) {
      auctionsSigner.openAuction().then(globalRefresh.refresh).catch(console.log)
    }
  }
  const isEnabled = auctionsConfig
    && topAuctionsDeposit
    && topAuctionsDeposit.length > 0
    && topAuctionsOpen.length < auctionsConfig.max_open

  return (
    <button className="md-button md-button--outline" onClick={open} disabled={isEnabled ? null : "disabled"}>
      OPEN NEXT AUCTION
    </button>
  )
}

export default OpenAuctionsButton