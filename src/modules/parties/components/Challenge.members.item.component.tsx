import React, { useEffect, useReducer } from 'react';
import { IonItem, IonLabel, IonList, IonText, IonBadge } from '@ionic/react';
import { Challenge } from '../models';
import { COLOR_LIGHT, COLOR_SUCCESS, COLOR_SECONDARY } from '../../../colors';


export interface ChallengeLocalState {
  challenge: Challenge,
}

const reducer = (state, action): ChallengeLocalState => {
  switch(action.type) {
    case 'challenge':
      return {...state, ...{challenge:action.data}}

    default:
      console.log('ERROR WENT TO DEFAULTS:: ', action);
      return state;
  }
}


const ChallengeMembersItem = ({challenge}:
  {challenge:Challenge}) => {

  const [state, _dispatch] = useReducer(reducer, {
    challenge,
  })

  const dispatch = (type:'challenge', data:any) => {
    _dispatch({type, data});
  }

  useEffect(() => {
    dispatch('challenge', challenge);
  }, [challenge])

  const printScore = (score, index) =>{
    let color = COLOR_LIGHT;
    if(index === 0) color = COLOR_SUCCESS;
    if(index === 1) color = COLOR_SECONDARY;
    return <IonBadge slot="end" color={color}>{score}</IonBadge>
  }


  const print = () => {
    return (
      <IonList>
        {state.challenge.members.sort((a,b)=> a.score - b.score)
          .map((member, i) => (
            <IonItem key={member.id}>
              <IonLabel>
                <h2>{member.username}</h2>
              </IonLabel>
              {printScore(member.score, i)}
            </IonItem>
        ))}
      </IonList>
    );
  }
  
  return print();
};

export default ChallengeMembersItem;

