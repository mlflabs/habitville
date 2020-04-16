import { Observable, Subject, BehaviorSubject } from 'rxjs';
import { map, filter, throttleTime } from 'rxjs/operators';
import { getProjectChildId, generateCollectionId, 
  TYPE_SETTINGS, waitMS, getChannelFromProjectId, getDefaultProject } from './utilsData';

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
import { RefresherEventDetail } from '@ionic/core';

const log = ulog('dataService');

export interface DataChangeEvent {
  doc: any,
  old?: any,
}

const databaseScheme: DatabaseScheme =  {
  name: 'guest_dx',
  version: 21,
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
      columns: 'id, *tags, list ,dirty',
      sync: true
    },
    {
      name: TYPE_TODO_LIST,
      columns: 'id, dirty, folder, secondaryType, fullname',
      sync: true
    },
    {
      name: TYPE_TODO_TAG,
      columns: 'id, name, dirty',
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
        log.info('Syncing.......')
        this._syncRemote();
      })
  }

  async getDoc(id: string|undefined,  collection: string): Promise<any> {
    if(id === undefined){
      throw new Error('Doc Id cannot be undefined, check logic.');
    }
    return await this.db.getDoc(id, collection);
  }

  async getBulk(ids: string[], collection: string): Promise<any> {
   return await this.db.getBulk(ids, collection);
  }

  //operators: equals, startsWith, above, below, notEqual
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

  //save without making it diryt
  async saveFromServer(doc:any, type:string) {
    await this.db.save(doc, type, false);
  }

  async save(doc:any, collection: string, props:{projectid?: string, 
    oldDoc?: any,remoteSync?:boolean} = {}): Promise<any> {  
      log.info('SAVING DOC', doc, props, collection);
      if(!props) props = {remoteSync: true};
      if(props.remoteSync === undefined) props.remoteSync = true;
    
      try {
        let oldDoc = {};
        if (doc.id && props.oldDoc == null) {
          oldDoc = await this.getDoc(doc.id, collection);
        }
        if (_.isEqual(oldDoc, doc)) {
          return false; 
        }
    
        if(!doc.id) {
          console.log(doc, props);
          if(!props.projectid) throw new Error('Saving new doc requires valid props.project')
            // @ts-ignore:  we made this check at the begining
          doc.id = generateCollectionId(props.projectid, collection);
          doc.created = Date.now();
        }
        doc.dirty = true;
        if(!doc.rev)doc.rev = 1;
        doc.rev ++;
        const res = await this.db.save(doc, collection);
        if (props.remoteSync)
          this.addSyncCall$.next();
        if (res.ok)
          return res;
        else
          return false;
        }
      catch (e) {
        log.error('DEXIE error: ', e);
        return false;
      }
  }

  

  


  async saveNewProject(project:ProjectItem, collection: string): Promise<any> {
    const res = await post(getPostRequest(env.AUTH_API_URL +'/channels/addNewChannel',
                      {token: authService.getToken(), 
                       doc: project,
                       name: project.name}, {} ),  false) ;
    log.info('Making new project, ajax result: ', res);
    if(!res.success)
      return res;

    const channel = res.data.channel;
    let gotNewRightsToken = false;
    while(!gotNewRightsToken){
      const user = authService.getUser();
      if(user[env.ACCESS_META_KEY][channel]){
        gotNewRightsToken = true;
      }
      else {
        await waitMS(2000);
      }
    }
    return await this.db.save(res.data.doc, collection, false);
  }

  async saveSystemDoc(doc: any, project:ProjectItem, collection: string): Promise<any> {
    if(doc.id){
      log.warn('Editing SystemDoc, ', doc);
      const res = await post(getPostRequest(env.AUTH_API_URL +'/channels/editSystemDoc',
                            { token: authService.getToken(), doc}, {} ), false) ;
      if(!res.success)
        return res;
  
      return await this.db.save(res.data.doc, collection, false);
    }
    else {
      log.warn('Saving new SystemDoc, ', doc);
      const doc2 = {}
      if(!doc.type) 
        throw new Error('Saving system doc requires doc to have type property');
      if(doc.secondaryType)
        doc2['secondaryType'] = doc.secondaryType;
  
      const res = await post(getPostRequest(env.AUTH_API_URL +'/channels/addNewSystemDoc',
                        {...{ token: authService.getToken(), 
                          doctype: doc.type,
                          channelname: getChannelFromProjectId(project.id),
                          doc: doc }, ...doc2}, {} ), false) ;
      if(!res.success)
        return res;
  
      return await this.db.save(res.data.doc, collection, false);
    }
    

  }




  public async remove(id: string, collection: string, remoteSync:boolean = true) {
    try {
      const doc = await this.getDoc(id, collection);
      if(!doc) return false;
      log.warn('Deleting doc: ',id);
      log.warn(doc);
      const res =  this.db.save({...doc, ...{deleted: true}}, collection);
      log.info(res);
      if (remoteSync)
        this.addSyncCall$.next();
      return res;
    }
    catch(e) {
      log.error(e);
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

  subscribeChanges(): Observable<any> {
    return this.db.changes$.asObservable().pipe(
      map((change:DataChangeEvent) => change.doc )
    );
  }
  

  subscribeDocChanges(id: string): Observable<any> {
    return this.db.changes$.asObservable().pipe(
      filter((change: DataChangeEvent) => change.doc.id === id),
      map((change: DataChangeEvent) => change.doc)
    );
  }


  subscribeByPropertyChange(
    property: string,
    value: any): Observable<any> {
    return this.db.changes$.asObservable().pipe(
      filter((change: DataChangeEvent) => { 
        return (change.doc[property] === value);
      }),
      map((change: DataChangeEvent) => change.doc)
    ); 
  }

  subscribeProjectTypeChanges(projectid: string|undefined, type: string): Observable<any> {
    if(projectid === undefined) 
      throw new Error('Project id, can not be undefined, can not subscribe to id') ;
    const projectChildId = getProjectChildId(projectid);
    return this.db.changes$.asObservable().pipe(
      filter((change: DataChangeEvent) => { 
        return change.doc.id.startsWith(projectChildId + DIV + type + DIV);
      }),
      map((change: DataChangeEvent) => change.doc)
    ); 
  }

  //project id and channel only difference is the suffic at end of proejctid
  subscribeChannelTypeChanges(channel: string|undefined, type: string): Observable<any> {
    if(channel === undefined) 
      throw new Error('Channel can not be undefined, can not subscribe to id') ;
    return this.db.changes$.asObservable().pipe(
      filter((change: DataChangeEvent) => { 
        return change.doc.id.startsWith(channel + DIV + type + DIV);
      }),
      map((change: DataChangeEvent) => change.doc)
    ); 
  }


  public get ready() {
    return this._ready;
  }

  public getReadySub() {
    return this._ready$;
  }

  public set ready(value: boolean) {
    this._ready = value;
    if(value)
      this._ready$.next(value);
  }

  public async refresh(event: CustomEvent<RefresherEventDetail>) {
    await this._syncRemote();
    event.detail.complete();
  }

  public async init(authid: string , syncRemote = true) {
    log.info('Init DB', authid)
    const scheme = databaseScheme;
    scheme.name = authid;
    this.db = new DexieAdapter(scheme);
    const dbSub = this.db.ready$.subscribe(ready => {
      log.info('Dexie Sub: ', ready);
      if(!ready) return;

      this.ready = true;
      if (syncRemote)
        this.addSyncCall$.next();

      this._createSettingsDoc(authid)
      dbSub.unsubscribe();
      
    });
  }

  public getSettingsDocId(): string {
    const defaultProject = getDefaultProject(authService.userid);
    const id =  generateCollectionId(defaultProject.id, 'settings', '');
    return id.substring(0, id.length-1);
  }

  public async getSettingsDoc(): Promise<any> {
    const id = this.getSettingsDocId();
    if(id === '')return;

    return await this.getDoc(id, TYPE_SETTINGS);
  }


  private async _createSettingsDoc(userid:string) {
    log.info('CreateSettingsDoc', userid);
    try {
      const id =  this.getSettingsDocId();
      const s = await dataService.getDoc(id, TYPE_SETTINGS);
      console.log(s);
      if(s) return s;
      const ts = Date.now();   
      log.info('Compare ids ', userid + ' ' + authService.userid);
      if(userid === authService.userid){  //half second pased, see if state changed
        log.info('Saving new Settings Doc::: ', id)
        const res = await dataService.save({
          id,
          type: TYPE_SETTINGS,
          userid: userid,
          created: ts,
          updated: ts
        }, TYPE_SETTINGS)
      return res;
      }
    }
    catch(e) {
      log.error(e.red, userid);
    }    
  }

  private async _syncRemote() {
    console.log('Sync Remote:::')
    let ck = Number(await localStorageService.getItem('SYNC_CHECKPOINT'));
    if(!ck) ck = 0; 
    
    let docs: any[] = [];
    for(let i = 0; i < databaseScheme.tables.length; i++) {
      if(!databaseScheme.tables[i].sync){
        continue;
      }
      const res = await this.db.queryByProperty('dirty', 'equals', 1, databaseScheme.tables[i].name);
      docs.push(...res);
    }
    const res = await syncData({  data: docs, 
                                  syncurl: env.SYNC_SERVER,
                                  token: authService.getToken(),
                                  checkpoint: 0,
                                  requestMaxSize: 1000});
    //save checkpoint
    if(res) {
      const keys = Object.keys(res);
      for(let i = 0; i < keys.length; i++){
        await this.db.saveFromSync(
          res[keys[i]].map(doc => Object.assign(doc, {dirty: 0})), 
          keys[i]);
      }
    }
    console.log('Finished sync');
  }



}

export const dataService = new DataService();
