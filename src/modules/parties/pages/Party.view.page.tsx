import React, { useState, useEffect, useRef } from 'react';
import { IonPage, IonContent} from '@ionic/react';
import HeaderWithProgress from '../../../components/HeaderWithProgress';
import { PartyProject, TYPE_PARTY } from '../models';
import { useParams, useHistory } from 'react-router-dom';
import { dataService } from '../../data/dataService';
import { HabitsService } from '../../../pages/habits/habits.service';
import PartyMembersListComponent from '../components/Members.list.component';
import ChallengeListComponent from '../components/Challenge.list.component';



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
      history.push('/parties');
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
  const habitsService = useRef(new HabitsService());

  //if(!id) return history.push('/parties');
  useEffect(() => {
    if(id)
      loadParty(id, state, setState, history)
    else {
      history.push('/parties');
    }
  }, [id])
  





  return (
    <IonPage>
      <HeaderWithProgress title={"Party: " + state.party.name} />
      <IonContent>
        
      {state.party.id? (
        <>
          <PartyMembersListComponent  project={state.party} />
          <ChallengeListComponent project={state.party} />
        </>
      ):(<></>)}

      </IonContent>
    </IonPage>
  )
}

export default PartyViewPage;