// Define API Uris
import { APIPitsBiEnv } from 'src/types/APIPitsBI'
import { APIRealTokenCommunityEnv } from 'src/types/APIRealToken'

const REALTOKEN_COMMUNITY_API_GET_ALLTOKENS = `${process.env[APIRealTokenCommunityEnv.API_BASE]}${process.env[APIRealTokenCommunityEnv.VERSION]}/${process.env[APIRealTokenCommunityEnv.GET_ALLTOKENS]}`
const PITSBI_API_GET_ALLTOKENS = `${process.env[APIPitsBiEnv.BASE]}${process.env[APIPitsBiEnv.VERSION]}/${process.env[APIPitsBiEnv.GET_ALLTOKENS]}`

export const URIS = {
  REALTOKEN_COMMUNITY_API_GET_ALLTOKENS,
  PITSBI_API_GET_ALLTOKENS,
}
