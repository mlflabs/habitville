import React, { useEffect, useReducer } from 'react';
import {
  IonPage,
  IonContent,
  IonList,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardSubtitle,
  IonCardContent,
  IonLabel,
  IonButton,
  IonModal,
  IonItem} from '@ionic/react';
import HeaderWithProgress from '../../../components/HeaderWithProgress';
import { authService } from '../../auth/authService';
import { PartyProject } from '../models';
import PartyEditComponent from '../components/Party.edit.component';
import { partyService } from '../party.service';
import PartyListItemComponent from '../components/Party.listitem.component';
import { useHistory } from 'react-router-dom';
import ulog from 'ulog';

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
      <HeaderWithProgress title="Parties" />
      <IonContent>
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
              Here you can join friends to conquer those tasks together.
            </IonCardTitle>
            <IonCardSubtitle>
              
            </IonCardSubtitle>
          </IonCardHeader>
          <IonCardContent>
            <IonLabel>
              Create your party to go on quests and challenge your friends.
            </IonLabel>
            <IonButton onClick={() =>editParty()} >Create Party</IonButton>
            <br></br><br></br><br></br>
            <IonLabel>
              Join your friends party, give them your code: <strong>{state.userId}</strong>
            </IonLabel>
            
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
      <IonItem>
        <IonLabel>To join a party, you can give part leader your id: {state.userId} </IonLabel>
      </IonItem>
      
      </IonContent>
    </IonPage>
  );
};

export default PartiesPage;

