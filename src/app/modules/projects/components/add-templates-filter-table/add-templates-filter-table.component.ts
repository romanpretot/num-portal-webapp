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

import {
  AfterViewInit,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  SimpleChanges,
  ViewChild,
} from '@angular/core'
import { MatTableDataSource } from '@angular/material/table'
import { Subscription } from 'rxjs'
import { TemplateService } from 'src/app/core/services/template/template.service'
import { IProjectTemplateInfoApi } from 'src/app/shared/models/project/project-template-info-api.interface'
import { ITemplateMetaDataApi } from 'src/app/shared/models/template/template-api.interface'
import { MatPaginator } from '@angular/material/paginator'

@Component({
  selector: 'num-add-templates-filter-table',
  templateUrl: './add-templates-filter-table.component.html',
  styleUrls: ['./add-templates-filter-table.component.scss'],
})
export class AddTemplatesFilterTableComponent
  implements OnInit, OnDestroy, OnChanges, AfterViewInit
{
  private subscriptions = new Subscription()
  @ViewChild(MatPaginator) paginator: MatPaginator
  @Input() selectedTemplates: IProjectTemplateInfoApi[]
  @Output() selectedTemplatesChange = new EventEmitter<IProjectTemplateInfoApi[]>()

  constructor(private templateService: TemplateService) {}
  dataSource = new MatTableDataSource<ITemplateMetaDataApi>()
  displayedColumns: string[] = ['name', 'icon']
  lookupSelectedTemplates: { [id: number]: boolean } = {}

  ngOnInit(): void {
    this.subscriptions.add(
      this.templateService.filteredTemplatesObservable$.subscribe((templates) =>
        this.handleData(templates)
      )
    )
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe()
  }

  ngOnChanges(changes: SimpleChanges): void {
    for (const propName in changes) {
      if (changes.hasOwnProperty(propName)) {
        switch (propName) {
          case 'selectedTemplates': {
            const changedData = changes[propName].currentValue as IProjectTemplateInfoApi[]
            const selectedTemplates: { [id: number]: boolean } = {}
            changedData.forEach(
              (selectedTemplate) => (selectedTemplates[selectedTemplate.templateId] = true)
            )
            this.lookupSelectedTemplates = selectedTemplates
          }
        }
      }
    }
  }

  handleData(templates: ITemplateMetaDataApi[]): void {
    this.dataSource.data = templates
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator
  }

  handleSelectClick(row: ITemplateMetaDataApi): void {
    this.lookupSelectedTemplates[row.templateId] = true
    const projectTemplate: IProjectTemplateInfoApi = {
      templateId: row.templateId,
      name: row.name,
    }
    this.selectedTemplatesChange.emit([...this.selectedTemplates, projectTemplate])
  }

  handleDeselectClick(row: ITemplateMetaDataApi): void {
    const newSelection = this.selectedTemplates.filter(
      (selectedTemplate) => selectedTemplate.templateId !== row.templateId
    )
    this.lookupSelectedTemplates[row.templateId] = false
    this.selectedTemplatesChange.emit(newSelection)
  }
}
