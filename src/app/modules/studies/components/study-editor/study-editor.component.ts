import { Component, OnDestroy, OnInit } from '@angular/core'
import { FormControl, FormGroup, Validators } from '@angular/forms'
import { ActivatedRoute, Params, Router } from '@angular/router'
import { CohortService } from 'src/app/core/services/cohort.service'
import { StudyService } from 'src/app/core/services/study.service'
import { ICohortApi } from 'src/app/shared/models/study/cohort-api.interface'
import { CohortGroupUiModel } from 'src/app/shared/models/study/cohort-group-ui.model'
import { IStudyApi } from 'src/app/shared/models/study/study-api.interface'
import { StudyStatus } from 'src/app/shared/models/study/study-status.enum'
import { StudyUiModel } from 'src/app/shared/models/study/study-ui.model'
import { IStudyResolved } from '../../study-resolved.interface'
import { AdminService } from 'src/app/core/services/admin.service'
import { IDefinitionList } from '../../../../shared/models/definition-list.interface'
import { Subscription } from 'rxjs'
import { StudyMenuKeys } from '../studies-table/menu-items'
import { PossibleStudyEditorMode } from 'src/app/shared/models/study/possible-study-editor-mode.enum'

@Component({
  selector: 'num-study-editor',
  templateUrl: './study-editor.component.html',
  styleUrls: ['./study-editor.component.scss'],
})
export class StudyEditorComponent implements OnInit, OnDestroy {
  private subscriptions = new Subscription()
  mode: PossibleStudyEditorMode
  possibleModes = PossibleStudyEditorMode

  resolvedData: IStudyResolved
  isResearchersFetched: boolean
  isCohortsFetched: boolean

  isTemplatesDisabled: boolean
  isResearchersDisabled: boolean
  isGeneralInfoDisabled: boolean
  isConnectorDisabled: boolean

  generalInfoData: IDefinitionList[]
  get study(): StudyUiModel {
    return this.resolvedData.study
  }

  get cohortGroup(): CohortGroupUiModel {
    return this.study.cohortGroup
  }

  studyForm: FormGroup
  get formTitle(): FormControl {
    return this.studyForm.get('title') as FormControl
  }

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private studyService: StudyService,
    private cohortService: CohortService,
    private adminService: AdminService
  ) {}

  ngOnInit(): void {
    this.resolvedData = this.route.snapshot.data.resolvedData
    this.subscriptions.add(
      this.route.queryParams.subscribe((params) => this.handleQueryParams(params))
    )

    this.generateForm()
    this.fetchCohort()
    this.fetchResearcher()
    this.getGeneralInfoListData()
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe()
  }

  handleQueryParams(params: Params): void {
    const mode = ('' + params.mode).toUpperCase()
    if (mode in PossibleStudyEditorMode) {
      this.mode = PossibleStudyEditorMode[mode]
    } else if (this.study.id === null) {
      this.mode = PossibleStudyEditorMode.EDIT
    } else {
      this.mode = PossibleStudyEditorMode.PREVIEW
    }
    this.checkVisibility()
    document.querySelector('mat-sidenav-content').scrollTo(0, 0)
  }

  fetchCohort(): void {
    if (this.study.cohortId === null || this.study.cohortId === undefined) {
      this.isCohortsFetched = true
    } else {
      this.cohortService.get(this.study.cohortId).subscribe((cohortApi) => {
        this.study.addCohortGroup(cohortApi?.cohortGroup)
        this.isCohortsFetched = true
      })
    }
  }

  fetchResearcher(): void {
    const userIds = this.study.researchersApi.map((researcher) => researcher.userId)
    if (!userIds.length) {
      this.isResearchersFetched = true
    } else {
      this.adminService.getUsersByIds(userIds).subscribe((researchers) => {
        this.study.researchers = researchers
        this.isResearchersFetched = true
      })
    }
  }

  generateForm(): void {
    this.studyForm = new FormGroup({
      title: new FormControl(this.study?.name, [Validators.required, Validators.minLength(3)]),
      description: new FormControl(this.study?.description, [
        Validators.required,
        Validators.minLength(3),
      ]),
      firstHypotheses: new FormControl(this.study?.firstHypotheses, [
        Validators.required,
        Validators.minLength(3),
      ]),
      secondHypotheses: new FormControl(this.study?.secondHypotheses),
    })
  }

  getStudyForApi(): { study: IStudyApi; cohort: ICohortApi } {
    const id = this.study.id === 0 ? null : this.study.id
    const formValues = this.studyForm.value
    const { study, cohortGroup } = this.study.convertToApiInterface(
      id,
      formValues.title,
      formValues.description,
      formValues.firstHypotheses,
      formValues.secondHypotheses
    )
    const cohort: ICohortApi = {
      cohortGroup,
      id: study.cohortId || null,
      name: study.name,
      studyId: study.id,
      description: study.description,
    }

    return { study, cohort }
  }

  getGeneralInfoListData(): void {
    this.generalInfoData = [
      { title: 'FORM.TITLE', description: this.study?.name },
      { title: 'FORM.DESCRIPTION', description: this.study?.description },
      { title: 'FORM.FIRST_HYPOTHESES', description: this.study?.firstHypotheses },
      { title: 'FORM.SECOND_HYPOTHESES', description: this.study?.secondHypotheses },
    ]
  }

  saveCohort(cohort: ICohortApi): Promise<ICohortApi> {
    return this.cohortService.save(cohort).toPromise()
  }

  saveStudy(study: IStudyApi): Promise<IStudyApi> {
    if (study.id === null || study.id === undefined) {
      return this.studyService.create(study).toPromise()
    } else {
      return this.studyService.update(study, study.id).toPromise()
    }
  }

  startEdit(): void {
    const queryParams = { mode: PossibleStudyEditorMode.EDIT.toString().toLowerCase() }
    this.router.navigate(['studies', this.study.id, 'editor'], { queryParams })
  }

  async save(): Promise<void> {
    const { study, cohort } = this.getStudyForApi()
    try {
      const studyResult = await this.saveStudy(study)
      this.study.id = studyResult.id
      if (cohort.cohortGroup && (study.cohortId === null || study.cohortId === undefined)) {
        cohort.studyId = studyResult.id
        const cohortResult = await this.saveCohort(cohort)
        this.study.cohortId = cohortResult.id
      }
      // TODO: Display message to user
    } catch (error) {
      console.log(error)
      // TODO: Display message to user
    }
  }

  sendForApproval(): void {
    this.study.status = StudyStatus.Pending
    this.save()
  }

  saveResearchers(): void {
    this.save()
  }

  saveAsApprovalReply(): void {
    console.log('TODO: Implement Approval')
  }

  cancel(): void {
    this.router.navigate(['studies'])
  }

  checkVisibility(): void {
    const studyStatus = this.study.status
    const inPreview = this.mode === PossibleStudyEditorMode.PREVIEW
    const inReview = this.mode === PossibleStudyEditorMode.REVIEW
    const inEditByStatus = !(
      studyStatus !== StudyStatus.Draft && studyStatus !== StudyStatus.Change_request
    )

    if (inEditByStatus && !inPreview && !inReview) {
      this.isConnectorDisabled = false
      this.isGeneralInfoDisabled = false
      this.isTemplatesDisabled = false
      this.isResearchersDisabled = false
    } else {
      this.isConnectorDisabled = true
      this.isGeneralInfoDisabled = true
      this.isTemplatesDisabled = true
      this.isResearchersDisabled = true
    }

    if (studyStatus === StudyStatus.Approved && !inPreview && !inReview) {
      this.isResearchersDisabled = false
    }
  }
}
