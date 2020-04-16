

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


export const newMessage = ( message, 
                            messageType="event",
                            messageSubType="",
                            data={}): MessageItem => {
  return {
    message,
    messageType,
    messageSubType,
    data
  }

}

export class MessageItem {
  id?:string;
  to?:string; 
  from?:string; 
  type?:string; 
  messageType?: string;
  messageSubType?: string;
  message?:string;
  data?: any
  replied?: {accepted: boolean, date:number};
  deleted?: boolean


  constructor(values: Object = {}) {
    Object.assign(this, values);
  }
}