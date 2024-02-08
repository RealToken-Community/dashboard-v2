import { ethers } from 'ethers'

const RPC_URL = 'https://rpc.ankr.com/gnosis'
export const RpcProvider = new ethers.JsonRpcProvider(RPC_URL)
