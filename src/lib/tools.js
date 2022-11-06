import * as vars from "./vars"

const getAuctionStatus = (openStart) => {
  if (!openStart) {
    return "Deposit"
  } else if (getCurrentTimeSeconds() < (openStart + vars.auctionsOpenDuration)) {
    return "Open"
  } else {
    return "Closed"
  }
}

const getCurrentTimeSeconds = () => Math.floor(Date.now() / 1000)

export {
  getAuctionStatus,
  getCurrentTimeSeconds,
}