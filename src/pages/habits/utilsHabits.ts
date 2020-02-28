import { Habit, MOMENT_DATE_FORMAT, habitIntervals } from './models';
import moment, { Moment } from 'moment';
import { FIRST_DAY_OF_WEEK } from '../../env';
import { clamp } from '../../utils';


export interface GamifyRewards {
  gold:number,
  experience: number,
  item:any
}



export const getInitGamifyRewards =  (base?:GamifyRewards):GamifyRewards =>  {
  return {...{ gold: 0, experience: 0, item:undefined }, ...base};
}


export const calculateCurrentStreak = (hab:Habit, bufferSize = 3): Habit => {
  console.log('calculateCurrentStreak:::: ', hab, bufferSize);
  if(hab.regularityInterval === habitIntervals.day){
    const h = calculateDailyHabitStreak(hab, bufferSize)
    return h;
  }

  if(hab.regularityInterval === habitIntervals.week){
    return calculateHabitStreakByWeek(hab, bufferSize);
  }

  if(hab.regularityInterval === habitIntervals.month){
    return calculateHabitStreakByMonth(hab, bufferSize);
  }

  return hab;
}


const getStreakByWeek = (hab:Habit, weeksBack:number, firstDayOfWeek: string): number => {
  const firstDay = moment().day(FIRST_DAY_OF_WEEK);
  let currentValue = 0;
  let streak = 0;
  if(!firstDay.isSame(moment(), 'day')){
    console.log('Not same day start');
    firstDay.add(1, 'week');
  }
  console.log(firstDay);
  //now we have the current first day of week, subtrack weeksBack
  firstDay.subtract(weeksBack, 'week');

  for(let i = 0; i < 7; i++) {
    currentValue = getProgressValueByDate(getProgressDate(firstDay,i), hab);
    if(currentValue > 0) 
      streak++;
  }
  return streak;
}

const getStreakByMonth = (hab:Habit, monthsBack:number): number => {
  const firstDay = moment().date(1);
  
  if(!firstDay.isSame(moment(), 'day')){
    console.log('Not same day start');
    firstDay.add(1, 'month');
  }
  console.log(firstDay);
  let currentValue = 0;
  let streak = 0;
  firstDay.subtract(monthsBack, 'month');

  const currentDay = moment(firstDay);
  while(currentDay.isSame(firstDay, 'month')){
    currentValue = getProgressValueByDate(currentDay.format(MOMENT_DATE_FORMAT), hab);
    if(currentValue > 0) 
      streak++;

    currentDay.add(1, 'day');
  }
  return streak;
}

const withinWeekBuffer = (buffer: number, offset:number):boolean => {
  if(offset === 0) return true;


  const firstDay = moment().day(FIRST_DAY_OF_WEEK);
  if(!firstDay.isSame(moment(), 'day')){
    console.log('Not same day start');
    firstDay.add(1, 'week');
  }

  //now remove offset
  firstDay.subtract(offset, 'week');

  if(firstDay.isAfter(moment().subtract(buffer,'day'))) {
    return true;
  }
  
  return false;
}


const calculateHabitStreakByMonth = (hab:Habit, bufferSize:number): Habit => {
  console.log("Calculate Current Streak By Month: ", hab);
  let streak = 0;
  let currentBiggestStreak = 0;
  let cont = true;
  let offset = 0;
  let currentValue = 0;
  while(cont) {
    currentValue = getStreakByMonth(hab, offset);
    console.log('Month Streak: ', currentValue);
    console.log('--------------------Clamp:::: ', clamp(currentValue, hab.regularityValue))
    streak += clamp(currentValue, hab.regularityValue);
    if(streak > currentBiggestStreak) currentBiggestStreak = streak;

    if(currentValue < hab.regularityValue && !withinWeekBuffer(bufferSize, offset)){
      cont = false;
    }
    //cont
    offset++;
  } 
  let bestStreak = hab.bestStreak;
  if(!hab.bestStreak)hab.bestStreak = 0;
  if(currentBiggestStreak > hab.bestStreak) bestStreak = currentBiggestStreak;
  return {...hab, currentStreak: streak, bestStreak}
}


const calculateHabitStreakByWeek = (hab:Habit, bufferSize:number): Habit => {
  console.log("Calculate Current Streak By Week: ", hab);
  let streak = 0;
  let currentBiggestStreak = 0;
  let cont = true;
  let offset = 0;
  let currentValue = 0;
  while(cont) {

    currentValue = getStreakByWeek(hab, offset, FIRST_DAY_OF_WEEK);
    
    console.log('Week Streak: ', currentValue);
    console.log('--------------------Clamp:::: ', clamp(currentValue, hab.regularityValue))
    streak += clamp(currentValue, hab.regularityValue);
    if(streak > currentBiggestStreak) currentBiggestStreak = streak;


    if(currentValue >= hab.regularityValue){
      
    }
    else {

      //do we still have buffer for this time period

      //streak = 0;
      //failed on this day,see if we are in the buffer
      
      if(withinWeekBuffer(bufferSize, offset)){
        console.log("We are within buffer, ", bufferSize, offset);
        //still have a chance
        
      }
      else {
        console.log("We are past buffer, ", bufferSize, offset);
        // did we success this time period

        //out of buffer, plus failed
        cont = false;
      }
    }
      
    //cont
    offset++;
  } 
  let bestStreak = hab.bestStreak;
  if(!hab.bestStreak)hab.bestStreak = 0;
  if(currentBiggestStreak > hab.bestStreak) bestStreak = currentBiggestStreak;
  return {...hab, currentStreak: streak, bestStreak}
}



const calculateDailyHabitStreak = (hab:Habit, bufferSize:number): Habit => {
  console.log("Calculate Current Streak: ", hab);
  let streak = 0;
  let currentBiggestStreak = 0;
  let cont = true;
  let offset = 0;
  let currentValue = 0;
  while(cont) {
    currentValue = getProgressValueByDate(getProgressDateBySubtract(offset), hab);
    if(currentValue > 0){
      streak++
      if(streak > currentBiggestStreak) currentBiggestStreak = streak;
    }
    else {
      cont = false;
    }
      
    //cont
    offset++;
  } 
  let bestStreak = hab.bestStreak;
  if(!hab.bestStreak)hab.bestStreak = 0;
  if(currentBiggestStreak > hab.bestStreak) bestStreak = currentBiggestStreak;
  return {...hab, currentStreak: streak, bestStreak}
}

const getProgressValueByDate = (date: string, hab:Habit):number => {
  if(!hab.progress) hab.progress = [];
  for(let i = 0; i < hab.progress.length; i++){
    if(hab.progress[i].date === date)
    {
      return hab.progress[i].value;
    }
  }
  return 0;
}

const getProgressDateBySubtract = (subtract:number):string => {
  return moment().subtract(subtract, 'day').format(MOMENT_DATE_FORMAT);
}

const getProgressDate = (date: Moment, subtract: number): string => {
  return moment(date).subtract(subtract, 'd').format(MOMENT_DATE_FORMAT);
}