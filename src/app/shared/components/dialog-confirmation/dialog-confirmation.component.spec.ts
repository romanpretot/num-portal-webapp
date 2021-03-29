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

import { ComponentFixture, TestBed } from '@angular/core/testing'

import { DialogConfirmationComponent } from './dialog-confirmation.component'
import { TranslateModule } from '@ngx-translate/core'

describe('DialogConfirmationComponent', () => {
  let component: DialogConfirmationComponent
  let fixture: ComponentFixture<DialogConfirmationComponent>

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DialogConfirmationComponent],
      imports: [TranslateModule.forRoot()],
    }).compileComponents()
  })

  beforeEach(() => {
    fixture = TestBed.createComponent(DialogConfirmationComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })

  it('should emit the true on the close-emitter, when the user confirms', () => {
    jest.spyOn(component.closeDialog, 'emit')
    component.handleDialogConfirm()
    expect(component.closeDialog.emit).toHaveBeenCalledWith(true)
  })

  it('should emit the false on the close-emitter, when the user cancels', () => {
    jest.spyOn(component.closeDialog, 'emit')
    component.handleDialogCancel()
    expect(component.closeDialog.emit).toHaveBeenCalledWith(false)
  })
})
