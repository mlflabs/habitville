import React, { useState, useEffect, useReducer, useRef } from 'react';
import { IonPage, IonContent, IonButton, IonModal } from '@ionic/react';
import HeaderWithProgress from '../../../components/HeaderWithProgress';
import { PartyProject, TYPE_PARTY } from '../models';
import { useParams, useHistory } from 'react-router-dom';
import { dataService } from '../../data/dataService';
import { HabitsService } from '../../../pages/habits/habits.service';
import HabitListComponent from '../../../pages/habits/Habit.list.component';
import { waitMS } from '../../../utils';
import PartyMembersListComponent from '../components/Members.list.component';
import { first } from '../../../../node_modules/rxjs/operators';
import ChallengeListComponent from '../components/Challenge.list.component';



interface State {
  party:PartyProject,
}

const getInitState = {
    party: new PartyProject(),
}


const loadParty = async (id:string, state, setState, history) => {
  console.log('Loading party');
  const dataSub = dataService.getReadySub().subscribe(async (ready) => {
    if(!ready) return;
    console.log('==============================Load party, ', id);
    const party = await dataService.getDoc(id, TYPE_PARTY);
    console.log(party)
    if(!party){
      dataSub.unsubscribe();
      console.log('************************************* couldn load party', id);
      history.push('/parties');
      return
    }
    setState({...state, ...{party}})
    dataSub.unsubscribe();
  })
  
}

//*********** Page Start *************/
const PartyViewPage = () => {
  console.log('PARTY PAGE');
  const {id} = useParams();
  const history = useHistory();
  const [state, setState] = useState<State>(getInitState)
  const habitsService = useRef(new HabitsService());

  //if(!id) return history.push('/parties');
  console.log('--------------------------------EFFECT: ', id);
  useEffect(() => {
    if(id)
      loadParty(id, state, setState, history)
    else {
      console.log('=================================================== no id')
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