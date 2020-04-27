import { useEffect, useState } from 'react';
import { Subscription } from 'rxjs';
import { dataService } from '../../data/dataService';
import { GUEST, authService } from '../../auth/authService';
import { gamifyService } from '../../gamify/gamifyService';
import { partyService } from '../../parties/party.service';
import ulog from 'ulog';
import { loadPreferedLanguage } from '../../../i18n';
import { useHistory } from 'react-router-dom';
import { TYPE_SETTINGS } from '../../data/utilsData';
import { appService } from '../appService';
import { socialService } from '../../social/social.service';


const log = ulog('app');

export enum AppStatus {
  loading, auth, guest
}



// username, authenticated, login, logout, renewToken
export function useAppStatus(): [{status:AppStatus, dataReady:boolean, username:string}] {

  const [appStatus, setAppStatus] = useState({status: AppStatus.loading, dataReady: false, username: GUEST});
  const history = useHistory();

  log.info('APP Router Status: ', appStatus);

  useEffect(() => {
    log.info('App Stats Effect::');
    const subscriptions: Subscription[] = [
      dataService.getReadySub().subscribe(ready => {
        if(ready === appStatus.dataReady) return;
          setStatusFunction();
      }),
      authService.username$.subscribe(async (username) => {
        //renew token
        if(authService.getIsAuthenticated()){
          authService.renewToken();
        }
        setStatusFunction();
        const userid = authService.getUser().id;
        await dataService.init( userid, username !== GUEST);
        await gamifyService.init(userid);
        await partyService.init();
        await appService.init();
        await socialService.init(authService.userid);
        await loadPreferedLanguage();
        //load our tutorial if not already watched
        //await showIntroTutorial();
        dataService.addSyncCall$.next();
      }),

    ];
    // usersService.loadAll();
    return () => { subscriptions.map(it => it.unsubscribe()) };
  },[]);


  const showIntroTutorial = async () => {
    const settings = await dataService.getSettingsDoc();
    if(!settings) return;
    console.log('Settings: ', settings);
    if(!settings.tutorialIntro || settings.tutorialIntro < 2) {
      history.push('/tutorialslides')
      settings.tutorialIntro = 1;
      dataService.save(settings, TYPE_SETTINGS);
    }

    
  }


  const setStatusFunction = () => {
    const dataReady = dataService.ready;
    const username = authService.getUsername();
    if(dataReady === appStatus.dataReady && username === appStatus.username)
      return;
    log.info('STATUS:', dataReady, username, appStatus);
    
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

  return [ appStatus ];
}