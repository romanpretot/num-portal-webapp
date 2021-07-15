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
import { HttpClient, HttpErrorResponse } from '@angular/common/http'
import { of, throwError } from 'rxjs'
import { AppConfigService } from 'src/app/config/app-config.service'
import { ConnectorNodeType } from 'src/app/shared/models/connector-node-type.enum'
import { ICohortApi } from 'src/app/shared/models/project/cohort-api.interface'
import { ICohortGroupApi } from 'src/app/shared/models/project/cohort-group-api.interface'
import { ProjectUiModel } from 'src/app/shared/models/project/project-ui.model'
import { mockAql1 } from 'src/mocks/data-mocks/aqls.mock'
import { mockCohort1 } from 'src/mocks/data-mocks/cohorts.mock'
import { mockResultFlatList } from 'src/mocks/data-mocks/result-set-mock'

import { PatientFilterService } from './patient-filter.service'

describe('PatientFilterService', () => {
  let service: PatientFilterService
  const baseUrl = 'localhost/api/aql'
  const patientQueryBody = {
    query: 'SELECT e/ehr_id/value as ehrId FROM EHR e WHERE EXISTS e/ehr_id/value',
  }

  const httpClient = ({
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
  } as unknown) as HttpClient

  const appConfig = {
    config: {
      api: {
        baseUrl: 'localhost/api',
      },
    },
  } as AppConfigService

  beforeEach(() => {
    jest.clearAllMocks()
    jest.spyOn(httpClient, 'post').mockImplementation(() => of())
    service = new PatientFilterService(appConfig, httpClient)
  })

  it('should be created', () => {
    expect(service).toBeTruthy()
  })

  describe('When a call to getAllDatasetCount method comes in', () => {
    it('should call the api - with success', (done) => {
      jest.spyOn(httpClient, 'post').mockImplementation(() => of(200))
      service.getAllDatasetCount().subscribe()
      expect(httpClient.post).toHaveBeenCalledWith(`${baseUrl}/size`, patientQueryBody)
      service.totalDatasetCountObservable$.subscribe((datasetsCount) => {
        expect(datasetsCount).toEqual(200)
        done()
      })
    })
    it(`should call the api - with error`, () => {
      jest.spyOn(service, 'handleError')
      jest.spyOn(httpClient, 'post').mockImplementationOnce(() => throwError('Error'))
      service
        .getAllDatasetCount()
        .toPromise()
        .then((_) => {})
        .catch((_) => {})
      expect(httpClient.post).toHaveBeenCalledWith(`${baseUrl}/size`, patientQueryBody)
      expect(service.handleError).toHaveBeenCalled()
    })
  })

  describe('When a call to getPreviewData method comes in', () => {
    const cohortGroup: ICohortGroupApi = {
      type: ConnectorNodeType.Group,
      children: [
        {
          type: ConnectorNodeType.Aql,
          query: mockAql1,
        },
      ],
    }
    it('should call the api - with success', (done) => {
      jest.spyOn(httpClient, 'post').mockImplementation(() => of('result'))
      service.getPreviewData(cohortGroup, false).subscribe()
      expect(httpClient.post).toHaveBeenCalledWith(
        'localhost/api/cohort/size/distribution?allowUsageOutsideEu=false',

        cohortGroup
      )
      service.previewDataObservable$.subscribe((data) => {
        expect(data).toEqual('result')
        done()
      })
    })

    it(`should call the api - with error`, () => {
      jest.spyOn(service, 'handleError')
      jest.spyOn(httpClient, 'post').mockImplementationOnce(() => throwError('Error'))
      service
        .getPreviewData(cohortGroup)
        .toPromise()
        .then((_) => {})
        .catch((_) => {})
      expect(httpClient.post).toHaveBeenCalledWith(
        'localhost/api/cohort/size/distribution?allowUsageOutsideEu=true',
        cohortGroup
      )
      expect(service.handleError).toHaveBeenCalled()
    })
  })

  describe('When a call to getProjectData comes in', () => {
    const query = 'SELECT test FROM test'
    const templates = ['Test 1', 'Test 2']

    it('should call the backend - with success', () => {
      jest.spyOn(httpClient, 'post').mockImplementation(() => of(mockResultFlatList))
      service.getProjectData(query, mockCohort1, templates).subscribe()
      expect(httpClient.post).toHaveBeenCalledWith('localhost/api/project/manager/execute', {
        query,
        cohort: mockCohort1,
        templates,
      })
    })

    it('should call the backend - with error', () => {
      jest
        .spyOn(httpClient, 'post')
        .mockImplementation(() => throwError(new HttpErrorResponse({ status: 400 })))
      jest.spyOn(service, 'handleError')
      service
        .getProjectData(query, mockCohort1, templates)
        .toPromise()
        .then(() => {})
        .catch(() => {})
      expect(httpClient.post).toHaveBeenCalledWith('localhost/api/project/manager/execute', {
        query,
        cohort: mockCohort1,
        templates,
      })
      expect(service.handleError).toHaveBeenCalled()
    })
  })

  describe('When the current project is supposed to be provided', () => {
    it('should provide the current project if its there', (done) => {
      const project = new ProjectUiModel()
      project.id = 123
      service.setCurrentProject(project)
      service.getCurrentProject().subscribe((providedProject) => {
        expect(providedProject.id).toEqual(project.id)
        done()
      })
    })

    it('should throw if there is no current project', (done) => {
      const project = new ProjectUiModel()
      service.setCurrentProject(project)
      service.resetCurrentProject()
      service.getCurrentProject().subscribe(
        (_) => {},
        (error) => {
          expect(error).toBeDefined()
          done()
        }
      )
    })
  })
})
