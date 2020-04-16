import { Habit, MOMENT_DATE_FORMAT, HabitAction } from './models';
import moment from 'moment';
import { FIRST_DAY_OF_WEEK, env } from '../../env';
import ulog from 'ulog';
import { calculatePlantExperience } from '../../modules/gamify/utilsGamify';

const log = ulog('utils');

export interface GamifyRewards {
  gold:number,
  experience: number,
  items:any[]
}

export const mergeRewards = (rewards1: GamifyRewards, 
                             rewards2: GamifyRewards): GamifyRewards => {
  return Object.assign({
    gold: rewards1.gold + rewards2.gold,
    experience: rewards1.experience + rewards2.experience,
    items: [...rewards1.items, ...rewards2.items]
  });
}



export const getInitGamifyRewards =  (base?:GamifyRewards):GamifyRewards =>  {
  return {...{ gold: 0, experience: 0, items:[] }, ...base};
}


const sortByDate = (a, b) =>{
  if(a.date > b.date) return 1;
  return -1;
}

export const calculateCurrentStreak = (habit: Habit, actions: HabitAction[]) => {
    //loop through actions and add up rewards
    let r ={habit: Object.assign(habit), rewards: getInitGamifyRewards()};
    let rewards: GamifyRewards = getInitGamifyRewards();
    actions.sort(sortByDate).forEach(action => {
      //make sure we don't have future day, or past last calculated date day
      if(r.habit.lastCalculatedDate){
        if(moment(action.date).isBefore(moment(r.habit.lastCalculatedDate)))
          throw new Error('Action date is too old, can not modify this action');
        if(moment(action.date).isSame(moment(r.habit.lastCalculatedDate)))
          throw new Error('Action for this date already submitted.');
      }
      if(moment(action.date).isAfter(moment()))
        throw new Error('Action date is in the future, cannot modify this action');
      
      if(r.habit.regularityInterval === 'day')
        r = calculateDailyChallengeStreak(r.habit, action)
      else if(habit.regularityInterval === 'week')
        r = calculateWeeklyChallengeStreak(r.habit, action)
      else if(r.habit.regularityInterval === 'month')
        r = calculateMonthlyChallengeStreak(r.habit, action)
      else {
        throw new Error('Challenge has incorrect regularityInterval, ' + 
          r.habit.regularityInterval )
      }
      rewards = mergeRewards(r.rewards, rewards);
    });
    const newHabit = addPlantExperience(r.habit, r.rewards);
    console.log(rewards, newHabit);
    return {habit: newHabit, rewards};
}

const addPlantExperience = (habit: Habit, rewards: GamifyRewards): Habit => {
  const h = Object.assign(habit);
  h.plantExp += rewards.experience;
  if(h.plantExp >= h.plantNextLevelExp){
    h.plantLevel++;
    h.plantExp = h.plantExp - h.plantNextLevelExp;
    h.plantNextLevelExp = calculatePlantExperience(h.plantLevel,h.plantDifficultyLevel);
  }
  return h
}


//from action and back
const calculateDailyChallengeStreak = (habit: Habit, action: HabitAction) => {
  

  if(!habit.lastCalculatedDate) {
    habit.actions = {};
    habit.lastCalculatedDate = moment(action.date).subtract(1,'d').format(MOMENT_DATE_FORMAT);
    habit.biggestStreak = 0;
    habit.currentStreak = 0;
  }

  habit.actions[action.date] = action;

  let currentAction;
  let currentDateMoment = moment(habit.lastCalculatedDate).add(1, 'd');

  //run this after going action/lastcalculateddate logic
  while(currentDateMoment.isSameOrBefore(moment(action.date))) {
    currentAction = habit.actions[currentDateMoment.format(MOMENT_DATE_FORMAT)];

    //see if its null, no action or if contains values
    if(currentAction) {
      //do we have a value
      if(currentAction.value >= habit.regularityEachDayGoal){
        //success
        habit.currentStreak++;
      }
      else {
        //we have an action, but not a success
        habit.currentStreak = 0;
      }
    }
    else {
        //currentAction is null, failed
        habit.currentStreak = 0;
    }
    if(habit.currentStreak > habit.biggestStreak)
      habit.biggestStreak = habit.currentStreak;

    currentDateMoment.add(1, 'day');
  }

  habit.lastCalculatedDate = action.date;

  //calculate rewards
  let rewards = getInitGamifyRewards();
  if(habit.currentStreak === 0){
    rewards.gold = Math.floor(env.GAMIFY_HABIT_GOLD_BASE_REWARD * 
                        (action.value / habit.regularityEachDayGoal));
    rewards.experience = Math.floor(env.GAMIFY_HABIT_EXPERIENCE_BASE_REWARD * 
                        (action.value / habit.regularityEachDayGoal));
  }
  else {
    rewards.gold = calculateGoldByStreak(habit.currentStreak, 
                                          habit.difficulty,
                                          env.GAMIFY_HABIT_GOLD_BASE_REWARD);
    rewards.experience = calculateExperienceByStreak(habit.currentStreak,
                                          habit.difficulty,
                                          env.GAMIFY_HABIT_EXPERIENCE_BASE_REWARD);
  }
  return {habit: Object.assign(habit), rewards};
}



const analizeDay = (currentAction: HabitAction, 
                     habit:Habit):{habit:Habit, 
                                   rewards:GamifyRewards} => {
   //see if its null, no action or if contains values
   let rewards = getInitGamifyRewards();
   if(currentAction) {
    //do we have a value
    if(currentAction.value >= habit.regularityEachDayGoal){
      //success
      if(habit.currentTimeperiedStreak < habit.regularityIntervalGoal){
        habit.currentTimeperiedStreak++;
        habit.currentStreak++;
        rewards.gold = calculateGoldByStreak(habit.currentStreak, 
          habit.difficulty,
          env.GAMIFY_HABIT_GOLD_BASE_REWARD);
        rewards.experience = calculateExperienceByStreak(habit.currentStreak,
          habit.difficulty,
          env.GAMIFY_HABIT_EXPERIENCE_BASE_REWARD);
      }
      else
      {
        //we made it, but we are over the goal value, just give basic bonus
        //make it half of even a non streak one
        rewards.gold = Math.floor(env.GAMIFY_HABIT_GOLD_BASE_REWARD/2);
        rewards.experience = Math.floor(env.GAMIFY_HABIT_EXPERIENCE_BASE_REWARD/1.5);
      }
    } 
    else {
      //we didn't make it this day, just give a basic, fraction of base reward
      rewards.gold = calculateGoldByStreak(habit.currentStreak, 
        habit.difficulty,
        env.GAMIFY_HABIT_GOLD_BASE_REWARD);
      rewards.experience = calculateExperienceByStreak(habit.currentStreak,
        habit.difficulty,
        env.GAMIFY_HABIT_EXPERIENCE_BASE_REWARD);
    }
  }
   
  if(habit.currentStreak > habit.biggestStreak)
    habit.biggestStreak = habit.currentStreak;
  
  return {habit: Object.assign(habit), rewards};
}

//from action and back
const calculateMonthlyChallengeStreak = (h: Habit, action: HabitAction) => {
  let habit = Object.assign(h);
  if(!habit.lastCalculatedDate) {
    habit.actions = {};
    habit.lastCalculatedDate = moment(action.date).subtract(1,'d').format(MOMENT_DATE_FORMAT);
    habit.biggestStreak = 0;
    habit.currentStreak = 0;
    habit.currentTimeperiedStreak = 0;
    habit.currentTimeperiodLastDay = moment(habit.lastCalculatedDate).date(1)
                                        .add(1, 'month').format(MOMENT_DATE_FORMAT);
  }

  habit.actions[action.date] = action;

  let currentAction;

  let nextTimeperiodFirstDay = moment(habit.currentTimeperiodLastDay);
  let currentDateMoment = moment(habit.lastCalculatedDate).add(1, 'd');
  let rewards = getInitGamifyRewards();
  //run this after going action/lastcalculateddate logic
  while(currentDateMoment.isSameOrBefore(moment(action.date))) {
    currentAction = habit.actions[currentDateMoment.format(MOMENT_DATE_FORMAT)];

    //are we in the same week
    if(currentDateMoment.isBefore(nextTimeperiodFirstDay)) {
      const res = analizeDay(currentAction, habit)
      habit = res.habit;
      rewards = res.rewards;

    }
    else{ 
      //starting new timeperiod
      //see if we made it last period
      if(habit.currentTimeperiedStreak < habit.regularityIntervalGoal){
        //we didn't make it, clear the streak
        habit.currentStreak = 0;
      }
      nextTimeperiodFirstDay.add(1, 'month');
      habit.currentTimeperiodLastDay = nextTimeperiodFirstDay.format(MOMENT_DATE_FORMAT);
      //if we are before action date, its an error, too big of time span
      if(currentDateMoment.isAfter(nextTimeperiodFirstDay)){
        throw new Error('Action dates are too much apart.');
      }
      habit.currentTimeperiedStreak = 0;
      const res = analizeDay(currentAction, habit);
      habit = res.habit;
      rewards = res.rewards;
    }
    currentDateMoment.add(1, 'day');
  }

  habit.lastCalculatedDate = action.date;
  return {habit, rewards};
}



const calculateWeeklyChallengeStreak = (h:Habit, action:HabitAction) => {
  let habit = h;
  if(!habit.lastCalculatedDate) {
    habit.lastCalculatedDate = moment(action.date).subtract(1,'d').format(MOMENT_DATE_FORMAT);
    habit.biggestStreak = 0;
    habit.currentStreak = 0;
    habit.currentTimeperiedStreak = 0;
    habit.currentTimeperiodLastDay = moment(habit.lastCalculatedDate).day(FIRST_DAY_OF_WEEK)
                                          .add(1, 'week').format(MOMENT_DATE_FORMAT);
                                          habit.actions = {};
  }

  habit.actions[action.date] = action;

  let currentAction;

  let nextWeekFirstDay = moment(habit.currentTimeperiodLastDay);
  let currentDateMoment = moment(habit.lastCalculatedDate).add(1, 'd');
  let rewards = getInitGamifyRewards();
  //run this after going action/lastcalculateddate logic
  while(currentDateMoment.isSameOrBefore(moment(action.date))) {
    currentAction = habit.actions[currentDateMoment.format(MOMENT_DATE_FORMAT)];

    //are we in the same week
    if(currentDateMoment.isBefore(nextWeekFirstDay)) {
      const res = analizeDay(currentAction, habit)
      rewards = res.rewards;
      habit = res.habit;
    }
    else{ 
      //starting new timeperiod
      //see if we made it last period
      if(habit.currentTimeperiedStreak < habit.regularityIntervalGoal){
        //we didn't make it, clear the streak
        habit.currentStreak = 0;
      }
      nextWeekFirstDay.add(1, 'week');
      habit.currentTimeperiodLastDay = nextWeekFirstDay.format(MOMENT_DATE_FORMAT);
      //if we are before action date, its an error, too big of time span
      if(currentDateMoment.isAfter(nextWeekFirstDay)){
        throw new Error('Action dates are too much apart.');
      }
      habit.currentTimeperiedStreak = 0;
      const res = analizeDay(currentAction, habit);
      habit = res.habit;
      rewards = res.rewards;
    }
    currentDateMoment.add(1, 'day');
  }

  habit.lastCalculatedDate = action.date;
  return {habit, rewards};
}


const calculateExperienceByStreak = (streak, difficulty,  baseXP) => {
  let exponent = 0.7 + difficulty/5;
  return Math.floor(baseXP + (streak * exponent))
  
}

const calculateGoldByStreak = (streak, difficulty,  baseXP) => {
  let exponent = 1 + difficulty/5;
  return Math.floor(baseXP + (streak * exponent))
  
}

