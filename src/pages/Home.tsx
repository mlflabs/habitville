import {
  IonPage,
  IonContent} from '@ionic/react';
import React, { useReducer, useEffect } from 'react';
import './Home.css';
import HeaderWithProgress from '../components/HeaderWithProgress';
import FriendsListComponent from '../modules/social/components/Friends.list.component';
import MessagesListComponent from '../modules/messages/components/Messages.list.component';
import ulog from 'ulog';
import { generateUserChannelId } from '../modules/data/utilsData';
import { authService } from '../modules/auth/authService';
import { useTranslation } from 'react-i18next';

const log = ulog('home');


export interface HomeState {
  userid: string;
}

const reducer = (state, {type, payload}:{type:string, payload:any}): HomeState => {
  switch(type) {
    case 'setUserid':
      return {...state, ...{userid: payload}};
    default:
      log.error('Action Type is incorrect, default called', type, payload);
      return state;
  }
}

const Home: React.FC = () => {

  const {t} = useTranslation();
  const [state, _dispatch] = useReducer(reducer, {
    userid:''
  })

  const dispatch = (type:'setUserid', 
                    payload: any = {}) => {
    _dispatch({type, payload});
  }


  useEffect(() => {
    const sub = authService.username$.subscribe(() => {
      log.info('Userid update, ', authService.userid);
      dispatch('setUserid', authService.userid);
    });
    log.info('HOME, ', authService.userid);
    dispatch('setUserid', authService.userid);
    log.info('Home State', authService.userid);
    return () => {
      sub.unsubscribe();
    };
  }, [])

  return (
    <IonPage>
      <HeaderWithProgress title={t("habitville")} />
      <IonContent >
        <FriendsListComponent />
        <MessagesListComponent channel={generateUserChannelId(state.userid)} />
      </IonContent>
    </IonPage>
  );
};

export default Home;

