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
import { ToastMessageService } from 'src/app/core/services/toast-message/toast-message.service'

// Services
import { AqlCategoryService } from 'src/app/core/services/aql-category/aql-category.service'
import { DialogService } from 'src/app/core/services/dialog/dialog.service'

// Data models
import { AvailableRoles } from 'src/app/shared/models/available-roles.enum'
import { IAqlCategoryApi } from 'src/app/shared/models/aql/category/aql-category.interface'
import { ToastMessageType } from 'src/app/shared/models/toast-message-type.enum'

// Constants
import { EDIT_AQL_CATEGORY_DIALOG_CONFIG } from './constants'
import { Subscription } from 'rxjs'

@Component({
  selector: 'num-aql-categories-management',
  templateUrl: './aql-categories-management.component.html',
  styleUrls: ['./aql-categories-management.component.scss'],
})
export class AqlCategoriesManagementComponent implements OnDestroy, OnInit {
  availableRoles = AvailableRoles

  private subscriptions = new Subscription()

  constructor(
    private aqlCategoryService: AqlCategoryService,
    private dialogService: DialogService,
    private toast: ToastMessageService
  ) {}

  ngOnInit(): void {
    this.subscriptions.add(this.aqlCategoryService.getAll().subscribe())
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe()
  }

  handleOpenEditDialog(categoryData?: IAqlCategoryApi): void {
    const dialogData = !!categoryData ? categoryData : {}
    const dialogRef = this.dialogService.openDialog({
      ...EDIT_AQL_CATEGORY_DIALOG_CONFIG,
      dialogContentPayload: { aqlCategory: dialogData },
    })
    dialogRef.afterClosed().subscribe(async (result?: Omit<IAqlCategoryApi, 'id'>) => {
      if (!!result) {
        if (!!categoryData) {
          await this.update(result, categoryData.id)
        } else {
          await this.create(result)
        }
      }
    })
  }

  async create(data: Omit<IAqlCategoryApi, 'id'>): Promise<void> {
    try {
      await this.aqlCategoryService.save(data).toPromise()

      this.toast.openToast({
        type: ToastMessageType.Success,
        message: 'QUERY_CATEGORIES.CREATE_SUCCESS_MESSAGE',
      })
    } catch (error) {
      this.toast.openToast({
        type: ToastMessageType.Error,
        message: 'QUERY_CATEGORIES.CREATE_ERROR_MESSAGE',
      })
    }
  }

  async update(data: Omit<IAqlCategoryApi, 'id'>, id: number): Promise<void> {
    try {
      await this.aqlCategoryService.update(data, id).toPromise()

      this.toast.openToast({
        type: ToastMessageType.Success,
        message: 'QUERY_CATEGORIES.UPDATE_SUCCESS_MESSAGE',
      })
    } catch (error) {
      this.toast.openToast({
        type: ToastMessageType.Error,
        message: 'QUERY_CATEGORIES.UPDATE_ERROR_MESSAGE',
      })
    }
  }
}
