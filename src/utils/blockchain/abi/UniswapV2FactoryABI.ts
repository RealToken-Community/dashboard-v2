export const UniswapV2FactoryABI = [
  {
    type: 'constructor',
    inputs: [
      { name: '_feeToSetter', type: 'address', internalType: 'address' },
    ],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'INIT_CODE_HASH',
    inputs: [],
    outputs: [{ name: '', type: 'bytes32', internalType: 'bytes32' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'allPairs',
    inputs: [{ name: '', type: 'uint256', internalType: 'uint256' }],
    outputs: [{ name: '', type: 'address', internalType: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'allPairsLength',
    inputs: [],
    outputs: [{ name: '', type: 'uint256', internalType: 'uint256' }],
    stateMutability: 'view',
  },
  // {
  //   type: 'function',
  //   name: 'createPair',
  //   inputs: [
  //     { name: 'tokenA', type: 'address', internalType: 'address' },
  //     { name: 'tokenB', type: 'address', internalType: 'address' },
  //   ],
  //   outputs: [{ name: 'pair', type: 'address', internalType: 'address' }],
  //   stateMutability: 'nonpayable',
  // },
  {
    type: 'function',
    name: 'feeTo',
    inputs: [],
    outputs: [{ name: '', type: 'address', internalType: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'feeToSetter',
    inputs: [],
    outputs: [{ name: '', type: 'address', internalType: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'getPair',
    inputs: [
      { name: '', type: 'address', internalType: 'address' },
      { name: '', type: 'address', internalType: 'address' },
    ],
    outputs: [{ name: '', type: 'address', internalType: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'setFeeTo',
    inputs: [{ name: '_feeTo', type: 'address', internalType: 'address' }],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'setFeeToSetter',
    inputs: [
      { name: '_feeToSetter', type: 'address', internalType: 'address' },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'event',
    name: 'PairCreated',
    inputs: [
      {
        name: 'token0',
        type: 'address',
        indexed: true,
        internalType: 'address',
      },
      {
        name: 'token1',
        type: 'address',
        indexed: true,
        internalType: 'address',
      },
      {
        name: 'pair',
        type: 'address',
        indexed: false,
        internalType: 'address',
      },
      { name: '', type: 'uint256', indexed: false, internalType: 'uint256' },
    ],
    anonymous: false,
  },
]