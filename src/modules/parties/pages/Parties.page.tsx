import React, { useEffect, useReducer } from 'react';
import {
  IonPage,
  IonContent,
  IonList,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonLabel,
  IonModal,
  IonItem,
  IonRefresher,
  IonRefresherContent,
  IonFab,
  IonFabButton,
  IonIcon} from '@ionic/react';
import HeaderWithProgress from '../../../components/HeaderWithProgress';
import { authService } from '../../auth/authService';
import { PartyProject } from '../models';
import PartyEditComponent from '../components/Party.edit.component';
import { partyService } from '../party.service';
import PartyListItemComponent from '../components/Party.listitem.component';
import { useHistory } from 'react-router-dom';
import ulog from 'ulog';
import { dataService } from '../../data/dataService';
import { useTranslation } from 'react-i18next';
import { add } from 'ionicons/icons';


const log = ulog('parties');

export interface PartiesState {
  userId: string,
  showModal: boolean,
  party: PartyProject|null
  docs: PartyProject[],
}
const reducer = (state, action:{type:string, data:any}): PartiesState => {
  switch(action.type) {
    case 'dismissEdit':
      return {...state, ...{showModal: false, party: null}}
    case 'edit':
      return {...state, ...{showModal: true, party: action.data}}
    case 'docs':
      return {...state, ...{docs:action.data}};
    case 'userid': 
      return {...state, ...{userId: action.data}};
    default:
      log.error('ERROR, INCORRECT ACTION TYPE ', action);
      return state;
  }
}



const PartiesPage = () => {
  const history = useHistory();
  const [state, _dispatch] = useReducer(reducer, {
    userId: '',
    showModal: false,
    party: new PartyProject(),
    docs: [],
  })

  const {t} = useTranslation();

  const dispatch = (type: 'userid'|
                          'dismissEdit'|
                          'edit'|
                          'docs', data:any = null) => {
      _dispatch({type, data});                      
  }

  useEffect(() => {
    const subs = [
      authService.username$.subscribe(username => {
        dispatch('userid', authService.userid);
      }),
      partyService.state$.subscribe(changes => {
        dispatch('docs', changes.docs);
      }),

    ]
    return () => {
      subs.forEach(sub => {
        if(sub) sub.unsubscribe();
      });
    };
    // eslint-disable-next-line
  }, [])

  const editParty = (party:PartyProject = new PartyProject()) => {
    dispatch('edit', party);
  }


  const modalDismissFunc = (party: PartyProject|null, action:'save'|'remove'|'none') => {
    dispatch('dismissEdit')
    if(action === 'save' && party != null){
      partyService.saveParty(party)
    }
    else if(action === 'remove' && party != null && party.id){
      //dataFunc.remove(habit._id);
    }
  }

  const hideModal = () => {
    dispatch('dismissEdit');
  }

  return (
    <IonPage>
      <HeaderWithProgress title={t('Clash of Farmers')} />
      <IonContent>
      <IonRefresher slot="fixed" onIonRefresh={(e) => dataService.refresh(e)}>
          <IonRefresherContent></IonRefresherContent>
      </IonRefresher>
     
        {state.showModal? (
          <IonModal isOpen={state.showModal} onDidDismiss={() => hideModal()}>
            <PartyEditComponent party={state.party} 
                                dismissFunc = {modalDismissFunc}  />
          </IonModal>
        ) : (
          <></>
        )}
        <IonCard>
          <IonCardHeader>
            <IonCardTitle>
              {t('clash.header')}
            </IonCardTitle>
          </IonCardHeader>
          <IonCardContent>
          </IonCardContent>
        </IonCard>
        
      <IonList>
        {state.docs.map(party => (
          <PartyListItemComponent partyProject={party} 
                                  history={history}
                                  key={party.id}
                                  showEditModalFunction={editParty} />
        ))}  
      </IonList>
     
      <IonFab vertical="top" horizontal="end" slot="fixed" edge>
          <IonFabButton onClick={() =>editParty()}>
            <IonIcon icon={add} />
          </IonFabButton>
        </IonFab>
      </IonContent>
    </IonPage>
  );
};

export default PartiesPage;

