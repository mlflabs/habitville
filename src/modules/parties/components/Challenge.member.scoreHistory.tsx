import React from 'react';
import { PartyMember, ChallengeMember } from '../models';
import { IonBadge } from '@ionic/react';
import { COLOR_LIGHT, COLOR_SUCCESS } from '../../../colors';
import moment from 'moment';
import { MOMENT_DATE_FORMAT } from '../../../pages/habits/models';
import './challenge.css';


const ChallengeMemberScoreHistory = ({member}:
  {member: any}) => {


 const printDay = (dateString) => {
  let score;
  if(member['actions'])
    score = member['actions'][dateString];
  else if(member['scoreHistory'])
    score = member['scoreHistory'][dateString];

  let color = COLOR_LIGHT;
  let reward = 0;
  if(score){
    color = COLOR_SUCCESS;
    if(score.reward)
      reward = score.reward.value || score.reward;
  }
  if(!Number(reward)) reward = 0;


  return <IonBadge class="scoreHistoryBadge"  color={color}>{reward}</IonBadge>
 }

  
  return (
    <>
      {printDay(moment().subtract(6, 'd').format(MOMENT_DATE_FORMAT))}
      {printDay(moment().subtract(5, 'd').format(MOMENT_DATE_FORMAT))}
      {printDay(moment().subtract(4, 'd').format(MOMENT_DATE_FORMAT))}
      {printDay(moment().subtract(3, 'd').format(MOMENT_DATE_FORMAT))}
      {printDay(moment().subtract(2, 'd').format(MOMENT_DATE_FORMAT))}
      {printDay(moment().subtract(1, 'd').format(MOMENT_DATE_FORMAT))}
      {printDay(moment().subtract(0, 'd').format(MOMENT_DATE_FORMAT))}
    </>
  )

}
export default ChallengeMemberScoreHistory;