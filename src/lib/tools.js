import * as vars from "./vars"

const getAuctionCloseSeconds = (openStart) => Number(openStart) + vars.auctionsOpenDuration

const getAuctionStatusWeight = (status) => {
  switch (status) {
    case "Open":
      return 3
    case "Deposit":
      return 2
    case "Closed":
      return 1
  }
}

const getAuctionStatus = (openStart) => {
  if (!openStart) {
    return "Deposit"
  } else if (getCurrentTimeSeconds() < getAuctionCloseSeconds(openStart)) {
    return "Open"
  } else {
    return "Closed"
  }
}

const getCurrentTimeSeconds = () => Math.floor(Date.now() / 1000)

export {
  getAuctionCloseSeconds,
  getAuctionStatus,
  getAuctionStatusWeight,
  getCurrentTimeSeconds,
}