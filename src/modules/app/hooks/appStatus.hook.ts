import { useEffect, useState } from 'react';
import { Subscription } from 'rxjs';
import { dataService } from '../../data/dataService';
import { GUEST, authService } from '../../auth/authService';
import { gamifyService } from '../../gamify/gamifyService';
import { partyService } from '../../parties/party.service';

export enum AppStatus {
  loading, auth, guest
}

// username, authenticated, login, logout, renewToken
export function useAppStatus(): [AppStatus] {

  const [appStatus, setAppStatus] = useState({status: AppStatus.loading, dataReady: false, username: GUEST});


  console.log('APP Router Status: ', appStatus);

  useEffect(() => {
    const subscriptions: Subscription[] = [
      dataService.pouchReady$.subscribe(ready => {
        setStatusFunction();
      }),
      authService.username$.subscribe(async (username) => {
        console.log('USERNAME CHANGED: ', username);

        //renew token
        if(authService.getIsAuthenticated()){
          authService.renewToken();
        }
        
        setStatusFunction();
        console.log('USER:::::: ', authService.getUser(), authService.getIsAuthenticated())
        const userid = authService.getUser().id;
        await dataService.init( userid,
                          authService.getIsAuthenticated(), 
                          username !== GUEST);
        console.log("Ready to start gamify service");
        await gamifyService.init(userid);
        await partyService.init(userid,authService.getUser().token||'');
      }),

    ];
    // usersService.loadAll();
    return () => { subscriptions.map(it => it.unsubscribe()) };
  },[]);


  const setStatusFunction = () => {
    const dataReady = dataService.ready;
    const username = authService.getUsername();
    if(dataReady){
      if(username === GUEST)
        setAppStatus({ status:AppStatus.guest, username: username, dataReady: dataReady });
      else
        setAppStatus({ status:AppStatus.auth, username: username, dataReady: dataReady });
    }
    else {
      setAppStatus({ status:AppStatus.loading, username: username, dataReady: dataReady });
    }
  };

  return [ appStatus.status ];
}