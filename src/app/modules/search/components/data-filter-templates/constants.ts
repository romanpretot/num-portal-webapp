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

import { DialogAddTemplateComponent } from 'src/app/modules/projects/components/dialog-add-template/dialog-add-template.component'
import { DialogConfig } from '../../../../shared/models/dialog/dialog-config.interface'
import { DialogSize } from '../../../../shared/models/dialog/dialog-size.enum'

export const ADD_DIALOG_CONFIG: DialogConfig = {
  title: 'AVAILABLE_EHR_TEMPLATES',
  confirmButtonText: 'BUTTON.APPLY_SELECTION',
  cancelButtonText: 'BUTTON.CANCEL',
  dialogSize: DialogSize.Medium,
  dialogContentComponent: DialogAddTemplateComponent,

  dialogContentPayload: undefined,
}
