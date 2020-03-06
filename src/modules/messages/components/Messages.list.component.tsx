import React, { useReducer, useEffect } from 'react';
import { IonCard, IonCardTitle, IonCardHeader, IonCardContent, IonList, IonItem, IonLabel, IonAvatar, IonIcon, IonText, IonButton } from '@ionic/react';
import  ulog from 'ulog';
import { Msg } from '../../messages/models';
import { dataService } from '../../data/dataService';
import { TYPE_MSG } from '../models';
import { mail, personAdd, happy, sad, peopleCircle } from 'ionicons/icons';
import { printDateRelative, saveIntoArray } from '../../../utils';
import { partyService } from '../../parties/party.service';
import { COLOR_SUCCESS, COLOR_WARNING } from '../../../colors';
const log = ulog('messages');

export interface MessagesState {
  messages: Msg[],
}


const reducer = (state, {type, payload}): MessagesState => {
  switch(type) {
    case 'setMessages':
      return {...state, ...{messages: payload}};
      case 'updateMessage':
        return {...state, ...{messages: saveIntoArray(payload, state.messages)}};
    default:
      log.error('Action type is not a match');
      return state;
  }
}

const MessagesListComponent = ({channel}:{channel:string}) => {
  const [state, _dispatch] = useReducer(reducer, {
    messages: [],
  })

  useEffect(() => {
    loadMsgs()
    const sub = dataService.subscribeChannelTypeChanges(channel, TYPE_MSG)
                    .subscribe(doc => {
                        log.info(doc);
                        dispatch('updateMessage', doc);
                    });
    return () => {
      sub.unsubscribe();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [channel])

  const dispatch = (type: 'setMessages'|
                          'updateMessage', 
                    payload:any = {}) => {
    _dispatch({type, payload});
  }

  const loadMsgs = async () => {
    log.info('Get all by project, type', channel, TYPE_MSG);
    const msgs = await dataService.getAllByChannel(channel, TYPE_MSG);
    dispatch('setMessages', msgs.sort((a,b)=>{
      if(a.updated < b.updated) return 1;
      return -1;
    }))
    log.info(msgs, channel);
  }

  const printMessageIcon = (msg) => {
    if(msg.messageType === 'event'){
      return <IonIcon icon={mail}  slot="start" />
    }
    else if(msg.messageType === 'channelinvite') {
      return <IonIcon icon={peopleCircle}  slot="start" />
    }
    else if(msg.messageType === 'friendinvite') {
      return <IonIcon icon={personAdd}  slot="start" />
    }
  }

  const printReplyStatus = (msg:Msg) => {
    if((msg.messageType === 'channelinvite' || msg.messageType === 'friendinvite')
        && msg.replied !== undefined) {
      if(msg.replied) {
        return <IonIcon icon={happy} size='large' 
                        slot="end"
                        color={COLOR_SUCCESS} />
      }
      else {
        return <IonIcon icon={sad} size='large' 
                        slot="end"
                        color={COLOR_WARNING} />
      }
    }
  }

  const printClubRequestAcceptRejectButtons = (msg:Msg) => {
    if(msg.messageType === 'channelinvite' && msg.replied === undefined){
      return (
        <div>
          <IonButton onClick={() => partyService.acceptPartyInvitation(msg)} >
            Accept</IonButton>
          <IonButton onClick={() => partyService.rejectPartyInviation(msg)}> 
            Reject</IonButton>
        </div>
      )
    }
  }

  const printFriendRequestAcceptRejectButtons = (msg:Msg) => {
    if(msg.messageType === 'friendinvite' && msg.replied === undefined){
      return (
        <div>
          <IonButton onClick={() => partyService.acceptFriendInvitation(msg)} >
            Accept</IonButton>
          <IonButton onClick={() => partyService.rejectFriendInviation(msg)}> 
            Reject</IonButton>
        </div>
      )
    }
  }

  const printMessage = (msg) => {
    if(msg.messageType === 'event'){
      return <IonItem  button 
                key={msg.id}
                onClick={() => {}}>
        {printMessageIcon(msg)}
        <IonLabel className="ion-text-wrap">
          <h3>{msg.message}</h3>
          <IonText color="secondary">
              <p>{printDateRelative(msg.updated)}</p>
          </IonText>
        </IonLabel>
      </IonItem>
    }
    else if(msg.messageType === 'channelinvite') {
      return <IonItem  button 
                key={msg.id}
                onClick={() => {}}>
        {printMessageIcon(msg)}
        <IonLabel className="ion-text-wrap">
          <h2>{msg.from} has invited you to join his club, 
          <strong>{msg.data.name}</strong></h2>
          <IonText  color="secondary">
            {printDateRelative(msg.updated)}
          </IonText>
            {printClubRequestAcceptRejectButtons(msg)}
          
        </IonLabel>
        {printReplyStatus(msg)}
      </IonItem>
    }
    else if(msg.messageType === 'friendinvite') {
      return <IonItem  button 
                key={msg.id}
                onClick={() => {}}>
        {printMessageIcon(msg)}
        <IonLabel className="ion-text-wrap">
            <h2>You have received friend request from 
            <strong> {msg.from}</strong></h2>
            <IonText  color="secondary">
              {printDateRelative(msg.updated)}
            </IonText>
              {printFriendRequestAcceptRejectButtons(msg)}
        </IonLabel>
        {printReplyStatus(msg)}
      </IonItem>
    }                        
  }


  return (
    <IonCard>
      <IonCardHeader>
        <IonCardTitle>Messages</IonCardTitle>
      </IonCardHeader>
      <IonCardContent>
        <IonList>
            {state.messages.map(msg=> printMessage(msg))}
        </IonList>
        
      </IonCardContent>
    </IonCard>
  )

}
export default MessagesListComponent;