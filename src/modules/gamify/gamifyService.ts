import { BehaviorSubject } from 'rxjs';
import { toast } from 'react-toastify';
import { Todo } from '../../pages/todo/models';
import { Habit } from '../../pages/habits/models';
import { dataService } from '../data/dataService';
import { calculateLevelExperience, calculateDoneTodoGold, calculateDoneTodoExperience, calculatePlantExperience } from './utilsGamify';
import { throttleTime } from '../../../node_modules/rxjs/operators';
import { isEqual } from 'lodash';
import { getInitGamifyRewards, GamifyRewards } from '../../pages/habits/utilsHabits';
import { generateCollectionId, TYPE_SETTINGS, getDefaultProject } from '../data/utilsData';
import { env } from '../../env';
import { authService } from '../auth/authService';
import ulog from 'ulog';
import { MarketItem, MarketItemType, DEFAULT_SEED_NAME, defaultSeed } from '../market/models';
import { socialService } from '../social/social.service';
import { newMessage } from '../messages/models';
import i18n from 'i18next';
import { Landscape, getDefaultLandscape, LandscapeTree } from './models';
const log = ulog('gamify');




export interface GamifyState {
  experience: number,
  maxExperience: number,
  level: number,
  gold: number,

  userItems: MarketItem[],
  landscape: Landscape
}

export const getInitGamifyState = () => {
  return {
    experience: 0,
    maxExperience: 20,
    level: 1,
    gold: 0,
    userItems: [],
    landscape: getDefaultLandscape(),
    
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
          console.log(doc, this.state);
          const equal = isEqual(this._state, doc.state);
          if(!equal)
            this.state = {...this.state, ...doc.state};
        });
  
      this._subscriptions.push(sub);
      this._subscriptions.push(sub2);
      //load the init stae
      console.log(this.state, doc);
      if(doc){
        this.state = {...this.state, ...doc.state};
      }
        

      dataSub.unsubscribe();
    })
  }

  public buyItem(item:MarketItem) {
    if(item.price > this.state.gold) return;
    this._state.gold -= item.price;
    const i = this._state.userItems.find(i => i.name === item.name);
    if(i){
      i.quantity++;
    }
    else{
      this._state.userItems.push({...item, ...{quantity: 1}});
    }
    this.state = Object.assign(this._state);
  }

  public getUserSeeds(): MarketItem[] {
    return [...[defaultSeed],
            ...this.state.userItems.filter(i => i.itemType === MarketItemType.seed)]
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
    if(!habit.seedItem) throw new Error('Seed item cannot be undefined');
    
    habit.newRewards = getInitGamifyRewards({
      gold: env.HABIT_REWARDS_NEW_GOLD,
      experience: env.HABIT_REWARDS_NEW_EXPERIENCE,
      items: [],
    });

    habit.plantName = habit.seedItem.name;
    habit.plantLevel = 1;
    habit.plantExp = 0;
    habit.plantDifficultyLevel = habit.seedItem.difficulty;
    habit.plantNextLevelExp = calculatePlantExperience(habit.plantLevel, habit.plantDifficultyLevel);

    this.addGold(habit.newRewards.gold);
    this.messageReceivedGold(habit.newRewards.gold)
    this.addExperience(habit.newRewards.experience);
    this.messageReceivedExperience(habit.newRewards.experience)

    return {...{}, ...habit};
  }

  public removeUserItem(name:string) {
    console.log(name, this._state)
    if(name === DEFAULT_SEED_NAME) return;
    const item = this._state.userItems.find(i => i.name === name);
    if(!item) throw new Error('Item does not exist');

    item.quantity--;
    console.log('Removing item, ', item);
    if(item.quantity < 1) {
      console.log('0 left, so need to filter');
      this._state.userItems = this._state.userItems.filter(i => i.quantity > 0);
    }
    this.state = Object.assign(this._state);
  }

  private addGold(value:number, save = true) {
    this._state = {...this._state, ...{gold: this._state.gold + value}};
    if(save)this.state = this._state;
  }

  private addExperience(value: number, save = true) {
    let experience = this._state.experience + value;
    
    if(experience > this._state.maxExperience){
      const level = this._state.level + 1;
      experience = (this._state.maxExperience - experience) * -1;
      this._state = {...this._state, 
        ...{maxExperience: calculateLevelExperience(this._state.level+1),
            level}}

      socialService.sendMessage(newMessage('New level reached', 'userLevelUp', '', { level }));
    }
    this._state = {...this._state, ...{experience}}
    if(save) this.state = this._state;
  }

  public addRewards = (rewards:GamifyRewards, habit?:Habit) => {
    if(rewards.gold > 0) {
      this.messageReceivedGold(rewards.gold);
      this.addGold(rewards.gold, false);
    }
    if(rewards.experience > 0){
      this.messageReceivedExperience(rewards.experience);
      this.addExperience(rewards.experience, false)
    }

    if(habit) {
      this._state.landscape = this.updateLandscapeHabit(habit);
    }



    if(rewards.gold > 0 && rewards.experience > 0) {
      this.state = this._state;
    }
  }

  public updateLandscapeHabit(habit:Habit):Landscape {
    const landscape: Landscape = Object.assign(this.state.landscape);
    const plant = landscape.trees.find(tree => tree.habitId === habit.id)
    console.log(plant);
    if(!plant) {
      //lalculate position
      let position = Math.floor(Math.random() * 350) + 25;  
      const tree:LandscapeTree = {
        id: habit.seedItem?.id || "",
        name: habit.plantName,
        habitId: habit.id!,
        level: habit.plantLevel,
        position,
      }
      landscape.trees.push(tree);
    } 
    else {
      plant.id = habit.seedItem?.id || "";
      plant.name = habit.plantName;
      plant.habitId = habit.id!;
      plant.level = habit.plantLevel;
    }
    return landscape;
  }

  public changePlantPosition(habit: Habit, position:number): Landscape|undefined {
    const landscape: Landscape = Object.assign(this.state.landscape);
    const plant = landscape.trees.find(tree => tree.habitId === habit.id)
    console.log(plant);
    if(!plant) return;
   
    plant.position =  position; 

    this.state = {...this.state, ...{landscape}};
    return landscape;
  }

  public getPlantPosition(habit: Habit): number {
    const item = this.state.landscape.trees.find(t => t.habitId === habit.id)
    if(!item) return 0;

    return item.position;
  }

  private messageReceivedGold(gold: number) {
    const msg = i18n.t('gamify.messages.received') + 
                " " + gold + " " + i18n.t('market.gold');
    toast.success(msg,{autoClose: env.MESSAGE_DURATION});
  }

  private messageLostGold(gold:number) {
    const msg = i18n.t('gamify.messages.lost') + 
                " " + gold + " " + i18n.t('market.gold');
    toast.error(msg,{autoClose: env.MESSAGE_DURATION});
  }

  private messageReceivedExperience(exp: number) {
    const msg = i18n.t('gamify.messages.received') + 
                " " + exp + " " + i18n.t('gamify.exp');
    toast.success(msg,{autoClose: env.MESSAGE_DURATION});
  }

  private messageLostExperience(exp:number) {
    const msg = i18n.t('gamify.messages.lost') + 
                " " + exp + " " + i18n.t('gamify.exp');
    toast.error(msg,{autoClose: env.MESSAGE_DURATION});
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

  private unsubscribe() {
    this._subscriptions.forEach(s=>{
      if(s)s.unsubscribe();
    })
  }


}
export const gamifyService = new GamifyService();


