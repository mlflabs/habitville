import { Subscription, BehaviorSubject } from "rxjs";
import { getPostRequest, post } from '../ajax/ajax';
import { env } from "../../env";
import { authService } from '../auth/authService';
import { toastService, ToastType } from "../toast/toastService";
import { dataService } from "../data/dataService";
import { waitMS } from '../data/utilsData';
import { Friend } from "./models";

export interface SocialState {
  friends: Friend[],
}

export const initSocialState = {
  friends: []
}



export class SocialService {
  private _subscription: Array<Subscription> = [];
  private _userid = ''
  private _state: SocialState = initSocialState;
  public state$ = new BehaviorSubject(this._state);
  
  async init(userid){
    if(userid === this._userid) return;
    this._userid = userid;
    this.unsubscribe();
    this._init();
  }

  private async _init() {

  }

  public async addFriend(username?:string) {
    try {
      const res = await post(getPostRequest(env.AUTH_API_URL +'/social/sendAddFriendRequest',
                      { token: authService.getToken(), 
                        username,
                      }), 
                      true, 'Sending invitatin request, please wait');
      if(!res.success){
        return toastService.printServerErrors(res);
      }

      toastService.showMessage('Friend invitation sent', ToastType.success);

      waitMS(3000);

      dataService.addSyncCall$.next();
    }
    catch (e) {
      console.log(e);
    }
    
  }


  public get state(): SocialState {
    return this._state;
  }
  public set state(value: SocialState) {
    this._state = value;
    this.state$.next(this._state);
  }



  public unsubscribe() {
    if(!this) return;
    this._subscription.forEach(sub => {
      if(sub)
        sub.unsubscribe();
    });
  }

}

export const socialService = new SocialService();