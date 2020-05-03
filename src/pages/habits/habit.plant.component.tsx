import React, { useReducer, useEffect } from 'react';
import ulog from 'ulog'
import {  IonHeader, IonToolbar, IonContent,  IonButton, IonList, 
  IonItem, IonLabel, IonRange, IonIcon } from '@ionic/react';
import { Habit } from './models';
import { Line } from 'rc-progress';
import { useTranslation } from 'react-i18next';
import HeaderWithProgress from '../../components/HeaderWithProgress';
import { COLOR_WARNING } from '../../colors';
import { gamifyService } from '../../modules/gamify/gamifyService';
import { caretBackCircleOutline, caretForwardCircleOutline, caretBackOutline, caretForwardOutline } from 'ionicons/icons';
import { getPlantPic } from './utilsHabits';


const log = ulog('default');

const reducer = (state, {type, payload}) => {
  switch(type) {
    case 'setState': 
      return payload;
    case 'setDoc':
      return {...state, ...{doc: payload}}
    default:
      log.error('Incorrect action, ', type, payload);
      return state;
      
  }
}

const initState = {
  doc: {}
}


export const HabitPlantComponent = ({doc, position, closeFunc}: 
    {doc: Habit, position: number, closeFunc:Function}) => {

  const {t} = useTranslation();
  const [state, _dispatch] = useReducer(reducer, initState); 

  const dispatch = (type:   'other'|
                            'setDoc'|
                            'setState', payload:any = {}) => {
  _dispatch({type, payload});
  }

  useEffect(() => {
    dispatch('setDoc', doc);
  }, [doc])

  const positionChange = (e) => {
    console.log(e);
    gamifyService.changePlantPosition(doc, e.detail.value);
  }


  return (
    <>
    <IonHeader>
      <HeaderWithProgress title="" showDetail={false} />
    </IonHeader>
    <IonContent>
     <IonList>
       <IonItem>
          <h2>{t("name")}: {doc.plantName}</h2>
       </IonItem>
       <IonItem>
         <IonLabel>
           {t("level")}: {doc.plantLevel}
          </IonLabel>
       </IonItem>
       <IonItem>
         <IonLabel>
           {t("plants.exp")}: {doc.plantExp}
          </IonLabel>
       </IonItem>
       <IonItem>
         <IonLabel>
          {t("nextLevelReq")}: {doc.plantNextLevelExp}
          </IonLabel>
       </IonItem>
     <Line 
            style={{margin:"20px"}}
            trailWidth={0}  
            percent={(doc.plantExp/doc.plantNextLevelExp*100)} 
            strokeWidth={2} strokeColor="#157F1F" />
     </IonList>
       <img 
        alt="Plant"
        style={{padding:"20px", height: '100px'}}
        src={getPlantPic(doc)}  />
    </IonContent>
    <IonToolbar>
    <IonRange 
      min={0} 
      max={370} 
      value={position}
      onIonChange={positionChange}
      color="secondary">
    </IonRange>
        <IonIcon size="large" slot="start" icon={caretBackOutline} />
        <IonIcon size="large" slot="end" icon={caretForwardOutline} />
    <IonButton
        slot="end"
        fill="solid"
        color={COLOR_WARNING}
        onClick={()=> closeFunc()} >{t('close')}</IonButton>
    </IonToolbar>
  </>
  )
}
