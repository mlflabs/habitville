import { Subscription, BehaviorSubject, Subject } from "rxjs";
import { dataService } from "../data/dataService";
import { TYPE_MSG } from "./models";

export interface Message {
  from: string,
  message: string, 
  type: string,
}

export interface MessagesState {
  docs: Message[],
}

export const initMessageState = {
  docs: []
}



export class MessageService {
  private _subscription: Array<Subscription> = [];
  
  private _state: MessagesState = initMessageState;
  public state$ = new BehaviorSubject(this._state);
  public messages$ = new Subject<Message>()
  
  async init(){
    this.unsubscribe();
    
    const sub = dataService.subscribeChanges().subscribe(doc => {
      console.log(doc);
    });

    this._subscription.push(sub);

  }


  public async getGlobalPartyMessages() {
    const msgs = await dataService.queryByProperty('messageType', 'equals', 'messageType', TYPE_MSG );

    console.log(msgs);
    return msgs;
  }
 


  public unsubscribe() {
    if(!this) return;
    this._subscription.forEach(sub => {
      if(sub)
        sub.unsubscribe();
    });
  }

}

export const messageService = new MessageService();