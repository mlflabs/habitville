import React, { useState, useEffect } from 'react';
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
import PartyInvitesListComponent from '../components/Party.invites.component';

export interface state {
  userId: string,
  showModal: boolean,
  party: PartyProject
  partyList: PartyProject[],
}

export const getDefaultState = () => {
  return {
    userId: '',
    showModal: false,
    party: new PartyProject(),
    partyList: [],
  }
}



const PartiesPage = () => {
  const history = useHistory();
  const [state, setState] = useState<state>(getDefaultState())
  console.log('Parties Page:: ', state);

  useEffect(() => {
    const subs = [
      authService.username$.subscribe(username => {
        setState({...state, ...{userId: authService.getUserId()}})
      }),

      partyService.state$.subscribe(changes => {
        setState({...state, ...{partyList: changes.docs, userId: authService.getUserId()}});
      }),

    ]
    return () => {
      subs.forEach(sub => {
        if(sub) sub.unsubscribe();
      });
    };
  }, [])

  const editParty = (party:PartyProject = new PartyProject()) => {
    console.log('Add party:  ', party);
    setState({...state, ...{showModal: true, party}});
  }


  const modalDismissFunc = (party: PartyProject|null, action:'save'|'remove'|'none') => {
    console.log('PARTY: ', party)
    setState({...state, ...{showModal: false, party: new PartyProject()}});
    if(action === 'save' && party != null){
      partyService.save(party)
    }
    else if(action === 'remove' && party != null && party._id){
      //dataFunc.remove(habit._id);
    }
  }

  const hideModal = () => {
    setState({...state, ...{showModal: false, party: new PartyProject()}});
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
        {state.partyList.map(party => (
          <PartyListItemComponent partyProject={party} 
                                  history={history}
                                  key={party._id}
                                  showEditModalFunction={editParty} />
        ))}  
      </IonList>
      <PartyInvitesListComponent />
      <IonItem>
        <IonLabel>To join a party, you can give part leader your id: {state.userId} </IonLabel>
      </IonItem>
      
      </IonContent>
    </IonPage>
  );
};

export default PartiesPage;

