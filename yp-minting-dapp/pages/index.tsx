import { useEffect, useState } from 'react'
import Head from 'next/head'
import {
  Box,
  Center,
  Heading,
  HStack,
  Img,
  Link,
  Text,
  VStack,
} from '@chakra-ui/react'
import useSWR from 'swr'
import Web3 from 'web3'
import { useWeb3React } from '@web3-react/core'
import { Web3Provider } from '@ethersproject/providers'
import { ContractData, fallbackData } from './api/data'
import {
  fetchContractData,
  getContractUrl,
  getErrorMessage,
  getTxUrl,
  truncateContractAddress,
} from '../utils'
import { injected } from '../connectors'
import abi from '../contracts/abi.json'
import styles from '../styles/Home.module.css'
import config from '../config'
import { getWhitelistProof, whitelist } from '../whitelist'
import type { NextPage } from 'next'

const Home: NextPage = () => {
  const { data = fallbackData, error, mutate } = useSWR<ContractData>(
    '/api/data',
    fetchContractData,
    {
      revalidateOnFocus: false,
      revalidateOnMount: true,
      revalidateOnReconnect: false,
      refreshWhenOffline: false,
      refreshWhenHidden: false,
      refreshInterval: 0,
    },
  )

  const { account, activate, active, chainId } = useWeb3React<Web3Provider>()
  const [ethereum, setEthereum] = useState<any>(null)
  const [contract, setContract] = useState<any>(undefined)
  const [hasMinted, setHasMinted] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [txHash, setTxHash] = useState('')

  useEffect(() => {
    if (error) {
      console.log(error)
    }
  }, [error])

  useEffect(() => {
    if (errorMsg) {
      console.log(errorMsg)
    }
  }, [errorMsg])

  useEffect(() => {
    if (!window) return

    const w = window as any

    if (w?.ethereum) {
      const w3 = new Web3(w.ethereum)
      const c = new w3.eth.Contract(abi as any, config.contractAddress)
      setContract(c)
      setEthereum(w.ethereum)
    } else {
      console.log('Please install MetaMask')
    }
  }, [])

  useEffect(() => {
    if (!contract || !account) return

    const fetchHasMinted = async () => {
      const hasMinted = await contract.methods.hasMinted(account).call()
      setHasMinted(hasMinted)
    }

    fetchHasMinted()
  }, [contract, account])

  if (typeof window === 'undefined') return null

  const handleMint = async () => {
    if (!contract || !ethereum || !account) {
      return
    }

    if (chainId !== 1) {
      setErrorMsg(
        "You're connected to an unsupported network. Please connect to the Ethereum mainnet to continue.",
      )
      return
    }

    const isWhitelist = !data?.isWhitelistMintPaused

    setErrorMsg('')
    if (isWhitelist && !whitelist.includes(account)) {
      setErrorMsg("You're not whitelisted!")
      return
    }

    let encoded
    let value
    if (isWhitelist) {
      const proof = getWhitelistProof(account)
      encoded = contract.methods.whitelistMint(proof).encodeABI()
      value = Web3.utils.toWei((data?.whitelistMintPrice).toString())
    } else {
      encoded = contract.methods.mint().encodeABI()
      value = Web3.utils.toWei((data?.mintPrice).toString())
    }

    const tx = {
      from: account,
      to: config.contractAddress,
      data: encoded,
      value: Web3.utils.numberToHex(value),
    }

    ethereum
      .request({
        method: 'eth_sendTransaction',
        params: [tx],
      })
      .then((hash: string) => {
        setTxHash(hash)
        mutate()
      })
      .catch((err: any) => {
        console.log(err)
        if (err?.data?.code === -32000) {
          setErrorMsg('Insufficient funds')
          return
        }

        setErrorMsg(err.message)
      })
  }

  const handleOnConnect = () => {
    setErrorMsg('')
    activate(injected, undefined, true).catch((e) =>
      setErrorMsg(getErrorMessage(e)),
    )
  }

  return (
    <Box display="flex" h="100vh" flexDirection="column" alignItems="center">
      <Head>
        <title>Yummy Panda - Minting DApp</title>
        <meta name="description" content="Yummy Panda - Minting Dapp" />
      </Head>

      <main className={styles.main}>
        <Img
          src="./city.png"
          w="100%"
          position="absolute"
          bottom={0}
          left={0}
        />
        <Box
          w="100vw"
          position="absolute"
          bottom={0}
          left={0}
          bg="black"
          h="40px"
        />
        <Img
          src="./pand_1.png"
          position="absolute"
          bottom={0}
          left="25%"
          h="25vh"
        />
        <Img
          src="./pand_2.png"
          position="absolute"
          bottom={0}
          left="65%"
          h="25vh"
        />
        <Img
          src="./tree_1.png"
          position="absolute"
          top={0}
          right={0}
          h="85vh"
        />
        <Img
          src="./tree_2.png"
          position="absolute"
          bottom={0}
          left={0}
          h="25vh"
        />
        <Img src="./tree_3.png" position="absolute" top={0} left={0} h="25vh" />
        <Box
          mx="auto"
          maxW="90vw"
          alignItems="center"
          background="rgba(0, 0, 0, 0.4)"
          border="2px solid rgba(0, 0, 0, 0.2)"
          backdropFilter="blur(30px)"
          borderRadius="25px"
          textAlign="center"
          color="white"
        >
          <Img
            src="./logo.png"
            alt=""
            h={{ base: 24, md: 32 }}
            zIndex={-1}
            mt={4}
            mx="auto"
          />
          <Center alignItems="center" mx="auto" py={4}>
            <Link href="https://twitter.com/YummyPandas" px={2}>
              <Img
                h={12}
                src="./twitter.png"
                alt=""
                _hover={{ transform: 'scale(1.1)' }}
              />
            </Link>
            <Link href="https://discord.com/invite/GcDWuFjwtN" px={2}>
              <Img
                h={12}
                src="./discord.png"
                alt=""
                _hover={{ transform: 'scale(1.1)' }}
              />
            </Link>
            <Link href="https://www.instagram.com/yummy_pandas_nft/" px={2}>
              <Img
                h={12}
                src="./instagram.png"
                alt=""
                _hover={{ transform: 'scale(1.1)' }}
              />
            </Link>
          </Center>
          <Heading fontFamily="Nunito" py={6}>
            MINT ONE NOW!
          </Heading>
          {errorMsg && (
            <div className={styles.error}>
              <div className={styles.section}>
                <span className={styles.subheadingWhite}>Error</span>
                <p style={{ color: 'white' }}>{errorMsg}</p>
              </div>
            </div>
          )}
          {txHash && !errorMsg && (
            <div className={styles.error}>
              <div className={styles.section}>
                <span className={styles.subheadingWhite}>Mint successful!</span>
                <p>
                  Tx Hash:{' '}
                  <a href={getTxUrl(txHash)}>
                    <span>{truncateContractAddress(txHash)}</span>
                  </a>
                </p>
              </div>
            </div>
          )}
          <VStack
            bg="rgb(33, 33, 33)"
            p={4}
            px={4}
            color="white"
            m={4}
            flexGrow={1}
            spacing={6}
            rounded="lg"
          >
            <HStack spacing={12} w="100%" pl={4}>
              <VStack>
                <Text fontFamily="Nunito">Remaining</Text>
                <Text fontFamily="Nunito">
                  {data?.maxSupply - data?.totalSupply}
                </Text>
              </VStack>
              <VStack>
                <Text fontFamily="Nunito">Cost</Text>
                <Text fontFamily="Nunito">
                  {data?.isPaused ? data?.whitelistMintPrice : data?.mintPrice}{' '}
                  ETH
                </Text>
              </VStack>
              <Box bg="rgb(97, 97, 97)" spacing={1} flexGrow={1} py={3} rounded="lg">
                <Text textAlign="center" fontFamily="Nunito">
                  LIVE
                  <Text as="span" color="red" ml={2}>
                    •
                  </Text>
                </Text>
              </Box>
            </HStack>
            {data?.totalSupply === data?.maxSupply ? (
              <button className={styles.mintButton} disabled>
                Sold Out!
              </button>
            ) : hasMinted ? (
              <button className={styles.mintButton} disabled>
                Already Minted!
              </button>
            ) : data?.isPaused && data?.isWhitelistMintPaused ? (
              <button className={styles.mintButton} disabled>
                Minting not enabled!
              </button>
            ) : active ? (
              <button className={styles.mintButton} onClick={handleMint}>
                Mint
              </button>
            ) : (
              <button className={styles.mintButton} onClick={handleOnConnect}>
                Continue with MetaMask
              </button>
            )}
          </VStack>
        </Box>
      </main>
    </Box>
  )
}

export default Home
