

export interface Msg {
  _id:string,
  to:string, 
  from:string, 
  type:string, 
  message:string, 
  data: any
  replied?: {accepted: boolean, date:number},
  _deleted?: boolean
}