import React, { useReducer, useEffect } from 'react';
import { IonList, IonModal, IonCard, 
  IonCardContent, IonCardHeader, IonCardTitle, IonButton, IonFooter } from '@ionic/react';
import { Challenge, PartyProject, TYPE_PARTY } from '../models';
import ChallengeListItemComponent from './Challenge.listitem.component';
import ChallengeAddComponent from './Challenge.add.component';
import { dataService } from '../../data/dataService';
import { partyService } from '../party.service';
import { getProjectChildId, canEditProjectByRights } from '../../data/utilsData';
import { saveIntoArray } from '../../../utils';
import  ulog from 'ulog';
import { authService } from '../../auth/authService';

//ulog.level = 7;
const log = ulog('challengelist');


export interface ChallengeListState {
  showModal: boolean,
  modalChallenge: Challenge|null,
  challenges: Challenge[],
}

const reducer = (state, action): ChallengeListState => {
  switch(action.type) {
    case 'addChallengeModal': 
      return {...state, ...{showModal: true, modalChallenge: action.data}}
    case 'hideChallengeModal':
      return {...state, ...{showModal: false, modalChallenge: null}}
    case 'loadChallenges': 
      return {...state, ...{challenges: action.data}}
    case 'challengeChange':
      return {...state, ...{challenges:saveIntoArray(action.data,state.challenges)}};
    default:
      return state;
  }
}




const ChallengeListComponent = ({project}:{project: PartyProject}) => {
  const [state, _dispatch] = useReducer(reducer, {
    showModal: false,
    modalChallenge: null,
    challenges: [],
  });

  useEffect(() => {
    const sub = dataService.subscribeByPropertyChange('secondaryType', 'challenge')
      .subscribe(change => {
        if(change.id.startsWith(getProjectChildId(project.id)))
          dispatch('challengeChange', change);

    });
    if(project.id)
      loadChallenges(project.id);

    return () => {
      sub.unsubscribe();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [project.id])

  const loadChallenges = async (id: string) => {
    const res = await dataService.queryByProperty(
        'secondaryType', 'equals', 'challenge', TYPE_PARTY);
    const challenges = res.filter(doc => doc.id.startsWith(getProjectChildId(id)));
    dispatch('loadChallenges', challenges);
  };

  const dispatch = (type: 'addChallengeModal'|
                          'loadChallenges'|
                          'challengeChange'|
                          'hideChallengeModal', data:any) => {
    _dispatch({type, data});
  }
  
  const addChallenge = (ch:Challenge = new Challenge()) => {
    log.warn('Add Challenge::: ', ch);
    dispatch('addChallengeModal', ch);
  }

  const hideChallengeModal = () => {
    dispatch('hideChallengeModal', null);
  }

  const challengeDismissFunc = (challenge: Challenge|null, action:'save'|'remove'|'none') => {
    hideChallengeModal();
    if(action === 'save' && challenge != null){
      partyService.saveChallenge(challenge, project);
    }
    else if(action === 'remove' && challenge != null && challenge.id){
      // dataFunc.remove(habit.id);
    }
  }


  const canEditThisProject = () => {
    const self = project.members.find(m => m.id === authService.userid);
    if(!self) return false;
    return canEditProjectByRights(self.rights);
  }

  return (
    <IonCard>
      <IonCardHeader>
        <IonCardTitle>Challenges</IonCardTitle>
      </IonCardHeader>
      <IonCardContent>
        <IonList>
          {state.challenges.map(challenge => (
                <ChallengeListItemComponent
                          challenge={challenge} 
                          key={challenge.id} 
                          showEditModalFunction={addChallenge}/>
          ))}
        </IonList>
          <IonModal isOpen={state.showModal} onDidDismiss={() => hideChallengeModal()}>
          <ChallengeAddComponent challenge={state.modalChallenge} 
                              dismissFunc = {challengeDismissFunc}  />
          </IonModal>

      </IonCardContent>
      <IonFooter>
        {canEditThisProject()? (
          <IonButton    onClick={() => addChallenge()}
            fill="clear">Add New Challenge</IonButton>
        ) : ( <></>)}
      </IonFooter>
    </IonCard>
  )
}



export default ChallengeListComponent;