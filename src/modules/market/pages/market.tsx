import React, { useReducer, useEffect } from 'react';
import ulog from 'ulog'
import { IonContent, IonRefresher, IonRefresherContent, IonPage, IonList, IonListHeader, IonLabel, IonItem, IonAvatar, IonSegmentButton, IonSegment, IonButton, IonIcon, IonBadge } from '@ionic/react';
import { dataService } from '../../data/dataService';
import HeaderWithProgress from '../../../components/HeaderWithProgress';
import "./market.css";
import { gamifyService } from '../../gamify/gamifyService';
import { MarketItem, MarketItems } from '../models';
import { useTranslation } from 'react-i18next';
import { getPlantSeedPic } from '../../../pages/habits/utilsHabits';

const log = ulog('default');

const reducer = (state, {type, payload}) => {
  log.log(type, payload, state);
  switch(type) {
    case 'setView':
      return {...state, ...{view:payload}};
    case 'setState': 
      return payload;
    case 'setDoc':
      return {...state, ...{doc: payload}}
    default:
      log.error('Incorrect action, ', type, payload);
      return state;
      
  }
}


const Market = () => {
  const {t} = useTranslation();
  const [state, _dispatch] = useReducer(reducer, {
    view:'user', // user or market
    gold: 0,
    userItems:[], 
    marketItems:[]}); 
  
  const dispatch = (type:   'setView'|
                            'setDoc'|
                            'setState', payload:any = {}) => {
  _dispatch({type, payload});
  }

  useEffect(() => {
    const sub = gamifyService.state$.subscribe(s => {
      log.log('State update::: ', s)
      if(!s.userItems) return;
      dispatch('setState', {...state, ...{userItems:s.userItems, gold: s.gold}});
    })

    dispatch('setState', {...state, ...{userItems: gamifyService.state.userItems, 
                                        gold: gamifyService.state.gold}});

    return () => {
      sub.unsubscribe();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.view])

  const buyItem = (item:MarketItem) => {
    gamifyService.buyItem(item);
  }


  return (
  <IonPage>
    <HeaderWithProgress title={t('market.title')} />
    <IonContent>
      
      <IonRefresher slot="fixed" onIonRefresh={(e) => dataService.refresh(e)}>
        <IonRefresherContent></IonRefresherContent>
      </IonRefresher>
      <div>
        <img className="marketPic" src={"/assets/pics/marketheader.svg"}  alt="MarketLogo"/>
      </div>
      <IonSegment value={state.view} onIonChange={e => dispatch('setView', e.detail.value)}>
          <IonSegmentButton value="user">
            <IonLabel>{t('market.userItems')}</IonLabel>
          </IonSegmentButton>
          <IonSegmentButton value="market">
            <IonLabel>{t('market.marketItems')}</IonLabel>
          </IonSegmentButton>
      </IonSegment>
      <IonList>
        

        {(state.view === 'user')? (
          <>
          <IonListHeader lines="inset">
            <IonLabel>{t('market.userItems')}</IonLabel>
          </IonListHeader>
          
          {state.userItems.map(item => (
            <IonItem key={item.id}>
              <IonAvatar slot="start">
                <img src={getPlantSeedPic(item)} alt="item" />
              </IonAvatar>
              <IonLabel><h2>{t('plants.names.' + item.name)}</h2></IonLabel>
              <IonBadge slot="end" color="primary">
                {item.quantity}
              </IonBadge>
            </IonItem>
          ))}
          </>
        ) : (
          <>
          <IonListHeader lines="inset">
            <IonLabel>{t('market.marketItems')}</IonLabel>
          </IonListHeader>
          {MarketItems.map(item => (
            <IonItem key={item.id}>
              <IonAvatar slot="start">
                <img src={getPlantSeedPic(item)} alt="item" />
              </IonAvatar>
              <IonLabel><h2>{t('plants.names.' + item.name)}</h2></IonLabel>
              <IonButton  disabled={item.price > state.gold} 
                          onClick={() => buyItem(item)}
                          slot="end">
                {t('market.buy')}<br />
                {item.price} {t('market.gold')}
              </IonButton>
            </IonItem>
  
          ))}
          </>
        )}
        
      </IonList>


     
    </IonContent>
  </IonPage>
  )
}




export default Market;