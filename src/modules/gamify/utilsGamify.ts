import { Todo } from "../../pages/todo/models";
import moment from 'moment';
import { env } from "../../env";


export const calculateLevelExperience = (level:number): number => {
  let exp = 0;
    for(let x = 1; x < level; x++){
      exp += Math.floor((x+100) * Math.pow(2,(x/7)))
    }
  return Math.floor(exp/4);
}

//diff 1-5
export const calculatePlantExperience = (level:number, diff = 0): number => {
  let exp = 0;
  const d = diff * diff * 10;
    for(let x = 1; x < level; x++){
      exp += Math.floor((x+100+d) * Math.pow(2,(x/7)))
    }
  return Math.floor(exp/4) + 2;
}


export const calculateDoneTodoGold = (todo:Todo): number => {
  let days = 0;
  //how many days past
  if(todo.date)
    days = moment(todo.date).diff(moment(),'hour');
  const rew = env.TODO_DONE_GOLD_REWARDS + (env.HABIT_REWARDS_GOLD_PERCENTAGE_INCREASE * days);
  return Math.floor(rew);
}

export const calculateDoneTodoExperience = (todo:Todo): number => {
  let days = 0;
  //how many days past
  if(todo.date)
    days = moment(todo.date).diff(moment(),'hour');
  const rew =env.TODO_DONE_EXPERIENCE_REWARDS + 
    (env.HABIT_REWARDS_EXPERIENCE_PERCENTAGE_INCREASE * days);
  return Math.floor(rew);


}


