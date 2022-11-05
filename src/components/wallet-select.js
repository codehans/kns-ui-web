import * as React from 'react'

const WalletSelect = ({name, addr}) => {
  if (!name) {
    return (
      <div className="text-primary">DISCONNECTED</div>
    )
  }
  return (
    <div className="text-primary">{name}</div>
  )
}

export default WalletSelect