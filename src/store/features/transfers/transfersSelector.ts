import { UserRealTokenTransfer } from 'src/repositories/transfers/transfers.type'
import { RootState } from 'src/store/store'

export const selectTransfersIsLoading = (state: RootState): boolean =>
  state.transfers.isLoading

export const selectTransfers = (state: RootState): UserRealTokenTransfer[] =>
  state.transfers.transfers
