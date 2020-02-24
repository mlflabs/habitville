import { Subject } from 'rxjs';
import { ajaxResponse } from '../ajax/ajax';
import { toast } from 'react-toastify';

export interface ToastMessage {
  message: string,
  duration: number,
  key?: number,
}

export enum ToastType {
  default = "default", 
  info = "info", 
  success = "success", 
  warning = "warning", 
  error = "error"
}


export class ToastService {

  public messages$ = new Subject<ToastMessage>();

  showMessage(message: string, type:ToastType = ToastType.default, milliseconds: number = 3000) {
    toast(message, {
      type: type,
      autoClose: milliseconds,
    })
  }

  printSimpleError (msg:string, duration = 2000) {
    toast( msg, {type: ToastType.error, autoClose: duration})
  }

  //TODO: for now only prints the first error
  printServerErrors (res:ajaxResponse) {
    const errors = res.errors || [];
    if(errors.length > 0){
      errors.forEach(err => this.showMessage(err.msg, ToastType.error))
    }
  }



}
export const toastService = new ToastService();


