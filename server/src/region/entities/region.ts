import { ApiProperty } from '@nestjs/swagger'
import { ObjectId } from 'mongodb'

export type RegionClusterConf = {
  driver: string
  kubeconfig: string
  npmInstallFlags: string
}

export type RegionDatabaseConf = {
  driver: string
  connectionUri: string
  controlConnectionUri: string
}

export type RegionGatewayConf = {
  driver: string
  runtimeDomain: string
  websiteDomain: string
  port: number
  apiUrl: string
  apiKey: string
}

export type RegionStorageConf = {
  driver: string
  domain: string
  externalEndpoint: string
  internalEndpoint: string
  accessKey: string
  secretKey: string
  controlEndpoint: string
}

export type LogServerConf = {
  apiUrl: string
  secret: string
  databaseUrl: string
}

export class Region {
  @ApiProperty({ type: String })
  _id?: ObjectId

  @ApiProperty()
  name: string

  @ApiProperty()
  displayName: string

  clusterConf: RegionClusterConf
  databaseConf: RegionDatabaseConf
  gatewayConf: RegionGatewayConf
  storageConf: RegionStorageConf
  logServerConf: LogServerConf

  @ApiProperty()
  tls: boolean

  @ApiProperty()
  state: 'Active' | 'Inactive'

  @ApiProperty()
  createdAt: Date

  @ApiProperty()
  updatedAt: Date

  constructor(partial: Partial<Region>) {
    Object.assign(this, partial)
  }
}
