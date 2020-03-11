import React, { useState, useEffect } from 'react';
import { PartyProject } from '../models';
import { IonCard, IonCardHeader, IonCardTitle, IonCardSubtitle, IonBadge } from '@ionic/react';


const PartyListItemComponent = ({partyProject, history,  showEditModalFunction}:
          {partyProject:PartyProject, history, showEditModalFunction:{(party: PartyProject)}}) => {

  const [state, setState] = useState({party: partyProject})

  useEffect(() => {
    setState({...state, ...{party:partyProject}});
  }, [partyProject])

  return(
    <IonCard>
      <IonCardHeader onClick={() => history.push('/parties/'+ encodeURI(state.party.id||''))}>
        <IonCardTitle>{state.party.name} 
              <IonBadge>{state.party.members.length}</IonBadge></IonCardTitle>
        <IonCardSubtitle>{state.party.note}</IonCardSubtitle>
      </IonCardHeader>
    </IonCard>
  )


} 

export default PartyListItemComponent;


