import './Collectable.scss'

import { useParams } from 'react-router-dom'
import { ethers, getDefaultProvider } from 'ethers'
import { useCallback, useEffect, useState } from 'react'
import { AiOutlineSend } from 'react-icons/ai'
import { BsFillImageFill } from 'react-icons/bs'
import * as blockies from 'blockies-ts';
import { useToasts } from '../../../hooks/toasts'
import { TextInput, Button, Loading } from '../../common'
import ERC721Abi from '../../../consts/ERC721Abi'
import networks from '../../../consts/networks'

const Collectable = () => {
    const { addToast } = useToasts()
    const { network, collectionAddr, tokenId } = useParams()
    const [isLoading, setLoading] = useState()
    const [metadata, setMetadata] = useState({
        owner: {
            address: '',
            icon: ''
        },
        name: '',
        description: '',
        image: '',
        collection: '',
        explorerUrl: ''
    })

    const handleUri = uri => {
        uri = uri.startsWith('data:application/json') ? uri.replace('data:application/json;utf8,', '') : uri
        return uri.startsWith('ipfs://') ? uri.replace(/ipfs:\/\/ipfs\/|ipfs:\/\//g, 'https://ipfs.io/ipfs/') : uri
    }

    const fetchMetadata = useCallback(async () => {
        setLoading(true)

        try {
            const { rpc, explorerUrl } = networks.find(({ id }) => id === network)
            const provider = getDefaultProvider(rpc)
            const contract = new ethers.Contract(collectionAddr, ERC721Abi, provider)

            const [collection, address, uri] = await Promise.all([
                contract.name(),
                contract.ownerOf(tokenId),
                contract.tokenURI(tokenId)
            ])

            try {
                let json = {}

                if (uri.startsWith('data:application/json')) {
                    json = JSON.parse(uri.replace('data:application/json;utf8,', ''))
                } else {
                    const jsonUrl = handleUri(uri)
                    const response = await fetch(jsonUrl)
                    json = await response.json()
                }

                setMetadata(metadata => ({
                    ...metadata,
                    ...json,
                    image: json ? handleUri(json.image) : null
                }))
            } catch(e) {
                throw e
            }

            setMetadata(metadata => ({
                ...metadata,
                collection,
                owner: {
                    address,
                    icon: blockies.create({ seed: address }).toDataURL()
                },
                explorerUrl
            }))
        } catch(e) {
            console.error(e)
            addToast(`Error: ${e.message || e}`, { error: true })
        }

        setLoading(false)
    }, [addToast, tokenId, collectionAddr, network])

    useEffect(() => fetchMetadata(), [fetchMetadata])

    return (
        <div id="collectable">
            <div className="panel">
                <div className="title">
                    { metadata.collection } #{ tokenId }
                    <div className="contract">
                        Contract address: <a className="address" href={`${metadata.explorerUrl}/address/${collectionAddr}`} target="_blank" rel="noreferrer">{ collectionAddr }</a>
                    </div>
                </div>
                {
                    isLoading ?
                        <Loading/>
                        :
                        <div className="metadata">
                            <div className="image" style={{backgroundImage: `url(${metadata.image})`}}>
                                { !metadata.image ? <BsFillImageFill/> : null }
                            </div>
                            <div className="info">
                                <div className="name">
                                    { metadata.name }
                                </div>
                                <div className="description">
                                    { metadata.description }
                                </div>
                            </div>
                            <div className="owner">
                                Owner:
                                <a className="address" href={`${metadata.explorerUrl}/address/${metadata.owner.address}`} target="_blank" rel="noreferrer">
                                    <div className="icon" style={{backgroundImage: `url(${metadata.owner.icon})`}}></div>
                                    { metadata.owner.address }
                                </a>
                            </div>
                        </div>
                }
            </div>
            <div className="panel">
                <div className="title">Transfer</div>
                <div className="content">
                    <TextInput placeholder="Recipient Address"/>
                    <div className="separator"></div>
                    <Button icon={<AiOutlineSend/>}>Send</Button>
                </div>
            </div>
        </div>
    )
}

export default Collectable