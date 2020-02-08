import React, { useState, useEffect, useReducer } from 'react';
import { PartyProject } from '../models';
import { IonCard, IonCardHeader, IonCardTitle, IonCardSubtitle, IonBadge, IonList, IonLabel, IonItem, IonAvatar, IonNote, IonButton } from '@ionic/react';
import { useHistory } from '../../../../node_modules/@types/react-router';
import { Msg } from '../../messages/models';
import { dataService } from '../../data/dataService';
import { waitMS } from '../../data/utilsData';
import { messageService } from '../../messages/messages.service';
import { capitalize, saveIntoDocList } from '../../../utils';
import { partyService } from '../party.service';


const reducer = (state, action) => {
  switch(action.type) {
    case 'addmsgs':
      return {...state, ...{msgs: action.data} }
    case 'addmsg':
    return {...state, ...{msgs: saveIntoDocList(action.data, state.msgs)} };
    default:
      return state;
  }
}


const PartyInvitesListComponent = () => {

  const [state, dispatch] = useReducer(reducer, {msgs: []})

  console.log(state);

  useEffect(() => {
    const sub = dataService.subscribeChanges().subscribe(doc => {
      if(doc.messageType !== 'party') return;
      console.log(doc);
      console.log(state);
      dispatch({type: 'addmsg', data: doc});
    });
    getMessages();
    return () => {
      if(sub)sub.unsubscribe();
    };
  }, [])


  const getMessages = async () => {
    waitMS(2000);
    const msgs = await messageService.getGlobalPartyMessages();
    console.log(msgs);
    dispatch({type: 'addmsgs', data:[...state.msgs, ...msgs]});
  }

  const printHeading = (msg:Msg):string => {
    return capitalize(msg.from);
  }

  const printNote = (msg:Msg):string => {
    if(msg.data){
      if(msg.data.type === 'invite'){
        let last = '';
        if(msg.replied && msg.replied.accepted === false){
          last = ' Rejected';
        }
        else if(msg.replied && msg.replied.accepted === true) {
          last = ' Accepted';
        }
        return 'Come join our party: ' + msg.data.name + last;
      }

      if(msg.data.type === 'inviteaccepted') {
        return 'Invitation to join "'+ msg.data.name +'" has been accepted'
      }
    }
    return msg.message;
  }

  const printAcceptRejectButtons = (msg:Msg) => {
    if(msg.data && msg.data.type === 'invite' && msg.replied === undefined){
      return (
        <div slot="end">
          <IonButton onClick={() => partyService.acceptPartyInvitation(msg)} >
            Accept</IonButton>
          <IonButton onClick={() => partyService.rejectPartyInviation(msg)}> 
            Reject</IonButton>
        </div>
      )
    }
  }

  return(
    <IonList>
      {state.msgs.map(msg => (
        <IonItem key={msg._id}> 
          <IonItem>
            <IonAvatar slot="start">
              <img  />
            </IonAvatar>
            <IonLabel>
              <h3>{printHeading(msg)}</h3>
              <p>{printNote(msg)}</p>
            </IonLabel>
            {printAcceptRejectButtons(msg)}
            
          </IonItem>
        </IonItem>
      ))}
    </IonList>
  )


} 

export default PartyInvitesListComponent;