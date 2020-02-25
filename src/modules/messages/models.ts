

export const TYPE_MSG = 'msg';

export interface Msg {
  id:string,
  to:string, 
  from:string, 
  type:string, 
  messageType: string,
  message:string, 
  data: any
  replied?: {accepted: boolean, date:number},
  deleted?: boolean
}