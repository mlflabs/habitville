
import { BehaviorSubject } from 'rxjs';
import { dataService } from '../data/dataService';
import { TYPE_SETTINGS } from '../data/utilsData';


export interface AppServiceState {
  showTutorial: boolean,
  tutorialStartingSlide: number
}

export class AppService {
  private _state:AppServiceState = {
    showTutorial: false,
    tutorialStartingSlide: 1};

  private _settingsDoc;
  public state$ = new BehaviorSubject<AppServiceState>(this._state);

  public async init() {
    const doc = await dataService.getSettingsDoc();
    if(doc)
      this._settingsDoc = doc;

    dataService.subscribeDocChanges(dataService.getSettingsDocId())
      .subscribe(doc => {
        this._settingsDoc = doc;
        this.updateStateFromSettingsDoc(doc);
    })
    
  }

  private updateStateFromSettingsDoc(doc) {
    this.state = {...this.state, ...{
      showTutorial: false,// doc.showTutorialModal || true,
      tutorialStartingSlide: doc.tutorialStartingSlide || 1
    }}
  }

  private _saveSettings() {
    const doc = {...this._settingsDoc, ...this._state};
    dataService.save(doc, TYPE_SETTINGS);
    
  }



  public showTutorial(show: boolean){
    console.log('Show Tutorial:::: ', show)
    this.state = {...this.state, ...{showTutorial: show}}
  }



  public get state(): AppServiceState {
    return this._state;
  }

  public set state(state:AppServiceState) {
    this._state = state;
    this.state$.next(state);
  }



}
export const appService = new AppService();