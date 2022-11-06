import * as vars from "./vars"

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
  } else if (getCurrentTimeSeconds() < (openStart + vars.auctionsOpenDuration)) {
    return "Open"
  } else {
    return "Closed"
  }
}

const getCurrentTimeSeconds = () => Math.floor(Date.now() / 1000)

export {
  getAuctionStatus,
  getAuctionStatusWeight,
  getCurrentTimeSeconds,
}