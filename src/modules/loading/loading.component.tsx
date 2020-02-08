import React, { useState, useEffect } from 'react';
import { IonLoading } from '@ionic/react';
import { Subscription } from 'rxjs';
import { loadingService } from './loadingService';

export const Loading: React.FC = () => {
  const [state, setState] = useState({show:false, msg: 'Loading...'});

  useEffect(() => {
    const subscriptions: Subscription[] = [
      loadingService.loading$.subscribe(res =>{
        setState({show: res.show, msg: res.msg});
      })
    ];
    return () => { subscriptions.map(it => it.unsubscribe()) };
  },[]);

  
  //onDidDismiss={() => setShowLoading(false)}
  return (
      <IonLoading
        isOpen={state.show}
        message={state.msg}
      />
  );
};