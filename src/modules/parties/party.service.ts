import { Subscription, BehaviorSubject } from "rxjs";
import { PartyProject, TYPE_PARTY, Challenge, ChallengeState } from "./models";
import { getPostRequest, post } from '../ajax/ajax';
import { env } from "../../env";
import { loadingService } from "../loading/loadingService";
import { toastService, ToastType } from "../toast/toastService";
import { dataService } from "../data/dataService";
import { waitMS, getChannelFromProjectId } from '../data/utilsData';
import { Msg, TYPE_MSG } from "../messages/models";
import moment from "moment";
import { saveIntoDocList } from "../../utils";
import ulog from 'ulog';
import { authService } from "../auth/authService";

const log = ulog('parties');

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
  
  async init(){
    this.unsubscribe();


    const sub1 = dataService.subscribeChanges().subscribe(doc => {
      if(doc.type === 'party' && doc.secondaryType === 'project'){
        const docs = saveIntoDocList(doc, this._state.docs);
        this.state = {...this._state, ...{docs}};
      }
    });
    this._subscription.push(sub1);
    const docs = await dataService.queryByProperty('secondaryType', 'equals', 'project', TYPE_PARTY);
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
                        channelid: getChannelFromProjectId(party.id),
                        id: id,
                        rights: '0121' //see all, edit own items 
                      }), 
                      true, 'Adding member, please wait');

      if(!res.success){
        return toastService.printServerErrors(res);
      }

      toastService.showMessage('Member invitation sent', ToastType.success);
      waitMS(3000);
      dataService.addSyncCall$.next();
    }
    catch (e) {
      log.error(e);
    }
    
  }

  public saveParty(partyProject: PartyProject){
    if (!partyProject.id) {
      this._createParty(partyProject);
    }
  }

  //make new party ajax
  private async _createParty(partyProject: PartyProject) {
    log.info('Saving party Project::: ', partyProject);
    loadingService.showLoading('Creating party, please wait, ' +
                'internet connection required');
    const res = await dataService.saveNewProject(partyProject, TYPE_PARTY);
    if(!res.success){
      return toastService.printServerErrors(res);
    } 
    loadingService.hideLoading();
  }

  public saveChallenge(challenge:Challenge, party:PartyProject){
    if(!challenge.id) {
      this._createChallenge(challenge, party);
    }
  }

  private async _createChallenge(challenge:Challenge, partyProject: PartyProject) {
    log.info('Saving System Doc::: ', partyProject);
    loadingService.showLoading('Adding Challenge, please wait, ' +
                'internet connection required');
    const res = await dataService.saveSystemDoc(challenge,partyProject, TYPE_PARTY);
    if(!res.success){
      return toastService.printServerErrors(res);
    }
    loadingService.hideLoading();
  }


  public async acceptPartyInvitation(msg:Msg){
    //lets send a request
    try {
      const res = await post(getPostRequest(env.AUTH_API_URL +'/channels/acceptChannelInvitation',
                      { token: authService.getToken(), msgId: msg.id,}, {} ), 
                      true, 'Accept Reply sent, waiting for reply.');
      if(!res.success){
        return toastService.printServerErrors(res);
      }

      toastService.showMessage('Pary Membership request sent. Please wait for app update.', ToastType.success);
      await waitMS(2000);
      dataService.addSyncCall$.next();
      msg.replied = {accepted: true, date: Date.now()};
      dataService.save(msg, TYPE_MSG);
    }
    catch (e) {
      log.error(e);
    }
  }

  public async acceptFriendInvitation(msg:Msg){
    //lets send a request
    try {
      const res = await post(getPostRequest(env.AUTH_API_URL +'/social/acceptFriendInvitation',
                      { token: authService.getToken(), msgId: msg.id,}, {} ), 
                      true, 'Accept Reply sent, waiting for reply.');
      if(!res.success){
        return toastService.printServerErrors(res);
      }

      toastService.showMessage('Friend acceptance reply sent. Please wait for app update.', 
        ToastType.success);

      await waitMS(2000);

      dataService.addSyncCall$.next();

      msg.replied = {accepted: true, date: Date.now()};
      dataService.save(msg, TYPE_MSG);
    }
    catch (e) {
      log.error(e);
    }
  }

  public async rejectPartyInviation(msg:Msg) {
    const newMsg = {...msg, ...{replied:{accepted: false, date: Date.now()}}}
    dataService.save(newMsg, TYPE_MSG);
  }

  public async rejectFriendInviation(msg:Msg) {
    const newMsg = {...msg, ...{replied:{accepted: false, date: Date.now()}}}
    dataService.save(newMsg, TYPE_MSG);
  }

  public async changeChallengeState(challengeid: string|undefined, state:ChallengeState){
    if(!challengeid) throw new Error('Challengeid cannot be undefined');
    try {
      const res = await post(getPostRequest(env.AUTH_API_URL +'/habits/changeChallengeState',
                      { token: authService.getToken(), 
                        challengeid, state}, {} ), 
                      true, 'Saving challenge, please wait.');
      if(!res.success){
        return toastService.printServerErrors(res);
      }
      await dataService.saveFromServer(res.data.doc, TYPE_PARTY);

      toastService.showMessage('Challenge saved.', 
        ToastType.success);

      await waitMS(2000);
      dataService.addSyncCall$.next();
      await waitMS(2000);
      dataService.addSyncCall$.next();
    }
    catch (e) {
      log.error(e);
    }
  }

  public async submitChallengeActions(challengeid: string|undefined, value:number){
    if(!challengeid) throw new Error('Challengeid cannot be undefined');
    try {
      const actions = [{date: moment().format(env.MOMENT_DATE_FORMAT), value}]
      const res = await post(getPostRequest(env.AUTH_API_URL +'/habits/submitChallengeActions',
                      { token: authService.getToken(), 
                        challengeid, actions}, {} ), 
                      true, 'Saving challenge, please wait.');
      if(!res.success){
        return toastService.printServerErrors(res);
      }
      log.trace(res);
      
      if(res.data && res.data.challenge)
        dataService.saveFromServer(res.data.challenge, TYPE_PARTY);

      if(res.data && res.data.rewards)
        toastService.showMessage('You have recieved '+res.data.rewards+' points', 
          ToastType.success);
      await waitMS(2000);
      dataService.addSyncCall$.next();
      await waitMS(2000);
      dataService.addSyncCall$.next();
    }
    catch (e) {
      log.error(e);
    }
  }

  public async acceptChallenge(challenge:Challenge){
    //lets send a request
    try {
      const res = await post(getPostRequest(env.AUTH_API_URL +'/habits/acceptChallenge',
                      { token: authService.getToken(), challengeid: challenge.id}, {} ), 
                      true, 'Accept Reply sent, waiting for reply.');
      if(!res.success){
        return toastService.printServerErrors(res);
      }

      toastService.showMessage('Challenge acceptance request sent. Please wait for update.', 
        ToastType.success);
      await waitMS(2000);
      dataService.addSyncCall$.next();
    }
    catch (e) {
      log.error(e);
    }
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