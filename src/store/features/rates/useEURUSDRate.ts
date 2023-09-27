import { useEffect, useState } from 'react';
import { ethers } from 'ethers';

// TODO: Refactor to DRY code also used in `usexDAIUSDRate`
const useEURUSDRate = (): number | undefined => {
  const [EURUSDRate, setEURUSDRate] = useState<number>();

  useEffect(() => {
    (async () => {
      try {
        const RPC = 'https://rpc.ankr.com/gnosis';
        const provider = new ethers.providers.JsonRpcProvider(RPC);
        const contract = new ethers.Contract(
          '0xab70BCB260073d036d1660201e9d5405F5829b7a',
          ['function latestAnswer() view returns (int256)'],
          provider
        );
        const decimals = 8;
        const priceFeedResponse = await contract.latestAnswer();
        const priceFeed = Number(ethers.utils.formatUnits(priceFeedResponse, decimals));
        setEURUSDRate(priceFeed);
      } catch (error) {
        console.error('Error fetching EUR rate:', error);
      }
    })();
  }, []);

  return EURUSDRate;
}

export default useEURUSDRate;
