import { Subject } from 'rxjs';
import { ajaxResponse } from '../ajax/ajax';
import { toast, Type } from 'react-toastify';
import { totalmem } from 'os';

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

  //TODO: for now only prints the first error
  printServerErrors (res:ajaxResponse) {
    const errors = res.errors || [];
    if(errors.length > 0){
      errors.forEach(err => this.showMessage(err.msg, ToastType.error))
    }
  }



}
export const toastService = new ToastService();


