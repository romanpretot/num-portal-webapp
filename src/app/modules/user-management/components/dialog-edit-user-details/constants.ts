import { IToastMessageConfig } from 'src/app/shared/models/toast-message-config.interface'
import { ToastMessageType } from 'src/app/shared/models/toast-message-type.enum'

export const EDIT_USER_SUCCESS: IToastMessageConfig = {
  message: 'USER_MANAGEMENT.EDIT_USER_SUCCESS',
  type: ToastMessageType.Success,
}

export const EDIT_USER_ERROR: IToastMessageConfig = {
  message: 'USER_MANAGEMENT.EDIT_USER_ERROR',
  type: ToastMessageType.Error,
}
