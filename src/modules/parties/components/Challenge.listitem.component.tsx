import React, { useEffect, useReducer } from 'react';
import { IonItem, IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonNote, IonBadge, IonFooter, IonButton } from '@ionic/react';
import { Challenge, ChallengeStage } from '../models';
import { ProjectItem } from '../../data/models';

export interface ChallengeState {
  challenge: Challenge,
}

const reducer = (state, action): ChallengeState => {
  switch(action.type) {
    case 'challenge':
      return {...state, ...{challenge:action.data}}

    default:
      console.log('ERROR WENT TO DEFAULTS:: ', action);
      return state;
  }
}


const ChallengeListItemComponent = ({challenge}:
  {challenge:Challenge, showEditModalFunction:{(challenge: Challenge)}}) => {

  const [state, _dispatch] = useReducer(reducer, {
    challenge,
  })

  const dispatch = (type:'challenge', data:any) => {
    _dispatch({type, data});
  }

  useEffect(() => {
    dispatch('challenge', challenge);
  }, [challenge])


  const printAcceptChallenge = () => {
    //which state, and if already joined
    if(challenge.stage !== ChallengeStage.waiting) return;
    //const self = challenge.mem 
  }
  const acceptChallenge = () => {

  }

  const printAddProgress = () => {
    return (
      <IonButton onClick={()=>acceptChallenge()} fill="clear">Accept Challenge</IonButton>
    )
  }
  const addProgress = () => {

  }


  const printGoal = () => {
    if(state.challenge.regularityInterval === 'day'){
      return (
        <IonItem>
              <IonNote>
                Remember, you promised that you will repeat 
                this habit <strong>every day</strong>.
              </IonNote>
        </IonItem>
      )
    }
    
    return (
      <IonItem>
        <IonNote>
          Remember you promised that you will repeat this habit 
          <strong> {state.challenge.regularityValue} times {state.challenge.regularityInterval}</strong>
        </IonNote>
      </IonItem>
    )
  }



  const print = () => {
    return (
        <IonCard>
          <IonCardHeader>
            {/*<IonCardSubtitle>Card Subtitle</IonCardSubtitle>*/}
            <IonCardTitle>{state.challenge.name}</IonCardTitle>
          </IonCardHeader>
          <IonCardContent>
            {printGoal()}
          </IonCardContent>
          <IonFooter>
            {printAcceptChallenge()}
            {printAddProgress()}
            
          </IonFooter>
         {/* 
          <IonFab horizontal="end" vertical="bottom" edge>
            <IonFabButton size="small" color={COLOR_LIGHT} onClick={() => showEditModalFunction(doc)}>
              <IonIcon size="large" icon={cog} />
            </IonFabButton>
          </IonFab>
        */}
        </IonCard>
    );
  }
  
  return print();
};

export default ChallengeListItemComponent;

