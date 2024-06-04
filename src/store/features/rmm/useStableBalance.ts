import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'

import { ethers } from 'ethers'

import { selectUserAddressList } from 'src/store/features/settings/settingsSelector'

interface balanceType {
  type: 'deposit' | 'debt'
}

const useStableBalance = (props: balanceType): number | undefined => {
  const [stableBalance, setStableBalance] = useState<number>()
  const addressList = useSelector(selectUserAddressList)

  const contractAddress =
    props.type === 'deposit'
      ? '0x7349C9eaA538e118725a6130e0f8341509b9f8A0'
      : '0x6a7CeD66902D07066Ad08c81179d17d0fbE36829'

  useEffect(() => {
    const fetchData = async () => {
      try {
        const RPC = 'https://rpc.ankr.com/gnosis'
        const provider = new ethers.providers.JsonRpcProvider(RPC)
        const contract = new ethers.Contract(
          contractAddress,
          [
            'function balanceOf(address owner) view returns (uint256)',
            'function decimals() view returns (uint8)',
          ],
          provider
        )

        const decimals = await contract.decimals()
        const balances = await Promise.all(
          addressList.map(async (item: string) => {
            const balanceResponse = await contract.balanceOf(item)
            return Number(ethers.utils.formatUnits(balanceResponse, decimals))
          })
        )

        const totalBalance = balances.reduce((acc, curr) => acc + curr, 0)
        setStableBalance(totalBalance)
      } catch (error) {
        console.error('Error fetching stable debt balance', error)
      }
    }

    fetchData()
  }, [addressList, props.type])

  return stableBalance
}

const useStableDebtBalance = () => useStableBalance({ type: 'debt' })
const useStableDepositBalance = () => useStableBalance({ type: 'deposit' })

export { useStableDebtBalance, useStableDepositBalance }
