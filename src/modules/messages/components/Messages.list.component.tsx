import React, { useReducer, useEffect } from 'react';
import { IonCard, IonCardTitle, IonCardHeader, IonCardContent, IonList, IonItem, IonLabel, IonAvatar, IonIcon, IonText, IonButton } from '@ionic/react';
import  ulog from 'ulog';
import { Msg } from '../../messages/models';
import { dataService } from '../../data/dataService';
import { TYPE_MSG, newMessage } from '../models';
import { mail, personAdd, happy, sad, peopleCircle, documentTextOutline } from 'ionicons/icons';
import { printDateRelative, saveIntoArray } from '../../../utils';
import { partyService } from '../../parties/party.service';
import { COLOR_SUCCESS, COLOR_WARNING } from '../../../colors';
import './messages.css';
import { socialService } from '../../social/social.service';
import { useTranslation } from 'react-i18next';
const log = ulog('messages');

export interface MessagesState {
  messages: Msg[],
}


const reducer = (state, {type, payload}): MessagesState => {
  switch(type) {
    case 'setMessages':
      return {...state, ...{messages: payload}};
      case 'updateMessage':
        return {...state, ...{messages: saveIntoArray(payload, state.messages)
                  .sort((a,b)=>{ if(a.updated < b.updated) return 1;
                                            return -1;
                  })}};
    default:
      log.error('Action type is not a match');
      return state;
  }
}

const MessagesListComponent = ({channel}:{channel:string}) => {
  const {t} = useTranslation();
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
    const msgs = await dataService.getAllByChannel(channel, TYPE_MSG);
    log.warn(msgs);
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
    else if(msg.messageType === 'action' && msg.messageSubType === 'Note2') {
      return <IonIcon icon={documentTextOutline}  slot="start" />
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
            {t("accept")}</IonButton>
          <IonButton onClick={() => partyService.rejectPartyInviation(msg)}> 
            {t("reject")}</IonButton>
        </div>
      )
    }
  }

  const printFriendRequestAcceptRejectButtons = (msg:Msg) => {
    if(msg.messageType === 'friendinvite' && msg.replied === undefined){
      return (
        <div>
          <IonButton onClick={() => partyService.acceptFriendInvitation(msg)} >
          {t("accept")}</IonButton>
          <IonButton onClick={() => partyService.rejectFriendInviation(msg)}> 
          {t("reject")}</IonButton>
        </div>
      )
    }
  }

  const printChannel = (data) => {
    console.log("DATA", data);
    if(!data.channel) return;
    return <p>{t('social.channel')}: {data.channel}</p>
  }

  const printFrom = (data) => {
    if(!data.from) return;
    return <p>{t('social.from')}: {data.from}</p>
  }

  const printFriend = (data) => {
    if(!data.friend) return;
    return <p>{t('social.friend')}: {data.friend}</p>
  }

  const printMessage = (msg) => {
    if(msg.messageType === 'event'){
      return <IonItem  button 
                key={msg.id}
                onClick={() => {}}>
        {printMessageIcon(msg)}
        <IonLabel className="ion-text-wrap">
          <h3>{t(msg.message)}</h3>
          <IonText color="secondary">
              {printFrom(msg.data)}
              {printFriend(msg.data)}
              {printChannel(msg.data)}
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
          <h2>{t("social.receivedClashInvitation") + msg.from + ", "}
          <strong>{t("social.channel") + " " + msg.data.name}</strong></h2>
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
            <h2>{t("social.receivedFriendInvitation")}
            <strong> {msg.from} </strong></h2>
            <IonText  color="secondary">
              {printDateRelative(msg.updated)}
            </IonText>
              {printFriendRequestAcceptRejectButtons(msg)}
        </IonLabel>
        {printReplyStatus(msg)}
      </IonItem>
    }  
    else if(msg.messageType === 'action' && msg.messageSubType === 'Note') {
      return <IonItem  button 
                key={msg.id}
                onClick={() => {}}>
        {printMessageIcon(msg)}
        <IonLabel className="ion-text-wrap, messageActionNote">
            <h2 className="messageActionNoteHeader">{msg.challengeName}: <strong>{msg.username}</strong></h2>
            <h3  dangerouslySetInnerHTML={{__html: msg.data.note.replace(/(?:\r\n|\r|\n)/g, '<br>')}} />
             
            <IonText  color="secondary">
              {printDateRelative(msg.updated)}
            </IonText>
        </IonLabel>
        {printReplyStatus(msg)}
      </IonItem>
    }                                     
  }

  const sendMessage = async () => {
    const msg = newMessage('Testing message');
    const res = await socialService.sendMessage(msg);
    console.log(res);
    dataService.addSyncCall$.next();
  }


  return (
    <IonCard>
      <IonCardHeader>
  <IonCardTitle>{t("messages.messages")}</IonCardTitle>
       
      {/* 
        <IonButton onClick={() => sendMessage()} >
        {t("messages.sendMessage")}</IonButton>
      */}
      
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