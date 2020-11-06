import { IAql } from 'src/app/shared/models/aql/aql.interface'
import { LogicalOperator } from 'src/app/shared/models/logical-operator.enum'
import { PhenotypeQueryType } from 'src/app/shared/models/phenotype/phenotype-query-type.enum'

export interface IPhenotypeQuery {
  type: PhenotypeQueryType
  operator?: LogicalOperator.And | LogicalOperator.Or
  isNegated: boolean
  children?: IPhenotypeQuery[]
  indexInGroup?: number
  aql?: IAql
}
