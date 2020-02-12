import Dexie from 'dexie';
import { BehaviorSubject } from 'rxjs';
import { dataService } from '../dataService';


export interface DatabaseScheme {
  name: string,
  version: number,
  tables: TableScheme[],
}

export interface TableScheme {
  name: string,
  columns: string,
}


export default class DexieAdapter {

  private db;
  private _ready = false;
  public ready$ = new BehaviorSubject(this._ready);

  constructor(scheme: DatabaseScheme) {
    this.db = new Dexie(scheme.name);
    const stores = scheme.tables.map(t => {
      return {[t.name]: t.columns}
    });
    this.db.version(scheme.version).stores(stores);
  }

  private async _init() {
    try {
      await this.db.open();
      this._ready = true;
      this.ready$.next(true);
    }
    catch(e) {
      console.log(e);
    }
  }

  private async _destroy() {

  }

  async getDoc(id: string): Promise<any> {

    return null;
  }



}