import React from 'react';
import { PartyMember, ChallengeMember } from '../models';
import { IonBadge } from '@ionic/react';
import { COLOR_LIGHT, COLOR_SUCCESS } from '../../../colors';
import moment from 'moment';
import { MOMENT_DATE_FORMAT } from '../../../pages/habits/models';
import './challenge.css';


const ChallengeMemberScoreHistory = ({member}:
  {member: PartyMember|ChallengeMember}) => {


 const printDay = (dateString) => {
  const score = member.scoreHistory[dateString];
  let color = COLOR_LIGHT;
  let exp = 0;
  if(score){
    color = COLOR_SUCCESS;
    exp = score.exp;
  }

  return <IonBadge class="scoreHistoryBadge"  color={color}>{exp}</IonBadge>
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