export interface IAqlApi {
  id: number
  name: string
  query: string
  description: string
  createDate: string
  modifiedDate: string
  organizationId: string
  ownerId: string
  publicAql: boolean
}
