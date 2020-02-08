import { Subscription, BehaviorSubject } from "rxjs";
import { PartyProject } from "./models";
import { getPostRequest, post } from '../ajax/ajax';
import { env } from "../../env";
import { AuthService, authService } from '../auth/authService';
import { loadingService } from "../loading/loadingService";
import { toastService, ToastType } from "../toast/toastService";
import { dataService } from "../data/dataService";
import { waitMS } from '../data/utilsData';
import { saveIntoArray, saveIntoDocList } from '../../utils';
import { Msg } from "../messages/models";

export interface PartyState {
  docs: PartyProject[],
}

export const initPartyState = {
  docs: []
}



export class PartyService {
  private _subscription: Array<Subscription> = [];
  
  private _state: PartyState = initPartyState;
  public state$ = new BehaviorSubject(this._state);
  
  async init(userId:string, token: string){
    this.unsubscribe();


    const sub1 = dataService.subscribeChanges().subscribe(doc => {
      console.log(doc);
      if(doc.type === 'party'){
        const docs = saveIntoDocList(doc, this._state.docs);
        this.state = {...this._state, ...{docs}};
      }
    });

    const docs = await  dataService.findDocsByProperty('party', 'type');
    this.state = {...this._state , ...{docs}};


  }

  /*
    Rights, each digit represents different right
    0.  0 - Not admin 1- Admin, can change everything
    1.  (Project item) 0 - can't see, 1 - can see, 2 - can edit
    2.  (Project children) 0 - can't see, 1 - can see own, 2 - can see all items
    3.  (Project children edit) 0 -can't edit, 1 can edit/make own, 2 can edit all 
  */
  public async addUser(id:string, party: PartyProject) {
    try {
      const res = await post(getPostRequest(env.AUTH_API_URL +'/channels/sendAddMemberRequest',
                      { token: authService.getToken(), 
                        projectid: party._id,
                        channel: party.channel,
                        id: id,
                        rights: '0121' //see all, edit own items 
                      }), 
                      true, 'Adding member, please wait');
      console.log(res);

      if(!res.success){
        return toastService.printServerErrors(res);
      }

      toastService.showMessage('Member invitation sent', ToastType.success);

      waitMS(3000);

      dataService.addSyncCall$.next();

    }
    catch (e) {
      console.log(e);
    }
    
  }

  public save(partyProject: PartyProject){
    if (!partyProject._id) {
      this._createParty(partyProject);
    }
  }

  //make new party ajax
  private async _createParty(partyProject: PartyProject) {
    loadingService.showLoading('Creating party, please wait');
    const res = await post(getPostRequest(env.AUTH_API_URL +'/channels/addNewChannel',
                      {token: authService.getToken(), name: partyProject.name}, {} ),  false) ;
    console.log(res);
    if(!res.success){
      loadingService.hideLoading();
      return toastService.printServerErrors(res);
    }

    if(!res.data || !res.data.channel)
      return toastService.showMessage('Not able to create party, please try again.')

    const channel = res.data.channel;
    partyProject.channel = channel;

    //reload token
    let gotNewRightsToken = false;
    let tokenres;
    while(!gotNewRightsToken){
      tokenres = await authService.renewToken();
      console.log('Token Res::::::: ', tokenres);
      console.log(authService.getUser());

      const user = authService.getUser();
      if(user.channels[channel]){
        gotNewRightsToken = true;
      }
      else {
        await waitMS(2000);
      }
    }
    

    if(!tokenres){
      return toastService.showMessage('Not able to create party, please try again.')
    }

    if(!partyProject.members) partyProject.members = [];
    partyProject.members.push({id: authService.getUser().id, 
          rights: '1000',
          username: authService.getUser().username});
    partyProject.creator = authService.getUser().id;
    
    //now we can create our party
    await waitMS(500);
    dataService.saveNewProject(partyProject, channel)
  }


  public async acceptPartyInvitation(msg:Msg){
    //lets send a request
    try {
      const res = await post(getPostRequest(env.AUTH_API_URL +'/channels/acceptChannelInvitation',
                      { token: authService.getToken(), msgId: msg._id,}, {} ), 
                      true, 'Accept Request sent, waiting for reply.');
      console.log(res);

      if(!res.success){
        return toastService.printServerErrors(res);
      }

      toastService.showMessage('Pary Membership request sent. Please wait for app update.', ToastType.success);

      await waitMS(2000);

      dataService.addSyncCall$.next();

      msg.replied = {accepted: true, date: Date.now()};
      dataService.save(msg);
    }
    catch (e) {
      console.log(e);
    }



   
  }

  public async rejectPartyInviation(msg:Msg) {
    const newMsg = {...msg, ...{replied:{accepted: false, date: Date.now()}}}
    dataService.save(newMsg);
  }


  public get state(): PartyState {
    return this._state;
  }
  public set state(value: PartyState) {
    console.log('State: ', value);
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

export const partyService = new PartyService();