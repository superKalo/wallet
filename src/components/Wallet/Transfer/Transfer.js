import { useLocation } from 'react-router-dom'
import { useState } from 'react'
import { withRouter } from 'react-router'
import accountPresets from 'ambire-common/src/constants/accountPresets'
import { useParams } from 'react-router'
import { isValidAddress } from 'ambire-common/src/services/address'

import Addresses from './Addresses/Addresses'
import { Panel } from 'components/common'

import Send from './Send/Send'
import styles from './Transfer.module.scss'

const Transfer = (props) => {
    const { portfolio, selectedNetwork, addressBook } = props
    const { addresses, addAddress, removeAddress } = addressBook
    
    const { state } = useLocation()
    const { tokenAddressOrSymbol } = useParams()
    
    const tokenAddress = isValidAddress(tokenAddressOrSymbol) ? tokenAddressOrSymbol : portfolio.tokens.find(({ symbol }) => symbol === tokenAddressOrSymbol)?.address || null

    const [asset, setAsset] = useState(tokenAddress)
    const [gasTankDetails] = useState(state ? state : null)
    const [address, setAddress] = useState(gasTankDetails ? accountPresets.feeCollector : '')
    
    const selectedAsset = portfolio?.tokens.find(({ address }) => address === asset)

    return (
        <div className={styles.wrapper} style={{ justifyContent: gasTankDetails ? 'center' : '' }}>
           <Panel title="" className={styles.panel}>
               <Send 
                {...props}
                address={address} 
                setAddress={setAddress} 
                gasTankDetails={gasTankDetails} 
                asset={asset} 
                setAsset={setAsset} 
                tokenAddress={tokenAddress} 
                selectedAsset={selectedAsset} 
               />
           </Panel>
           {!gasTankDetails && <Addresses
                selectedAsset={selectedAsset}
                selectedNetwork={selectedNetwork}
                addresses={addresses}
                addAddress={addAddress}
                removeAddress={removeAddress}
                onSelectAddress={address => setAddress(address)}
            />}
        </div>
    )
}

export default withRouter(Transfer)