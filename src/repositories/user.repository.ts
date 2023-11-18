import { getUserDetails, getUserId } from './subgraphs/queries/user.queries'

export const UserRepository = {
  getUserId(address: string) {
    return getUserId(address)
  },
  getUserDetails(id: string) {
    return getUserDetails(id)
  },
}
