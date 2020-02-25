import { Observable, Subject, BehaviorSubject } from 'rxjs';
import { map, debounceTime, filter, throttleTime } from 'rxjs/operators';
import { getProjectChildId, generateCollectionId, 
  TYPE_SETTINGS, waitMS, getChannelFromProjectId } from './utilsData';

import { ProjectItem, DIV } from './models';
import _ from 'lodash';
import DexieAdapter, { DatabaseScheme } from './adapters/dexie';
import { TYPE_HABBIT } from '../../pages/habits/models';
import { TYPE_TODO, TYPE_TODO_LIST, TYPE_TODO_TAG } from '../../pages/todo/models';
import { TYPE_PARTY } from '../parties/models';
import { TYPE_MSG } from '../messages/models';
import { env } from '../../env';
import { authService } from '../auth/authService';
import localStorageService from '../localStorage/localStorageService';
import { syncData } from './sync';
import { post, getPostRequest } from '../ajax/ajax';
import ulog from 'ulog';
import { TYPE_SOCIAL } from '../social/models';

const log = ulog('dataService');

export interface DataChangeEvent {
  doc: any,
  old?: any,
}

const databaseScheme: DatabaseScheme =  {
  name: 'guest_dx',
  version: 17,
  tables: [
    {
      name: TYPE_SETTINGS,
      columns: 'id, dirty',
      sync: true
    },
    {
      name: TYPE_PARTY,
      columns: 'id, dirty, party, type, secondaryType',
      sync: true
    },
    {
      name: TYPE_TODO,
      columns: 'id, done, deleted, list, *tags, dirty',
      sync: true
    },
    {
      name: TYPE_TODO_LIST,
      columns: 'id, dirty, folder, secondaryType, fullname',
      sync: true
    },
    {
      name: TYPE_TODO_TAG,
      columns: 'id, dirty',
      sync: true
    },
    {
      name: TYPE_HABBIT,
      columns: 'id, dirty',
      sync: true
    },
    {
      name: TYPE_MSG,
      columns: 'id, messageType, dirty',
      sync: true
    },
    {
      name: TYPE_SOCIAL,
      columns: 'id, name, dirty, secondaryType',
      sync: true
    },
  ]
}



class DataService {
  private db;
  private authId:string = '';
  private _ready = false;
  public _ready$ = new BehaviorSubject(this._ready);
  public addSyncCall$ = new Subject(); // do we need to sync with server

  constructor() {
    //subscriptions
    this.addSyncCall$.pipe(
      throttleTime(5000),
    ).subscribe(() => {
        console.log('******************** SYNCING *************************')
        this._syncRemote();
      })
  }

  // access
  async getDoc(id: string|undefined,  collection: string): Promise<any> {
    if(id === undefined){
      log.error('Id was undefined ', id, collection);
      throw new Error('Doc Id cannot be undefined, check logic.');
    }
      
    console.log('Get Doc: ', id, collection);
    return await this.db.getDoc(id, collection);
  }

  async getBulk(ids: string[], collection: string): Promise<any> {
   return await this.db.getBulk(ids, collection);
  }

  /*
    operators: equals, 
               startsWith,
               above,
               below,
               notEqual

  */
  async queryByProperty(field:string, operator: 'equals'|'startsWith'|'notEqual', 
      value: any, collection: string): Promise<any> {
    return await this.db.queryByProperty(field, operator, value, collection);
  }


  async getAllByProject(projectid, collection): Promise<any> {
    return await this.db.getProjectItems(getProjectChildId(projectid) + DIV, collection);
  }

  async getAllByChannel(channel, collection): Promise<any> {
    return await this.db.getProjectItems(channel + DIV, collection);
  }


  async save(doc:any, collection: string, props:{projectid?: string, 
    oldDoc?: any,remoteSync?:boolean} = {}): Promise<any> {  
      console.log('SAVING DOC *******************', doc, props, collection);
      if(!props) props = {remoteSync: true};
      if(props.remoteSync === undefined) props.remoteSync = true;
    
      try {
        let oldDoc = {};
        if (doc.id && props.oldDoc == null) {
          oldDoc = await this.getDoc(doc.id, collection);
        }
    
        console.log('Checking if no changes made: ', oldDoc);
        if (_.isEqual(oldDoc, doc)) {
          console.log('No changes, skip saving');
          return false; 
        }
    
        if(!doc.id) {
          if(!props.projectid) throw new Error('Saving new doc requires valid props.project')
            // @ts-ignore:  we made this check at the begining
          doc.id = generateCollectionId(props.projectid, collection);
          doc.created = Date.now();
          // doc.updated = Date.now();
        }
        //doc.updated = Date.now();
        doc.dirty = true;
        //res = await this._pouch.put({ ...oldDoc, ...doc });
        if(!doc.rev)doc.rev = 1;
        doc.rev ++;
        const res = await this.db.save(doc, collection);

        console.log('******* Are we syncing it with SERVER:::: ', props, props.remoteSync);
        if (props.remoteSync)
          this.addSyncCall$.next();


        console.log('Saved doc: ', res);
        if (res.ok)
          return res;
        else
          return false;
        }
      catch (e) {
        console.log('DEXIE error: ', e);
        return false;
      }
  }

  

  


  async saveNewProject(project:ProjectItem, collection: string): Promise<any> {
    
    const res = await post(getPostRequest(env.AUTH_API_URL +'/channels/addNewChannel',
                      {token: authService.getToken(), 
                       doc: project,
                       name: project.name}, {} ),  false) ;
    console.log(res);
    if(!res.success)
      return res;

    const channel = res.data.channel;
    let gotNewRightsToken = false;
    let tokenres;
    while(!gotNewRightsToken){
      tokenres = await authService.renewToken();
      console.log('Token Res::::::: ', tokenres);
      console.log(authService.getUser(), channel);

      const user = authService.getUser();
      if(user.channels[channel]){
        gotNewRightsToken = true;
      }
      else {
        await waitMS(2000);
      }
    }
    return await this.db.save(res.data.doc, collection, false);
  }




  async saveSystemDoc(doc: any, project:ProjectItem, collection: string): Promise<any> {
    
    //set id
    const doc2 = {}
    if(!doc.type) 
      throw new Error('Saving system doc requires doc to have type property');
    if(doc.secondaryType)
      doc2['secondaryType'] = doc.secondaryType;

    const res = await post(getPostRequest(env.AUTH_API_URL +'/channels/addNewSystemDoc',
                      {...{ token: authService.getToken(), 
                        doctype: doc.type,
                        channelid: getChannelFromProjectId(project.id),
                        doc: doc }, ...doc2}, {} ), false) ;
    console.log(res);
    if(!res.success)
      return res;

    return await this.db.save(res.data.doc, collection, false);
  }




  public async remove(id: string, collection: string, remoteSync:boolean = true) {
    try {
      const doc = await this.getDoc(id, collection);
      if(!doc) return false;
      log.warn('Deleting doc: ',id);
      log.warn(doc);
      const res =  this.db.save({...doc, ...{deleted: true}}, collection);
      console.log(res);
      if (remoteSync)
        this.addSyncCall$.next();
      return res;
    }
    catch(e) {
      console.log(e);
      return null;
    }
  }

  public async removeProject() {

    /*
    try {
      //load all project children and remove them
      //TODO, on server side, if notice project deleted, make sure all server children are also deleted
      const res = await this._pouch.allDocs({
        include_docs: true,
        startkey: getProjectChildId(project._id),
        endkey: getProjectChildId(project._id) + LASTCHAR
      });
      const docs = res.rows.map(row => Object.assign(
        row.doc, { _deleted: true, updated: Date.now() }));

      docs.push(Object.assign(project, { _deleted: true, updated: Date.now() }));
      const res2 = await this._pouch.bulkDocs(docs);

      if (syncRemote)
        this.addSyncCall$.next();

      return res2;
    }
    catch (e) {
      console.log('Remove Project Error: ', e);
    }
    */ return false;
  }



  // streams

  subscribeChanges(debounce = 0): Observable<any> {
    return this.db.changes$.asObservable().pipe(
      debounceTime(debounce),
      map((change:DataChangeEvent) => change.doc )
    );
  }
  

  subscribeDocChanges(id: string, debounce: number = 0): Observable<any> {
    return this.db.changes$.asObservable().pipe(
      debounceTime(debounce),
      filter((change: DataChangeEvent) => change.doc.id === id),
      map((change: DataChangeEvent) => change.doc)
    );
  }


  subscribeByPropertyChange(
    property: string,
    value: any,
    debounce: number = 0): Observable<any> {
    return this.db.changes$.asObservable().pipe(
      debounceTime(debounce),
      
      filter((change: DataChangeEvent) => { 
        console.log('%%%%%%%%CHANGE LOG PROPERTY%%%%%%%%%%', change)
        // eslint-disable-next-line eqeqeq
        console.log('TESTING::: ',change.doc[property], value )
        return (change.doc[property] == value);
      }),
      map((change: DataChangeEvent) => change.doc)
    ); 
  }

  subscribeProjectTypeChanges(projectid: string|undefined,
    type: string,
    debounce: number = 0): Observable<any> {
    if(projectid === undefined) 
      throw new Error('Project id, can not be undefined, can not subscribe to id') ;
    const projectChildId = getProjectChildId(projectid);
    return this.db.changes$.asObservable().pipe(
      debounceTime(debounce),
      
      filter((change: DataChangeEvent) => { 
        console.log('%%%%%%%%CHANGE LOG%%%%%%%%%%',change, projectChildId + DIV  + type + DIV)
        return change.doc.id.startsWith(projectChildId + DIV + type + DIV);
      }),
      map((change: DataChangeEvent) => change.doc)
    ); 
  }

  //project id and channel only difference is the suffic at end of proejctid
  subscribeChannelTypeChanges(channel: string|undefined,
    type: string,
    debounce: number = 0): Observable<any> {
    if(channel === undefined) 
      throw new Error('Channel can not be undefined, can not subscribe to id') ;
    return this.db.changes$.asObservable().pipe(
      debounceTime(debounce),
      filter((change: DataChangeEvent) => { 
        return change.doc.id.startsWith(channel + DIV + type + DIV);
      }),
      map((change: DataChangeEvent) => change.doc)
    ); 
  }

  // internal
  public get ready() {
    return this._ready;
  }

  public getReadySub() {
    return this._ready$;
  }

  public set ready(value: boolean) {
    this._ready = value;
    if(value) // only send if true, this way we can have one time listeners
      this._ready$.next(value);
  }


  public async init(authid: string , syncRemote = true) {
    console.log('Init DB')
    const scheme = databaseScheme;
    scheme.name = authid;
    this.db = new DexieAdapter(scheme);
    const dbSub = this.db.ready$.subscribe(ready => {
      console.log('Dexie Sub: ', ready);
      if(!ready) return;

      this.ready = true;
      if (syncRemote)
        this.addSyncCall$.next();

      dbSub.unsubscribe();
      
    });
  }

  private async _syncRemote() {
    //get check point
    console.log('DATASERVICE:::&&&&&&&&&&&&&&&&&&&&&&&&&&&&::::::::::START');
    let ck = Number(await localStorageService.getItem('SYNC_CHECKPOINT'));
    if(!ck) ck = 0; 
    
    //get data
    //go thought all the tables and get dirty docs
    let docs: any[] = [];
    for(let i = 0; i < databaseScheme.tables.length; i++) {
      console.log('Loading changes from: ', databaseScheme.tables[i].name);
      if(!databaseScheme.tables[i].sync){
        console.log('Skipping table');
        continue;
      }
      const res = await this.db.queryByProperty('dirty', 'equals', 1, databaseScheme.tables[i].name);
      console.log(databaseScheme.tables[i].name, res);
      docs.push(...res);
    }
    console.log('DOCS TO SYNC **********************', docs);
    const res = await syncData({  data: docs, 
                                  syncurl: env.SYNC_SERVER,
                                  token: authService.getToken(),
                                  checkpoint: 0,
                                  requestMaxSize: 1000});
    //save checkpoint
    if(res) {
      console.log('Sync finished::: ', res);
      const keys = Object.keys(res);
      console.log(keys);
      for(let i = 0; i < keys.length; i++){
        await this.db.saveFromSync(
          res[keys[i]].map(doc => Object.assign(doc, {dirty: 0})), 
          keys[i]);
      }
    }

  }



}

export const dataService = new DataService();
