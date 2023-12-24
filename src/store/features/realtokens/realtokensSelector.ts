import { RootState } from 'src/store/store'
import { RealToken } from 'src/types/RealToken'

export const selectRealtokensIsLoading = (state: RootState): boolean =>
  state.realtokens.isLoading

export const selectRealtokens = (state: RootState): RealToken[] =>
  state.realtokens.realtokens
