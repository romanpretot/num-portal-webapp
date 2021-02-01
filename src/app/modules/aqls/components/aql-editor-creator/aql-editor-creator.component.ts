import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core'
import { AqlEditorService } from 'src/app/core/services/aql-editor/aql-editor.service'
import { DialogService } from 'src/app/core/services/dialog/dialog.service'
import { DialogConfig } from 'src/app/shared/models/dialog/dialog-config.interface'
import { AqbUiModel } from '../../models/aqb/aqb-ui.model'
import { DialogAqlBuilderComponent } from '../dialog-aql-builder/dialog-aql-builder.component'
import { BUILDER_DIALOG_CONFIG } from './constants'

@Component({
  selector: 'num-aql-editor-creator',
  templateUrl: './aql-editor-creator.component.html',
  styleUrls: ['./aql-editor-creator.component.scss'],
})
export class AqlEditorCeatorComponent implements OnInit {
  constructor(private dialogService: DialogService, private aqlEditorService: AqlEditorService) {}

  isValidForExecution: boolean

  aqlQueryValue: string
  @Output() aqlQueryChange = new EventEmitter<string>()
  @Input()
  get aqlQuery(): string {
    return this.aqlQueryValue
  }
  set aqlQuery(aqlQuery: string) {
    this.aqlQueryValue = aqlQuery
    this.aqlQueryChange.emit(aqlQuery)
    this.isValidForExecution = this.validateExecution(aqlQuery)
  }

  @Input()
  isExecutionReady: boolean

  @Output() execute = new EventEmitter()

  editor: monaco.editor.IStandaloneCodeEditor
  aqbModel = new AqbUiModel()

  ngOnInit(): void {}

  onEditorInit(editor: monaco.editor.IStandaloneCodeEditor): void {
    this.editor = editor
  }

  validateExecution(query: string): boolean {
    const queryToCheck = query.toUpperCase()
    return (
      queryToCheck.length > 25 &&
      queryToCheck.includes('SELECT') &&
      queryToCheck.includes('FROM') &&
      queryToCheck.includes('CONTAINS') &&
      queryToCheck.includes('COMPOSITION')
    )
  }

  openBuilderDialog(): void {
    const dialogConfig: DialogConfig = {
      ...BUILDER_DIALOG_CONFIG,
      dialogContentComponent: DialogAqlBuilderComponent,
      dialogContentPayload: this.aqbModel,
    }

    const dialogRef = this.dialogService.openDialog(dialogConfig)

    dialogRef.afterClosed().subscribe((confirmResult: AqbUiModel | undefined) => {
      if (confirmResult instanceof AqbUiModel) {
        this.handleDialogConfirm(confirmResult)
      }
    })
  }

  handleDialogConfirm(aqbModel: AqbUiModel): void {
    this.aqbModel = aqbModel
    const aqbApiModel = aqbModel.convertToApi()
    this.aqlEditorService.buildAql(aqbApiModel).subscribe((result) => {
      this.aqlQuery = result.q
    })
  }
}
