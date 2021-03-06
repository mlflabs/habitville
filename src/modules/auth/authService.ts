
import { BehaviorSubject, Subject } from 'rxjs';
import * as moment from 'moment';
import { isEqual } from 'lodash';
import localStorageService from '../localStorage/localStorageService';
import {env} from '../../env';
import  { getPostRequest, post, ajaxResponse } from '../ajax/ajax';
import { toastService } from '../toast/toastService';
import ulog from 'ulog';

const log =  ulog('auth');

export enum AuthStatus {
  Loading, 
  Guest, //not loged in
  User // loged in
}

export const GUEST = 'Guest';
export const AUTH_USER_KEY = 'auth-user-key';
export interface AuthEvent {
  success: boolean;
  code: number;
  data: any;
}

export interface User {
  id: string,
  username: string;
  email: string|null;
  token: string|null;
  token_expiery: number|null;
  access: any[];
}



export const getUser = (values: any):User => {
  if(values == null)
    return {
      id: 'guest',
      username: GUEST,
      email: null,
      token: null,
      token_expiery: null,
      access: []
    }

  return {
    id: values.id || 'guest',
    username: values.username || GUEST,
    email: values.email||null,
    token: values.token||null,
    token_expiery: values.token_expiery||values.expires||null,
    access: values.access || []
  }
}

export const isGuest = (user:User) => {
  return user.username === GUEST;
}

export function getGuestUser(username:string = 'Guest'):User {
  return getUser({ username });
}


export class AuthService {
  private _user:User = getGuestUser('null');
  private _authStatus = AuthStatus.Loading;
  public authStatus$ = new BehaviorSubject(this._authStatus);
  public username$ = new Subject<string>();

  constructor() {
    this.loadAuth();
  }

  getIsAuthenticated():boolean { return this._authStatus === AuthStatus.User; }
  getUsername() { return this._user.username; }
  getEmail() { return this._user.email;}
  getUser() { return this._user };


  async updateUser(user: User, forceLogout = false) {
    // log.info('Userupdate: ', user, forceLogout, this._authStatus);
    log.info('Update User:: ', user);
    if(!isGuest(user) || this._user.username ==='null') {

      if(this._authStatus !== AuthStatus.User) {
        this.setAuthStatus(AuthStatus.User);
      }

      if(user.username !== this._user.username){
        this._user = user;
        await localStorageService.setObject(AUTH_USER_KEY, user)
        this.username$.next(user.username);
      }
      if(!isEqual(this._user, user)) {
        log.info('New user object, save it', user);
        this._user = user;
        await localStorageService.setObject(AUTH_USER_KEY, user)
      }
      
      return;
    }

    if(this._authStatus !== AuthStatus.Guest){
      this.setAuthStatus(AuthStatus.Guest)
  
      if(forceLogout){
        await localStorageService.setObject(AUTH_USER_KEY, getGuestUser);
      }
    }
  }




  async loadAuth() {
    try {
      const user = getUser(await localStorageService.getObject(AUTH_USER_KEY));
      log.info('LOADED USER', user);

      if(!user.token || !user.token_expiery) {
        return this.updateUser(getGuestUser());
      }
      const exp = moment.unix(user.token_expiery);
      if(exp.isAfter(moment.now())) {
        return this.updateUser(user);
      }
      else {
        log.warn('TOKEN is old');
        return this.updateUser(getGuestUser())
      }
    }
    catch(e) {
      log.error(e);
      return this.updateUser(getGuestUser())
    }
  }


  public async loginAndRedirect(id: string, password: string, history, location) {
    const res = await post( getPostRequest(env.AUTH_API_URL+'/auth/login',
      { id, password, app: env.APP_ID },), true,  'Login in, please wait');
      if(res.success) {
        this.updateUser(getUser(res.data))
        let next;
        if(location && location.state && location.state.prev){
          next = location.state.prev.startsWith('/auth/')? '/': location.state.prev;
        }

        history.push(next || '/');
      }
      else {
        toastService.printServerErrors(res);
      }
  }

  public async logout() {
    
  }

  public async login(id: string, password: string):Promise<ajaxResponse> {
    const res = await post( getPostRequest(env.AUTH_API_URL+'/auth/login',
      { username: id, password: password, app: env.APP_ID }, {}), true,  'Login in, please wait');

    return res;
  }


  public async renewToken() {
    const res = await post(getPostRequest(env.AUTH_API_URL+'/auth/renewToken',
                          {token: this._user.token}), false);
    log.info('Renewed Token: ', res);
    if(res.success){
      await this.updateUser({...this._user, ...{token: res.data.token, 
                                [env.ACCESS_META_KEY]: res.data[env.SERVER_ACCESS_META_KEY],
                                token_expiery: res.data.expires}})
      return true;
    }
    else {
      //is it bad token, or just no internet
      if(res.status && res.status === 422){
        await this.updateUser(getGuestUser());
        return false;
      }
    }


  }

  public async register(username:string, email: string, password: string): Promise<boolean> {
    const res = await post( getPostRequest(env.AUTH_API_URL+'/auth/register',
                      { username, password, email }),
                      true,  'Registering, please wait');
    if(res.success) {
        return true;
    }
    else {
      toastService.printServerErrors(res);
      return false;
    }
  }

  public async forgotPassword() {
    //const res = await this.http.post(environment.auth_api+'/auth/forgotpassword'
  }


  private setAuthStatus(status:AuthStatus){
    this._authStatus = status;
    this.authStatus$.next(status);
  }

  public getAuthStatus():AuthStatus {
    return this._authStatus;
  }

  public getToken():string {
    return this._user.token || '';
  }

  public get userid(): string {
    return this._user.id || '';
  }



}
export const authService = new AuthService();

