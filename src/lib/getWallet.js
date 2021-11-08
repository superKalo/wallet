import { TrezorSubprovider } from '@0x/subproviders/lib/src/subproviders/trezor' // https://github.com/0xProject/0x-monorepo/issues/1400
import TrezorConnect from 'trezor-connect'
import { ethers } from 'ethers'
import HDNode from 'hdkey'
import { LedgerSubprovider } from '@0x/subproviders/lib/src/subproviders/ledger' // https://github.com/0xProject/0x-monorepo/issues/1400
import { ledgerEthereumBrowserClientFactoryAsync } from '@0x/subproviders/lib/src' // https://github.com/0xProject/0x-monorepo/issues/1400

let wallets = {}

// opts
// passphrase: string
// noCache: boolean
export function getWallet ({ signer, signerExtra }, opts = {}) {
    const id = signer.address || signer.one
    if (wallets[id]) return wallets[id]
    return wallets[id] = getWalletNew({ signer, signerExtra }, opts)
}

function getWalletNew ({ signer, signerExtra }, opts) {
    if (signerExtra && signerExtra.type === 'trezor') {
        const providerTrezor = new TrezorSubprovider({
            trezorConnectClientApi: TrezorConnect
        })
        providerTrezor._initialDerivedKeyInfo = getInitialDerivedKeyInfo(signerExtra)
        // NOTE: for metamask, use `const provider = new ethers.providers.Web3Provider(window.ethereum)`
        // as for Trezor/ledger, alternatively we can shim using https://www.npmjs.com/package/web3-provider-engine and then wrap in Web3Provider
        return {
            signMessage: hash => providerTrezor.signPersonalMessageAsync(ethers.utils.hexlify(hash), signer.address)
        }
    } else if (signerExtra && signerExtra.type === 'ledger') {
        const provider = new LedgerSubprovider({
            networkId: 0, // @TODO: is this needed?
            ledgerEthereumClientFactoryAsync: ledgerEthereumBrowserClientFactoryAsync,
            baseDerivationPath: signerExtra.info.baseDerivationPath
        })
        return {
            signMessage: hash => provider.signPersonalMessageAsync(ethers.utils.hexlify(hash), signer.address)
        }
    } else if (signer.address) {
        // @TODO: MM
        new Error('unsupported')
    } else if (signer.one) {
        // @TODO quickAccounts
    } else {
        throw new Error('unknown signer type')
    }
}

function getInitialDerivedKeyInfo (signerExtra) {
    return {
        hdKey: HDNode.fromExtendedKey(signerExtra.info.hdKey.xpub),
        derivationPath: signerExtra.info.derivationPath,
        baseDerivationPath: signerExtra.info.baseDerivationPath
    }
}