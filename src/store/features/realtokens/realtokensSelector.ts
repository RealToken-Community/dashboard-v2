import { RootState } from 'src/store/store'

export const selectRealtokensIsLoading = (state: RootState): boolean =>
  state.realtokens.isLoading
