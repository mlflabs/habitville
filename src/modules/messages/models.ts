

export interface Msg {
  id:string,
  to:string, 
  from:string, 
  type:string, 
  message:string, 
  data: any
  replied?: {accepted: boolean, date:number},
  deleted?: boolean
}