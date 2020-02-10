
import {  Habit, habitStage, TYPE_HABBIT } from './models';
import { BehaviorSubject, Subscription } from 'rxjs';
import { dataService } from '../../modules/data/dataService';
import { saveIntoArray, waitMS } from '../../modules/data/utilsData';
import { ProjectItem } from '../../modules/data/models';
import { gamifyService } from '../../modules/gamify/gamifyService';

export interface habitsState {
  selected: Habit|null,
  habits: Habit[],
  stageFilter: habitStage
}

export const getInitHabitsState = (): habitsState => {
  return {
    selected:null,
    habits: [],
    stageFilter: habitStage.current
  }
}


export class HabitsService {

  // @ts-ignore:  we force init later on in init function
  private _project: ProjectItem;

  private _state: habitsState = getInitHabitsState();
  
  public state$ = new BehaviorSubject(this._state);

  private _docs: Habit[] = [];
  
  public docs$ = new BehaviorSubject(this._docs);

  private _subscription: Array<Subscription> = [];

  constructor() {
    // this.loadQueryViews();
  }


  public init(project: ProjectItem) {
    const sub = dataService.pouchReady$.subscribe(ready => {
      if(ready) this._init(project);
    });
    this._subscription.push(sub);
  }

  async _init(project: ProjectItem) {
    console.log("Init: ", project, TYPE_HABBIT);
    if(this._project && this._project._id === project._id) return;

    this._project = project;
    await waitMS(500);
    this._docs = await dataService.getAllByProjectAndType(project._id, TYPE_HABBIT);
    console.log("Init Docs: ", this._docs);
    this.filterhabits();

    //manage changes

    const sub = dataService.subscribeProjectCollectionChanges(project._id, TYPE_HABBIT)
      .subscribe(doc => {
        console.log("habit Service Subscription: ", doc);
        if(doc._deleted)
          this._docs = this._docs.filter(d => d._id !== doc._id);
        else
          this._docs = saveIntoArray(doc, this._docs);

        this.filterhabits();
        //TODO: need to optimize this, maybe start using the view query, see bottom of file
      });
    this._subscription.push(sub);
  }



  private filterhabits() {
    console.log("Filterhabits", this._docs);
    const filtered = this._docs.filter(doc => this.filterFunction(doc));
    this.state = {...this._state, ...{habits: filtered}};
    console.log("Filtered State: ", this._state);
  }

  private filterFunction(doc:Habit) {
      return (doc.stage === this._state.stageFilter)
  }



  public get state(): habitsState {
    return this._state;
  }
  public set state(value: habitsState) {
    this._state = value;
    this.state$.next(this._state);
  }

  public get docs(): Habit[] {
    return this._docs;
  }
  public set docs(value: Habit[]) {
    this._docs = value;
    this.docs$.next(this._docs);
  }



  public save(doc:Habit) {
    console.log("Save: ", doc, this._project, TYPE_HABBIT);

    //check if its new, no id, its noew
    if(!doc._id) {
      doc = Object.assign(gamifyService.calculateNewHabitRewards(doc));
    }

    dataService.saveInProject({...{done: false}, ...doc}, this._project, TYPE_HABBIT, null, null, true, true);
  }

  public remove(id: string) {
    dataService.remove(id, true);
  }

  public select(doc:Habit) {
    this.state = {...this._state, ...{ selected: doc} };
  }

  public changeStageFilter(stage: habitStage) {
    if(stage === this._state.stageFilter) return;
    this._state = {...this._state, ...{ stageFilter: stage} };
    this.filterhabits();

  }


  public unsubscribe() {
    if(!this) return;
    this._subscription.forEach(sub => {
      if(sub)
        sub.unsubscribe();
    });
  }

}



export  const habitsService = new HabitsService();