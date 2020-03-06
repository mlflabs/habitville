import { BehaviorSubject } from 'rxjs';
import { toast } from 'react-toastify';
import { Todo } from '../../pages/todo/models';
import { Habit } from '../../pages/habits/models';
import { dataService } from '../data/dataService';
import { calculateLevelExperience, calculateDoneTodoGold, calculateDoneTodoExperience } from './utilsGamify';
import { throttleTime } from '../../../node_modules/rxjs/operators';
import { isEqual } from 'lodash';
import { getInitGamifyRewards, GamifyRewards } from '../../pages/habits/utilsHabits';
import { generateCollectionId, genrateMetaData, TYPE_SETTINGS, getDefaultProject } from '../data/utilsData';
import { env } from '../../env';
import { authService } from '../auth/authService';
import ulog from 'ulog';

const log = ulog('gamify');


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
    this.unsubscribe();
    this._userId = userid;
    const dataSub = dataService.getReadySub().subscribe(async (ready) => {
      if(!ready) return;
      const doc = await this.loadInitDocs(userid);
      const sub = this.state$.pipe(throttleTime(10000)).subscribe(()=>{
        this._save();
      })
  
      const sub2 = dataService.subscribeDocChanges(this.getGamifyDocId())
        .subscribe(doc => {
          const equal = isEqual(this._state, doc.state);
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
        items: []
      });
    }

    if(todo.done){
      this.addGold(todo.newRewards.gold);
      this.messageReceivedGold(todo.newRewards.gold);
      this.addExperience(todo.newRewards.experience);
      this.messageReceivedExperience(todo.newRewards.experience)
    }
    else {
      this.addGold(todo.newRewards.gold * -1);
      this.messageLostGold(todo.newRewards.gold);
      this.addExperience(todo.newRewards.experience * -1);
      this.messageLostExperience(todo.newRewards.experience);
    }

    return {...{}, ...todo};
  }

  public calculateNewTodo = (todo: Todo): Todo => {
    todo.newRewards = getInitGamifyRewards({
      gold: env.TODO_NEW_GOLD_REWARDS,
      experience: env.TODO_NEW_EXPERIENCE_REWARDS,
      items: [],
    });

    this.addGold(todo.newRewards.gold);
    this.messageReceivedGold(todo.newRewards.gold)
    this.addExperience(todo.newRewards.experience);
    this.messageReceivedExperience(todo.newRewards.experience)

    return {...{} ,...todo};
  }

  public calculateNewHabitRewards = (habit:Habit): Habit => {
    habit.newRewards = getInitGamifyRewards({
      gold: env.HABIT_REWARDS_NEW_GOLD,
      experience: env.HABIT_REWARDS_NEW_EXPERIENCE,
      items: [],
    });

    this.addGold(habit.newRewards.gold);
    this.messageReceivedGold(habit.newRewards.gold)
    this.addExperience(habit.newRewards.experience);
    this.messageReceivedExperience(habit.newRewards.experience)

    return {...{}, ...habit};
  }

  private addGold(value:number, save = true) {
    this._state = {...this._state, ...{gold: this._state.gold + value}};
    if(save)this.state = this._state;
  }

  private addExperience(value: number, save = true) {
    let experience = this._state.experience + value;
    
    if(experience > this._state.maxExperience){
      experience = (this._state.maxExperience - experience) * -1;
      this._state = {...this._state, 
        ...{maxExperience: calculateLevelExperience(this._state.level+1),
            level: this._state.level + 1}}
    }
    this._state = {...this._state, ...{experience}}
    if(save) this.state = this._state;
  }

  public addRewards = (rewards:GamifyRewards) => {
    if(rewards.gold > 0) {
      this.messageReceivedGold(rewards.gold);
      this.addGold(rewards.gold, false);
    }
    if(rewards.experience > 0){
      this.messageReceivedExperience(rewards.experience);
      this.addExperience(rewards.experience, false)
    }

    if(rewards.gold > 0 && rewards.experience > 0) {
      this.state = this._state;
    }
  }

  private messageReceivedGold(gold: number, preMessage?:string, postMessage?:string) {
    if(!preMessage) preMessage = '';
    if(!postMessage) postMessage = '';
    toast.success(preMessage+' You have received ' + gold + ' gold '+postMessage,{autoClose: env.MESSAGE_DURATION});
  }

  private messageLostGold(gold:number, preMessage?:string, postMessage?:string) {
    if(!preMessage) preMessage = '';
    if(!postMessage) postMessage = '';
    toast.error(preMessage+' You have lost ' + gold + ' gold'+postMessage, {autoClose: env.MESSAGE_DURATION});
  }

  private messageReceivedExperience(exp: number, preMessage?:string, postMessage?:string) {
    if(!preMessage) preMessage = '';
    if(!postMessage) postMessage = '';
    toast.success(preMessage+' You have received ' + exp + ' experience'+postMessage,{autoClose: env.MESSAGE_DURATION});
  }

  private messageLostExperience(exp:number, preMessage?:string, postMessage?:string) {
    if(!preMessage) preMessage = '';
    if(!postMessage) postMessage = '';
    toast.error(preMessage+' You have lost ' + exp + ' experience'+postMessage, {autoClose: env.MESSAGE_DURATION});
  }
  
  private async _save() {
    try{
      const doc = await dataService.getDoc(this.getGamifyDocId(), TYPE_SETTINGS);

      if(!doc){
        return;
      }

      const equal = isEqual(this._state, doc.state);
      //make sure we are not saving the init state
      const initEqual = isEqual(this.state, getInitGamifyState());
      if(!equal && !initEqual && doc.userid ===  this._userId) {
        dataService.save({...doc, ...{state: this._state}}, TYPE_SETTINGS);
      }
    }
    catch(e) {
      log.error(e);
    }
    
  }

  private getGamifyDocId(): string {
    const defaultProject = getDefaultProject(authService.userid);
    const id =  generateCollectionId(defaultProject.id, 'gamify', '');
    return id.substring(0, id.length-1);
  }

  private async loadInitDocs(id: string): Promise<any> {
    try {
      const s = await dataService.getDoc(this.getGamifyDocId(), TYPE_SETTINGS);
      if(s) return s;
      const ts = Date.now();   
      if(id === this._userId){  //half second pased, see if state changed
        const res = await dataService.save({
          id: this.getGamifyDocId(),
          state: getInitGamifyState(),
          type: TYPE_SETTINGS,
          [env.ACCESS_META_KEY]: genrateMetaData(id),
          userid: id,
          created: ts,
          updated: ts
        }, TYPE_SETTINGS)
      return res;
      }
    }
    catch(e) {
      log.error(e.red, id);
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


