import {
  IonPage,
  IonContent,
  IonList,
  IonItem,
  IonLabel,
  IonSegmentButton,
  IonSegment} from '@ionic/react';
import React, { useReducer, useEffect } from 'react';
import './Home.css';
import HeaderWithProgress from '../components/HeaderWithProgress';
import ulog from 'ulog';
import { authService } from '../modules/auth/authService';
import { dataService } from '../modules/data/dataService';
import { TYPE_SETTINGS } from '../modules/data/utilsData';
import { useTranslation } from 'react-i18next';

const log = ulog('home');


export interface SettingsState {
  settingsId: string,
  doc: any;
}

const reducer = (state, {type, payload}:{type:string, payload:any}): SettingsState => {
  console.log(type, payload)
  switch(type) {
    case 'setDoc':
      dataService.save(payload, TYPE_SETTINGS);
      return {...state, ...{doc: payload}};
    case 'setSettingsId':
      return {...state, ...{settingsId: payload}};
    case 'setState':
      return payload;
    default:
      log.error('Action Type is incorrect, default called', type, payload);
      return state;
  }
}

const SettingsPage  = () => {

  const [state, _dispatch] = useReducer(reducer, {
    settingsId: '',
    doc: {}
  })

  const {t} = useTranslation();

  const dispatch = (type: 'setDoc'|
                          'setState'|
                          'setSettingsId',
                    payload: any = {}) => {
    _dispatch({type, payload});
  }

  useEffect(() => {
    const id = dataService.getSettingsDocId();
    log.info(id);
    const sub = authService.username$.subscribe(() => {
      log.info('userID changed, settingsID: ', id);
      dispatch('setSettingsId', id);
    });
    dispatch('setSettingsId', id);
    
    return () => {
      sub.unsubscribe();
    };
  }, [])

  useEffect(() => {
    log.info(state);
    const sub = dataService.subscribeDocChanges(state.settingsId).subscribe(doc => {
      log.info('Settings Doc Changed:::::: ', doc);
      dispatch('setState', {...state, ...{doc}});
    });
    loadSettingsDoc();
    return () => {
      sub.unsubscribe();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.settingsId])

  const loadSettingsDoc = async () => {
    log.info('loading settings doc: ', state);
    if(state.settingsId === "")return;
    const doc = await dataService.getDoc(state.settingsId, TYPE_SETTINGS);
    log.info(doc);
    if(doc){
      log.info(doc);
      dispatch('setState', {...state, ...{doc}})
      console.log(state);
    }
      
  }

  useEffect(() => {
    console.log(state);
  }, [state]);

  const handleChange = (e) => {
    const newDoc = {...state.doc, ...{[e.target.name]:e.detail.value}}
    console.log(newDoc, state, e);
    dispatch('setDoc', newDoc);
  }

  const handleDocPropertyChange = (property, value) => {
    console.log(state);
    if(!state.doc || !state.doc.id) return;
    const newDoc = {...state.doc, ...{[property]:value}}
    console.log(newDoc, state, property, value);
    dispatch('setDoc', newDoc);
  }

  return (
    <IonPage>
      <HeaderWithProgress title={t('settingsTitle')} />
      <IonContent >
        
        <IonList>
            <IonItem>
              <IonLabel>
                <h1> {t('auth.username')}: {authService.getUser().username} </h1>
                <h3> {t('auth.ID')}: {authService.userid} </h3>
                
                {/* 
                <br/><br/>
                Records number
                <br /><br />
                Change Password
                <br /><br />*/}
              </IonLabel>
          </IonItem>
              
          <IonItem key="languagestring">
              <h2>Language: {state.doc.language}</h2>
          </IonItem>
          <IonItem>
            <IonSegment 
                value={state.doc.language}
                onIonChange={(e) => handleDocPropertyChange('language', e.detail.value)}>
              <IonSegmentButton value="en">
                <IonLabel>English</IonLabel>
              </IonSegmentButton>
              <IonSegmentButton value="zh">
                <IonLabel>Chinese</IonLabel>
              </IonSegmentButton>
            </IonSegment>
          </IonItem>
          <IonItem>
            <p>{t('settings.changeLanguageRestartMessage')}</p>
          </IonItem>
          {/* 
          <IonItem>
            <IonButton size="large"
              onClick={() => appService.showTutorial(true)}
            >Show Tutorial</IonButton>
          </IonItem>
          */}
        </IonList>
      </IonContent>
    </IonPage>
  );
};

export default SettingsPage;

