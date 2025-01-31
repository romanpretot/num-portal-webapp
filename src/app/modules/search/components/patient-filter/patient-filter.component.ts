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
import { Component, OnDestroy, OnInit } from '@angular/core'
import { Router } from '@angular/router'
import { Observable, Subscription } from 'rxjs'
import { filter, map, take } from 'rxjs/operators'
import { CohortService } from 'src/app/core/services/cohort/cohort.service'
import { PatientFilterService } from 'src/app/core/services/patient-filter/patient-filter.service'
import { ProfileService } from 'src/app/core/services/profile/profile.service'
import { ToastMessageService } from 'src/app/core/services/toast-message/toast-message.service'
import { IDetermineHits } from 'src/app/shared/components/editor-determine-hits/determine-hits.interface'
import { AvailableRoles } from 'src/app/shared/models/available-roles.enum'
import { ICohortPreviewApi } from 'src/app/shared/models/cohort-preview.interface'
import { ICohortGroupApi } from 'src/app/shared/models/project/cohort-group-api.interface'
import { CohortGroupUiModel } from 'src/app/shared/models/project/cohort-group-ui.model'
import { ProjectUiModel } from 'src/app/shared/models/project/project-ui.model'
import { ToastMessageType } from 'src/app/shared/models/toast-message-type.enum'
import { IUserProfile } from 'src/app/shared/models/user/user-profile.interface'

@Component({
  selector: 'num-patient-filter',
  templateUrl: './patient-filter.component.html',
  styleUrls: ['./patient-filter.component.scss'],
})
export class PatientFilterComponent implements OnInit, OnDestroy {
  private subscriptions = new Subscription()
  userRoles: AvailableRoles[]
  determineHits: IDetermineHits = {
    defaultMessage: 'QUERIES.HITS.MESSAGE_SET_ALL_PARAMETERS',
    count: null,
  }
  patientCount$: Observable<number>
  previewData$: Observable<ICohortPreviewApi>
  project: ProjectUiModel

  get cohortNode(): CohortGroupUiModel {
    return this.project.cohortGroup
  }

  constructor(
    private patientFilterService: PatientFilterService,
    private router: Router,
    private toastMessageService: ToastMessageService,
    private cohortService: CohortService,
    private profileService: ProfileService
  ) {}

  ngOnInit(): void {
    this.setCurrentProject()
    this.patientCount$ = this.patientFilterService.totalDatasetCountObservable$
    this.previewData$ = this.patientFilterService.previewDataObservable$

    this.subscriptions.add(
      this.profileService.userProfileObservable$
        .pipe(
          filter((profile) => profile.id !== undefined),
          take(1),
          map((profile: IUserProfile) => {
            this.userRoles = profile.roles
          })
        )
        .subscribe()
    )

    this.patientFilterService.getAllDatasetCount().subscribe()
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe()
  }

  setCurrentProject(): void {
    this.patientFilterService.getCurrentProject().subscribe(
      (project) => {
        this.project = project
      },
      (_) => {
        this.project = new ProjectUiModel()
      }
    )
  }

  private updateDetermineHits(count?: number | null, message?: string, isLoading = false): void {
    this.determineHits = {
      defaultMessage: this.determineHits.defaultMessage,
      message,
      count,
      isLoading,
    }
  }

  async getPreviewData(): Promise<void> {
    if (!this.cohortNode) {
      this.updateDetermineHits(null, '')
    } else {
      try {
        this.updateDetermineHits(null, '', true)
        const cohortGroupApi: ICohortGroupApi = this.cohortNode.convertToApi()
        const count = await this.getCount(cohortGroupApi).toPromise()
        this.updateDetermineHits(count, '')
      } catch (error) {
        if (error.status === 451) {
          // *** Error 451 means too few hits ***
          this.updateDetermineHits(null, 'PROJECT.HITS.MESSAGE_ERROR_FEW_HITS')
        } else {
          this.updateDetermineHits(null, 'PROJECT.HITS.MESSAGE_ERROR_MESSAGE')
        }
        // Reset the preview data to hide graphs and reset hits counter
        this.patientFilterService.resetPreviewData()
      }
    }
  }

  getCount(cohortGroupApi: ICohortGroupApi): Observable<number> {
    if (this.userRoles.includes(AvailableRoles.Manager)) {
      return this.patientFilterService
        .getPreviewData(cohortGroupApi, false)
        .pipe(map((value) => value.count))
    } else {
      return this.cohortService.getSize(cohortGroupApi, false)
    }
  }

  goToDataFilter(): void {
    const { cohortGroup } = this.project.convertToApiInterface()
    if (cohortGroup) {
      this.patientFilterService.setCurrentProject(this.project)
      this.router.navigate(['search/data-filter'], {})
    } else {
      this.toastMessageService.openToast({
        type: ToastMessageType.Error,
        message: 'PROJECT.NO_QUERY_ERROR_MESSAGE',
      })
    }
  }
}
