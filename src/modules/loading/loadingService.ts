
import { BehaviorSubject } from 'rxjs';



export class LoadingService {
  private _loading: boolean = false;
  

  public loading$ = new BehaviorSubject({show: this._loading, msg: 'Loading...'});

  showLoading(msg = "Loading...") {
    this._loading = true;
    this.loading$.next({show:true, msg});
  }

  hideLoading() {
    this._loading = false;
    this.loading$.next({show:false, msg:''});
  }

  public get loading(): boolean {
    return this._loading;
  }


  startLoadingTimer() {

  }

}
export const loadingService = new LoadingService();


