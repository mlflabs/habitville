import Dexie from 'dexie';
import { BehaviorSubject, Subject } from 'rxjs';
import { DataChangeEvent } from '../dataService';
import { Subscription } from 'rxjs';
import { env } from '../../../env';

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
    console.log('Dexie scheme: ', scheme, stores)
    this.db.version(scheme.version).stores(stores);
    this._init();
  }

  private async _init() {
    console.log('Dexie init');
    try {
      await this.db.open();
      this._ready = true;
      this._subscribe();
      this.ready$.next(true);
    }
    catch(e) {
      console.log(e);
    }
  }

  private async _subscribe() {
    /*
   this.db.on('changes', (changes) => {
      console.log('#####################################################', changes); 
      changes.forEach(change => {
        switch (change.type) {
          case 1: // CREATED
            this.changes$.next({doc: change.obj})
            break;
          case 2: // UPDATED
            this.changes$.next({doc: change.obj, old: change.oldObje})
          
            break;
          case 3: // DELETED
            
            break;
  
        }
      }); 
    });
    */
  }

  public async destroy() {
    this._subscriptions.forEach(sub => {
      if(sub)sub.unsubscribe();
    })
  }

  public async getDoc(id: string, collection: string): Promise<any> {
    console.log('Dexie getting doc::: ', id, collection);
    //const res = await this.db[collection].where('id').equals(id).first();
    const res = await this.db[collection].get({id});
    console.log('=========================', res);
    if(res) return res;
    return null;
  }

  public async getBulk(ids: string[], collection: string): Promise<any> {
    console.log('BULK GET: ', ids, collection);
    const res = await this.db[collection].bulkGet(ids);
    console.log(res);
    return res.filter(doc => doc !== undefined)
  }

  public async queryByProperty(field: string, operator: string, 
      value: any, collection: string): Promise<any> {
    console.log('%%%%%%%%%%%%%%%%% Dexie Query By Property::: ', 
        field, operator, value, collection);
    switch(operator) {
      case 'equals':
        const docs = await this.db[collection].where(field).equals(value).toArray();
        console.log(docs, collection, field, operator, value);
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
    console.log('Get Project items: ', projectid, collection);
    const res = await this.db[collection].where('id').startsWith(projectid).toArray();
    console.log(res);
    return res;
  }

  public async save(doc: any, collection: string, setDirty = true){
    console.log('---------------------------      Dexie Save: ', doc, collection);
    if(setDirty)
      doc.dirty = 1;
    const res = await this.db[collection].put(doc);
    console.log('SAVE RES: ', res);
    if(res) {
      this.changes$.next({doc});
      return true
    }
    return false;
  }

  public async saveFromSync(docs: any[], collection: string){
    console.log('&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&');
    console.log('Save form Sync::: ', docs, collection);
    const res = await this.db[collection].bulkPut(docs);

    console.log('SAVE RES: ', res);
    if(res) {
      //this.changes$.next({doc});
      docs.forEach(doc => {
        this.changes$.next({doc});
      })
      return true
    }
    return false;
  }


}