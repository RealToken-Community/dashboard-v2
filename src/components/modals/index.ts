import { WalletModal } from '@realtoken/realt-commons'

import { AssetsViewFilterModal } from '../assetsView/filters/AssetsViewFilterModal'
import { ManageWalletModal } from './ManageWalletModal'
import { FC } from 'react'
import { ContextModalProps } from '@mantine/modals'

export const modals = {
  web3Wallets: WalletModal as FC<ContextModalProps<Record<string, unknown>>>,
  assetsViewFilterModal: AssetsViewFilterModal,
  manageWalletModal: ManageWalletModal,
}
