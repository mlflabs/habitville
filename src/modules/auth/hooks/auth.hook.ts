import { useEffect, useState } from 'react';
import { Subscription } from 'rxjs';
import { authService, GUEST } from '../authService';

// username, authenticated, login, logout, renewToken
export function useAuthFacade(): [boolean, String, Function, Function, Function] {

  const login = () => {
    //TODO fix this hook, don't directy use service in login/register pages

  }
  const logout =  () => {};
  const renewToken = () => {};
  

  const [username, setUsername] = useState<string>(authService.getUsername()); 
  const [authenticated, setAuthenticated] = useState<boolean>(authService.getIsAuthenticated());


  useEffect(() => {
    const subscriptions: Subscription[] = [
      /*authService.isAuthenticated$.subscribe(authenticated => {
        log.info(authenticated);
        setAuthenticated(authenticated);
      }),*/
      authService.username$.subscribe(username => {
        setUsername(username);
        setAuthenticated(username !== GUEST)
      }),

    ];
    
    // usersService.loadAll();
    return () => { subscriptions.map(it => it.unsubscribe()) };
  },[]);



  return [authenticated, username, login, logout, renewToken ];
}