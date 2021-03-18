import { IUser } from '../user/user.interface'
import { IPhenotypeQueryApi } from './phenotype-query-api.interface'

export interface IPhenotypeApi {
  id: number | null
  name: string
  description: string
  query: IPhenotypeQueryApi
  owner?: IUser
}
