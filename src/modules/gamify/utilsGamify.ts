import { Todo } from "../../pages/todo/models";
import moment from 'moment';
import { TODO_DONE_GOLD_REWARDS, TODO_DONE_EXPERIENCE_REWARDS } from "./gamifyService";


export const calculateLevelExperience = (level:number): number => {
  let exp = 0;
    for(let x = 1; x < level; x++){
      exp += Math.floor((x+100) * Math.pow(2,(x/7)))
    }
  return Math.floor(exp/4);
}

export const HEALTH_BASE = 50;
export const calculateLevelHealth = (level:number): number => {
  let exp = HEALTH_BASE;
    for(let x = 1; x < level; x++){
      //console.log(Math.floor((x+150) * Math.pow(2,(x/50))));
      exp += Math.floor(5 + (x/3));
    }
  return exp;
}

export const HABIT_REWARDS_GOLD_PERCENTAGE_INCREASE = 0.2;
export const HABIT_REWARDS_EXPERIENCE_PERCENTAGE_INCREASE = 0.1;
export const calculateDoneTodoGold = (todo:Todo): number => {

  let days = 0;
  //how many days past
  if(todo.date)
    days = moment(todo.date).diff(moment(),'hour');

  console.log('Diff Days::: ', days)
  
  const rew =TODO_DONE_GOLD_REWARDS + (HABIT_REWARDS_GOLD_PERCENTAGE_INCREASE * days);

  return Math.floor(rew);


}

export const calculateDoneTodoExperience = (todo:Todo): number => {

  let days = 0;
  //how many days past
  if(todo.date)
    days = moment(todo.date).diff(moment(),'hour');

  console.log('Diff Days::: ', days)
  
  const rew =TODO_DONE_EXPERIENCE_REWARDS + 
    (HABIT_REWARDS_EXPERIENCE_PERCENTAGE_INCREASE * days);

  return Math.floor(rew);


}


