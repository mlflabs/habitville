import React, { useReducer, useEffect } from 'react';
import ulog from 'ulog'
import { IonModal } from '@ionic/react';
import { appService, AppServiceState } from './appService';
import { Tutorial1 } from '../../components/slides/tutorial1';


const log = ulog('modals');

const reducer = (state, {type, payload}):AppServiceState => {
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


const AppModals: React.FC = () => {

  const [state, _dispatch] = useReducer(reducer, appService.state); 

  const dispatch = (type:   'other'|
                            'setDoc'|
                            'setState', payload:any = {}) => {
  _dispatch({type, payload});
  }



  useEffect(() => {
    const sub = appService.state$.subscribe(state => {
      console.log('App State Change::: ', state);
      dispatch('setState', state);
    });
    return () => {
      sub.unsubscribe();
    }
  }, [])


  return (
    <>
      {state.showTutorial? (
        <IonModal isOpen={state.showTutorial} onDidDismiss={() => appService.showTutorial(false)}>
          <Tutorial1   />
        </IonModal>
      ) : (
        <></>
      )}
    </>
  )
}




export default AppModals;