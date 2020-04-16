import { useEffect, useState } from 'react';
import { Subscription } from 'rxjs';
import { authService, AuthStatus } from '../authService';

import ulog from 'ulog'
const log =  ulog('auth');

//more simpler then auth hook, just read data
export function useUserFacade(): [AuthStatus, String] {

  

  const [username, setUsername] = useState<string>(authService.getUsername()); 
  const [authStatus, setAuthStatus] = useState<AuthStatus>(authService.getAuthStatus());


  useEffect(() => {
    const subscriptions: Subscription[] = [
      authService.authStatus$.subscribe(status => {
        log.info('Auth Status Changed::: ', status);
        setAuthStatus(status);
      }),
      authService.username$.subscribe(username => {
        log.info(username);
        setUsername(username);
      }),

    ];
    
    // usersService.loadAll();
    return () => { subscriptions.map(it => it.unsubscribe()) };
  },[]);



  return [authStatus, username];
}