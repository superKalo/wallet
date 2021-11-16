import './Accounts.scss'

import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { AiOutlinePlus } from 'react-icons/ai'
import { MdOutlineContentCopy, MdOutlineDelete, MdOutlineClose, MdOutlineCheck } from 'react-icons/md'
import * as blockies from 'blockies-ts';
import { DropDown, Button } from '../../../common';
import { useToasts } from '../../../../hooks/toasts';

const Accounts = ({ accounts, selectedAddress, onSelectAcc, onRemoveAccount }) => {
    const { addToast } = useToasts()
    const [accountWarning, setAccountWarning] = useState(false)

    const shortenedAddress = address => address.slice(0, 5) + '...' + address.slice(-3)
    const isActive = id => id === selectedAddress ? 'active' : ''
    const toIcon = seed => blockies.create({ seed }).toDataURL()
    const toIconBackgroundImage = seed => ({ backgroundImage: `url(${toIcon(seed)})`})
    const walletType = signerExtra => {
        if (signerExtra && signerExtra.type === 'ledger') return 'Ledger'
        else if (signerExtra && signerExtra.type === 'trezor') return 'Trezor'
        else return 'Web3'
    }
    const copyAddress = async address => {
        await navigator.clipboard.writeText(address)
        addToast('Copied to clipboard!')
    }

    return (
        <DropDown id="accounts" icon={toIcon(selectedAddress)} title={shortenedAddress(selectedAddress)}>
          <div className="list">
            {
              accounts.map(({ id, email, signer, signerExtra }) => 
                !accountWarning ?
                    <div className={`account ${isActive(id)}`} key={id}>
                        <div className="inner" onClick={() => onSelectAcc(id)}>
                            <div className="icon" style={toIconBackgroundImage(id)}></div>
                            <div className="details">
                                <div className="address">{ id }</div>
                                <label>{ email ? `Email/passphrase account (${email})` : `${walletType(signerExtra)} (${shortenedAddress(signer.address)})` }</label>
                            </div>
                        </div>
                        <div className="button" onClick={() => copyAddress(id)}>
                            <MdOutlineContentCopy/>
                        </div>
                        <div className="button" onClick={() => setAccountWarning(true)}>
                            <MdOutlineDelete/>
                        </div>
                    </div>
                    :
                    <div id="confirm-delete-account" className={`account ${isActive(id)}`} key={id}>
                        <div className="message">
                            Are you sure you want to remove this account ?
                        </div>
                        <div className="button danger" onClick={() => onRemoveAccount(id)}>
                            <MdOutlineCheck/>
                        </div>
                        <div className="button" onClick={() => setAccountWarning(false)}>
                            <MdOutlineClose/>
                        </div>
                    </div>
              )
            }
          </div>
          <div id="add-account">
            <NavLink to="/add-account">
              <Button icon={<AiOutlinePlus/>} small>Add Account</Button>
            </NavLink>
          </div>
        </DropDown>
    )
}

export default Accounts