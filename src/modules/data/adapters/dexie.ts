import Dexie from 'dexie';
import { BehaviorSubject, Subject } from 'rxjs';
import { DataChangeEvent } from '../dataService';
import { Subscription } from 'rxjs';
import { env } from '../../../env';
import ulog from 'ulog';

const log = ulog('dexie');

export interface DatabaseScheme {
  name: string,
  version: number,
  tables: TableScheme[],
}

export interface TableScheme {
  name: string,
  columns: string,
  sync: boolean,
}


export default class DexieAdapter {

  private db;
  private _ready = false;
  public ready$ = new BehaviorSubject(this._ready);
  private _subscriptions:Subscription[] = [];

  public changes$ = new Subject<DataChangeEvent>();

  constructor(scheme: DatabaseScheme) {
    this.db = new Dexie(env.APP_ID +  scheme.name+ '_dexie');
    const stores = {};
    scheme.tables.forEach(t => {
      stores[t.name] = t.columns;
    });
    this.db.version(scheme.version).stores(stores);
    this._init();
  }

  private async _init() {
    try {
      await this.db.open();
      this._ready = true;
      this.ready$.next(true);
    }
    catch(e) {
      log.error(e);
    }
  }

  public async destroy() {
    this._subscriptions.forEach(sub => {
      if(sub)sub.unsubscribe();
    })
  }

  public async getDoc(id: string, collection: string): Promise<any> {
    //const res = await this.db[collection].where('id').equals(id).first();
    const res = await this.db[collection].get({id});
    if(res) return res;
    return null;
  }

  public async getBulk(ids: string[], collection: string): Promise<any> {
    const res = await this.db[collection].bulkGet(ids);
    return res.filter(doc => doc !== undefined)
  }

  public async queryByProperty(field: string, operator: string, 
      value: any, collection: string): Promise<any> {
    switch(operator) {
      case 'equals':
        const docs = await this.db[collection].where(field).equals(value).toArray();
        return docs;
      case 'startsWith':
        return await this.db[collection].where(field).startsWith(value).toArray();
      case 'notEqual':
        return await this.db[collection].where(field).notEqual(value).toArray();
      default:
        throw new Error('Missing proper operator, given: '+ operator);
    }
  }

  public async getProjectItems(projectid: string, collection: string) {
    const res = await this.db[collection].where('id').startsWith(projectid).toArray();
    return res;
  }

  public async save(doc: any, collection: string, setDirty = true){
    if(setDirty)
      doc.dirty = 1;
    const res = await this.db[collection].put(doc);
    if(res) {
      this.changes$.next({doc});
      return true
    }
    return false;
  }

  public async saveFromSync(docs: any[], collection: string){
    const res = await this.db[collection].bulkPut(docs);
    if(res) {
      docs.forEach(doc => {
        this.changes$.next({doc});
      })
      return true
    }
    return false;
  }


}