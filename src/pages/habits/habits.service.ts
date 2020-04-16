
import { Habit, habitStage, TYPE_HABBIT } from './models';
import { BehaviorSubject, Subscription } from 'rxjs';
import { dataService } from '../../modules/data/dataService';
import { saveIntoArray, isThisUserProject } from '../../modules/data/utilsData';
import { ProjectItem } from '../../modules/data/models';
import { gamifyService } from '../../modules/gamify/gamifyService';
import _ from 'lodash';
import { authService } from '../../modules/auth/authService';
import ulog from 'ulog';

const log = ulog('habits');

export interface habitsState {
  selected: Habit | null,
  habits: Habit[],
  stageFilter: habitStage
}

export const getInitHabitsState = (): habitsState => {
  return {
    selected: null,
    habits: [],
    stageFilter: habitStage.current
  }
}

export class HabitsService {

  // @ts-ignore:  we force init later on in init function
  private _project: ProjectItem;
  public getProject():ProjectItem {return this._project}
  private _state: habitsState = getInitHabitsState();

  public state$ = new BehaviorSubject(this._state);

  private _docs: Habit[] = [];

  public docs$ = new BehaviorSubject(this._docs);

  private _subscription: Array<Subscription> = [];

  public init(project: ProjectItem) {
    const dataSub = dataService.getReadySub().subscribe(async (ready) => {
      if (!ready) return;
      const equals = _.isEqual(project, this._project);
      if (equals) return;

      await this._init(project);

      dataSub.unsubscribe();
    });

  }

  async _init(project: ProjectItem) {
    if (this._project && this._project.id === project.id) return;
    this._project = project;
    this._docs = await dataService.getAllByProject(project.id, TYPE_HABBIT);
    this.filterhabits();

    //manage changes

    const sub = dataService.subscribeProjectTypeChanges(project.id, TYPE_HABBIT)
      .subscribe(doc => {
        if (doc.deleted)
          this._docs = this._docs.filter(d => d.id !== doc.id);
        else {
          this._docs = saveIntoArray(doc, this._docs);
        }
        this.filterhabits();
        //TODO: need to optimize this, maybe start using the view query, see bottom of file
      });
    this._subscription.push(sub);
  }



  private filterhabits() {
    const filtered = this._docs.filter(doc => this.filterFunction(doc));
    this.state = { ...this._state, ...{ habits: filtered } };
  }

  private filterFunction(doc: Habit) {
    return (doc.stage === this._state.stageFilter && !doc.deleted)
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



  public save(doc: Habit) {
    log.info("Save: ", doc, this._project, TYPE_HABBIT);

    //check if its new, no id, its noew
    if (!doc.id) {
      if(isThisUserProject(this._project.id, authService.getUser().id)){
        doc = Object.assign(gamifyService.calculateNewHabitRewards(doc));
        gamifyService.removeUserItem(doc.plantName);

        return dataService.save({ ...{ done: false }, ...doc }, TYPE_HABBIT, { projectid: this._project.id });
      }
      else {

      }
    }
    else
      dataService.save({ ...{ done: false }, ...doc }, TYPE_HABBIT, { projectid: this._project.id });
  }

  public remove(id: string) {
    dataService.remove(id, TYPE_HABBIT);
  }

  public select(doc: Habit) {
    this.state = { ...this._state, ...{ selected: doc } };
  }

  public changeStageFilter(stage: habitStage) {
    if (stage === this._state.stageFilter) return;
    this._state = { ...this._state, ...{ stageFilter: stage } };
    this.filterhabits();

  }


  public unsubscribe() {
    if (!this) return;
    this._subscription.forEach(sub => {
      if (sub)
        sub.unsubscribe();
    });
  }

}
