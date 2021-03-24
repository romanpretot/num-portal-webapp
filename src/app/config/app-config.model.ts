export interface IAppConfig {
  env: {
    name: string
  }
  api: {
    baseUrl: string
  }
  auth: {
    baseUrl: string
    realm: string
    clientId: string
  }
  legal: {
    copyrightOwner: string
  }
}
