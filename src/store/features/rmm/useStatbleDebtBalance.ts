import { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import { selectCleanedAddressList } from '../settings/settingsSelector';
import { useSelector } from 'react-redux';

const useStableDebtBalance = (): number | undefined => {
  const [stableDebtBalance, setStableDebtBalance] = useState<number>();
  const addressList = useSelector(selectCleanedAddressList)

  useEffect(() => {
    console.log({ stableDebtBalance });
  }, [stableDebtBalance]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const RPC = 'https://rpc.ankr.com/gnosis';
        const provider = new ethers.providers.JsonRpcProvider(RPC);
        const contract = new ethers.Contract(
          '0x6a7CeD66902D07066Ad08c81179d17d0fbE36829',
          ['function balanceOf(address owner) view returns (uint256)', 'function decimals() view returns (uint8)'],
          provider
        );

        const decimals = await contract.decimals();
        const balances = await Promise.all(
          addressList.map(async (item: string) => {
            const balanceResponse = await contract.balanceOf(item);
            return Number(ethers.utils.formatUnits(balanceResponse, decimals));
          })
        );

        const totalBalance = balances.reduce((acc, curr) => acc + curr, 0);
        setStableDebtBalance(totalBalance);
        
      } catch (error) {
        console.error('Error fetching stable debt balance', error);
      }
    };

    fetchData();
  }, [addressList]);

  return stableDebtBalance;
}

export default useStableDebtBalance;
