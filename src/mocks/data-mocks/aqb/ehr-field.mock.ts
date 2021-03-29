/**
 * Copyright 2021 Vitagroup AG
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { IArchetypeQueryBuilder } from 'src/app/shared/models/archetype-query-builder/archetype-query-builder.interface'
import { AqbNodeType } from 'src/app/shared/models/archetype-query-builder/builder-request/aqb-node-type.enum'
import { AqbSelectTopDirection } from 'src/app/shared/models/archetype-query-builder/builder-request/aqb-select-top-direction.enum'

export const mockEhrField: IArchetypeQueryBuilder = {
  select: {
    topCount: 13,
    topDirection: AqbSelectTopDirection.Forward,
    statement: [
      {
        _type: AqbNodeType.SelectField,
        containmentId: 1,
        name: 'Bericht ID::value',
        aqlPath: '/context/other_context[at0001]/items[at0002]/value/value',
      },
      {
        _type: AqbNodeType.SelectField,
        containmentId: 0,
        name: 'ehr_id',
        aqlPath: '/ehr_id/value',
      },
    ],
  },
  ehr: {
    containmentId: 0,
  },
  contains: {
    _type: AqbNodeType.Containment,
    id: 1,
    archetypeId: 'openEHR-EHR-COMPOSITION.report.v1',
  },
}
