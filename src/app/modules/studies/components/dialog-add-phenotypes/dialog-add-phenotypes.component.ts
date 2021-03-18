import { Component, EventEmitter, OnDestroy, OnInit, Output } from '@angular/core'
import { Subscription } from 'rxjs'
import { take } from 'rxjs/operators'
import { PhenotypeService } from 'src/app/core/services/phenotype/phenotype.service'
import { IGenericDialog } from 'src/app/shared/models/generic-dialog.interface'
import { IPhenotypeFilter } from 'src/app/shared/models/phenotype/phenotype-filter.interface'
import { PhenotypeUiModel } from 'src/app/shared/models/phenotype/phenotype-ui.model'

@Component({
  selector: 'num-dialog-add-phenotypes',
  templateUrl: './dialog-add-phenotypes.component.html',
  styleUrls: ['./dialog-add-phenotypes.component.scss'],
})
export class DialogAddPhenotypesComponent
  implements OnInit, OnDestroy, IGenericDialog<PhenotypeUiModel[]> {
  @Output() closeDialog = new EventEmitter()

  filterConfig: IPhenotypeFilter
  dialogInput: PhenotypeUiModel[] = []
  phenotypePreview: PhenotypeUiModel
  private subscriptions = new Subscription()

  constructor(private phenotypeService: PhenotypeService) {
    this.phenotypeService.filterConfigObservable$
      .pipe(take(1))
      .subscribe((config) => (this.filterConfig = config))
  }

  ngOnInit(): void {
    this.subscriptions.add(this.phenotypeService.getAll().subscribe())
  }

  handlePreviewClick(phenotype: PhenotypeUiModel): void {
    this.phenotypePreview = phenotype
  }

  handleSearchChange(): void {
    this.phenotypeService.setFilter(this.filterConfig)
  }

  handleDialogConfirm(): void {
    this.closeDialog.emit(this.dialogInput)
  }

  handleDialogCancel(): void {
    this.closeDialog.emit()
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe()
  }
}
