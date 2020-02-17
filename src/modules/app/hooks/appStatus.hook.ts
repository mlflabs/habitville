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
    console.log('App Stats Effect::');
    const subscriptions: Subscription[] = [
      dataService.getReadySub().subscribe(ready => {
        console.log('DataService READY', ready, dataService.ready);
        if(ready === appStatus.dataReady) return;
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
        await dataService.init( userid, username !== GUEST);
        console.log("Ready to start gamify service");
        await gamifyService.init(userid);
        await partyService.init();
      }),

    ];
    // usersService.loadAll();
    return () => { subscriptions.map(it => it.unsubscribe()) };
  },[]);


  const setStatusFunction = () => {
    const dataReady = dataService.ready;
    const username = authService.getUsername();
    if(dataReady === appStatus.dataReady && username === appStatus.username)
      return;
    console.log('STATUS ----------------', dataReady, username, appStatus);
    
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