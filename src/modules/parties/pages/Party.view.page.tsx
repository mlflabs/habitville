import React, { useState, useEffect, useRef } from 'react';
import { IonPage, IonContent, IonRefresher, IonRefresherContent} from '@ionic/react';
import HeaderWithProgress from '../../../components/HeaderWithProgress';
import { PartyProject, TYPE_PARTY } from '../models';
import { useParams, useHistory } from 'react-router-dom';
import { dataService } from '../../data/dataService';
import { HabitsService } from '../../../pages/habits/habits.service';
import PartyMembersListComponent from '../components/Members.list.component';
import ChallengeListComponent from '../components/Challenge.list.component';
import MessagesListComponent from '../../messages/components/Messages.list.component';
import { getChannelFromProjectId } from '../../data/utilsData';



interface State {
  party:PartyProject,
}

const getInitState = {
    party: new PartyProject(),
}


const loadParty = async (id:string, state, setState, history) => {

  const dataSub = dataService.getReadySub().subscribe(async (ready) => {
    if(!ready) return;
    const party = await dataService.getDoc(id, TYPE_PARTY);
    
    if(!party){
      dataSub.unsubscribe();
      history.push('/clash');
      return
    }
    setState({...state, ...{party}})
    dataSub.unsubscribe();
  })
  
}

//*********** Page Start *************/
const PartyViewPage = () => {
  const {id} = useParams();
  const history = useHistory();
  const [state, setState] = useState<State>(getInitState)
 
  useEffect(() => {
    if(id)
      loadParty(id, state, setState, history)
    else {
      history.push('/clash');
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])
  
  useEffect(() => {
    const idd = id || '';
    console.log(idd, id);
    const sub = dataService.subscribeDocChanges(idd).subscribe(change => {
      console.log(change);
      setState({party: change});
    });
    return () => {
      sub.unsubscribe();
    };
  }, [id])




  return (
    <IonPage>
      <HeaderWithProgress title={"Party: " + state.party.name} />
      <IonContent>
        <IonRefresher slot="fixed" onIonRefresh={(e) => dataService.refresh(e)}>
            <IonRefresherContent></IonRefresherContent>
        </IonRefresher>
      {state.party.id? (
        <>
          <PartyMembersListComponent  project={state.party} />
          <ChallengeListComponent project={state.party} />
          <MessagesListComponent channel={getChannelFromProjectId(state.party.id)} />
        </>
      ):(<></>)}

      </IonContent>
    </IonPage>
  )
}

export default PartyViewPage;