import { BehaviorSubject } from 'rxjs';
import { toast } from 'react-toastify';
import { Todo } from '../../pages/todo/models';
import { Habit, HabitProgress } from '../../pages/habits/models';
import { saveIntoArray, waitMS } from '../../utils';
import { dataService } from '../data/dataService';
import { calculateLevelExperience, calculateDoneTodoGold, calculateDoneTodoExperience } from './utilsGamify';
import { throttleTime } from '../../../node_modules/rxjs/operators';
import { isEqual } from 'lodash';
import { getInitGamifyRewards } from '../../pages/habits/utilsHabits';
import { generateCollectionId, genrateMetaData } from '../data/utilsData';
import { env } from '../../env';


export const HABIT_REWARDS_GOLD_BASE = 5;
export const HABIT_REWARDS_GOLD_PERCENTAGE_INCREASE = 0.2;
export const HABIT_REWARDS_EXPERIENCE_BASE = 3;
export const HABIT_REWARDS_EXPERIENCE_PERCENTAGE_INCREASE = 0.2;
export const HABIT_REWARDS_NEW_GOLD = 5;
export const HABIT_REWARDS_NEW_EXPERIENCE = 5; 

export const TODO_NEW_GOLD_REWARDS = 1;
export const TODO_DONE_GOLD_REWARDS = 3;
export const TODO_NEW_EXPERIENCE_REWARDS = 2;
export const TODO_DONE_EXPERIENCE_REWARDS = 5;

export const MESSAGE_DURATION = 3000;

export interface GamifyState {
  health:number,
  maxHealth: number,
  experience: number,
  maxExperience: number,
  level: number,
  gold: number,

  items: any[],
}

export const getInitGamifyState = () => {
  return {
    health: 50,
    maxHealth: 50,
    experience: 0,
    maxExperience: 20,
    level: 1,
    gold: 0,

    items:[]
  }
}

export class GamifyService {

  private _userId = '';
  private _subscriptions:any[] = [];
  private _state: GamifyState = getInitGamifyState();
  
  public state$ = new BehaviorSubject<GamifyState>(this._state);
  

  public async init(userid: string) {
    console.log('-------------Gamify INIT', userid);
    this.unsubscribe();
    this._userId = userid;
    const dataSub = dataService.getReady().subscribe(async (ready) => {
      if(!ready) return;

      const doc = await this.loadInitDocs(userid);
      console.log('GAMIFY DOC:::: ', doc);

      const sub = this.state$.pipe(throttleTime(10000)).subscribe(()=>{
        this._save();
      })
  
      const sub2 = dataService.subscribeDocChanges(this.getGamifyDocId() ,1000)
        .subscribe(doc => {
          console.log("DOC================================", doc);
          const equal = isEqual(this._state, doc.state);
          console.log("Gamify State Equal: ", equal);
          if(!equal)
            this.state = doc.state;
        });
  
      this._subscriptions.push(sub);
      this._subscriptions.push(sub2);
  
      //load the init stae
      if(doc)
        this.state = doc.state;

      dataSub.unsubscribe();
    })
  }



  private unsubscribe() {
    this._subscriptions.forEach(s=>{
      if(s)s.unsubscribe();
    })
  }

  public calculateFinishedTodoRewards = (todo: Todo): Todo => {
    if(!todo.doneRewards || !todo.doneRewards.gold){
      todo.newRewards = getInitGamifyRewards({
        gold: calculateDoneTodoGold(todo),
        experience: calculateDoneTodoExperience(todo),
        item: null
      });
    }

    if(todo.done){
      // @ts-ignore: top, just added values
      this.addGold(todo.newRewards.gold);
      // @ts-ignore: 
      this.messageReceivedGold(todo.newRewards.gold)
      // @ts-ignore: top, just added values
      this.addExperience(todo.newRewards.experience);
      // @ts-ignore:
      this.messageReceivedExperience(todo.newRewards.experience)
    }
    else {
      // @ts-ignore: top, just added values
      this.addGold(todo.newRewards.gold * -1);
      // @ts-ignore: 
      this.messageLostGold(todo.newRewards.gold)
      // @ts-ignore: top, just added values
      this.addExperience(todo.newRewards.experience * -1);
      // @ts-ignore:
      this.messageLostExperience(todo.newRewards.experience)
    }

    return {...{}, ...todo};
  }

  public calculateNewTodo = (todo: Todo): Todo => {
    todo.newRewards = getInitGamifyRewards({
      gold: TODO_NEW_GOLD_REWARDS,
      experience: TODO_NEW_EXPERIENCE_REWARDS,
      item: null,
    });

    // @ts-ignore: top, just added values
    this.addGold(todo.newRewards.gold);
    // @ts-ignore: 
    this.messageReceivedGold(todo.newRewards.gold)
    // @ts-ignore: top, just added values
    this.addExperience(todo.newRewards.experience);
    // @ts-ignore:
    this.messageReceivedExperience(todo.newRewards.experience)

    return {...{} ,...todo};
  }

  public calculateNewHabitRewards = (habit:Habit): Habit => {
    habit.newRewards = getInitGamifyRewards({
      gold: HABIT_REWARDS_NEW_GOLD,
      experience: HABIT_REWARDS_NEW_EXPERIENCE,
      item: null,
    });

    // @ts-ignore: top, just added values
    this.addGold(habit.newRewards.gold);
    // @ts-ignore: 
    this.messageReceivedGold(habit.newRewards.gold)
    // @ts-ignore: top, just added values
    this.addExperience(habit.newRewards.experience);
    // @ts-ignore:
    this.messageReceivedExperience(habit.newRewards.experience)

    return {...{}, ...habit};
  }

  private addGold(value:number) {
    this.state = {...this._state, ...{gold: this._state.gold + value}};
  }

  private addExperience(value: number) {
    let experience = this._state.experience + value;
    
    if(experience > this._state.maxExperience){
      experience = (this._state.maxExperience - experience) * -1;
      this._state = {...this._state, 
        ...{maxExperience: calculateLevelExperience(this._state.level+1),
            level: this._state.level + 1}}
    }
      
    
    this.state = {...this._state, ...{experience}}
  }

  public calculateHabitProgressRewards(habit:Habit, progress: HabitProgress): Habit {
    if(!habit.regularityEachDayGoal) habit.regularityEachDayGoal = 1; // default

    const prog: HabitProgress = Object.assign(progress)

    if(!progress.reward) {
      // calculate rewards
      prog.reward = getInitGamifyRewards();
      let gold = HABIT_REWARDS_GOLD_BASE;
      let exp = HABIT_REWARDS_EXPERIENCE_BASE;
      for(let i = 0; i<habit.currentStreak; i++) {
        gold += gold*HABIT_REWARDS_GOLD_PERCENTAGE_INCREASE;
        exp += exp*HABIT_REWARDS_EXPERIENCE_PERCENTAGE_INCREASE;
      }
      prog.reward.gold = Math.round(gold);
      prog.reward.experience = Math.round(exp);

      habit.progress = saveIntoArray(prog, habit.progress, 'date');
    }

    if(prog.value >= habit.regularityEachDayGoal) {
      
      if(prog.reward && prog.reward.gold){
        this.messageReceivedGold(prog.reward.gold);
        this.addGold(prog.reward.gold);
      }
        
      if(prog.reward && prog.reward.experience){
        this.messageReceivedExperience(prog.reward.experience);
        this.addExperience(prog.reward.experience)
      }
        
    }
    else {
      if(prog.reward && prog.reward.gold){
        this.messageLostGold(prog.reward.gold);
        this.addGold(prog.reward.gold * -1);
      }
        
      if(prog.reward && prog.reward.experience){
        this.messageLostExperience(prog.reward.experience * -1);
        this.addExperience(prog.reward.experience * -1)
      }
        
    }

    return habit;
  }

  private messageReceivedGold(gold: number, preMessage?:string, postMessage?:string) {
    if(!preMessage) preMessage = '';
    if(!postMessage) postMessage = '';
    toast.success(preMessage+' You have received ' + gold + ' gold '+postMessage,{autoClose:MESSAGE_DURATION});
  }

  private messageLostGold(gold:number, preMessage?:string, postMessage?:string) {
    if(!preMessage) preMessage = '';
    if(!postMessage) postMessage = '';
    toast.error(preMessage+' You have lost ' + gold + ' gold'+postMessage, {autoClose:MESSAGE_DURATION});
  }

  private messageReceivedExperience(exp: number, preMessage?:string, postMessage?:string) {
    if(!preMessage) preMessage = '';
    if(!postMessage) postMessage = '';
    toast.success(preMessage+' You have received ' + exp + ' experience'+postMessage,{autoClose:MESSAGE_DURATION});
  }

  private messageLostExperience(exp:number, preMessage?:string, postMessage?:string) {
    if(!preMessage) preMessage = '';
    if(!postMessage) postMessage = '';
    toast.error(preMessage+' You have lost ' + exp + ' experience'+postMessage, {autoClose:MESSAGE_DURATION});
  }
  
  private async _save() {
    try{
      const doc = await dataService.getDoc(this.getGamifyDocId());

      if(!doc){
        console.log("Couldn't load gamify doc: ", this.getGamifyDocId());
        return;
      }

      console.log('========Gamify State Doc: ',this.getGamifyDocId(), doc);
      const equal = isEqual(this._state, doc.state);
      //make sure we are not saving the init state
      const initEqual = isEqual(this.state, getInitGamifyState());

      console.log('Saving gamify state::: ', equal, initEqual);
      if(!equal && !initEqual && doc.userid ===  this._userId) {
        console.log("Saving: ".blue, {...doc, ...{state: this._state}})
        dataService.save({...doc, ...{state: this._state}});
      }
    }
    catch(e) {
      console.log(e);
    }
    
  }

  private getGamifyDocId(): string {
    const defaultProject = dataService.getDefaultProject();
    return generateCollectionId(defaultProject.id, 'gamify', '');
  }

  private async loadInitDocs(id: string): Promise<any> {
    await waitMS(500);

    try {
      console.log('Gamify ID: ' + this.getGamifyDocId());
      const s = await dataService.getDoc(this.getGamifyDocId());
      console.log('--- gamify doc loaded: ', id, s);
      if(s) return s;
      console.log('Saving gamify new doc');   
      const ts = Date.now();   
      if(id === this._userId){  //half second pased, see if state changed
        const res = await dataService.save({
          id: this.getGamifyDocId(),
          state: getInitGamifyState(),
          type: 'gamify',
          [env.ACCESS_META_KEY]: genrateMetaData(id),
          userid: id,
          created: ts,
          updated: ts
        })
      return res;
      }
    }
    catch(e) {
      console.log(e.red, id);
    }

    
  }

  public get state(): GamifyState {
    return this._state;
  }
  public set state(value: GamifyState) {
    this._state = value;
    this.state$.next(value);
  }

}
export const gamifyService = new GamifyService();


