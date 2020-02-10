import PouchDB from 'pouchdb';
import PouchDBFind from 'pouchdb-find';
import { Observable, Subject, BehaviorSubject } from 'rxjs';
import { map, debounceTime, filter, throttleTime } from 'rxjs/operators';
import { generateProjectUUID, generateProjectChildId, getProjectChildId, genrateMetaData, } from './utilsData';
import { isEqual } from 'lodash';

import colors, { underline } from 'colors';
import ulog from 'ulog'
import { ProjectItem, PROJECT_SERVICE, DIV, PROJECT_INDEX_SERVICE, LASTCHAR } from './models';
import { env } from '../../env';
import { waitMS } from '../../utils';
import { authService } from '../auth/authService';
const log = ulog('service:data')



PouchDB.plugin(PouchDBFind);

class DataService {
  private _pouch: any;
  private _pouch_syc: any;
  private authId:string = '';

  public get pouch(): any {
    return this._pouch;
  }
  private _ready = false;
  public pouchReady$ = new BehaviorSubject(this.ready);

  public addSyncCall$ = new Subject(); // do we need to sync with server
  private _changes = new Subject();


  private _localPouchOptions = {
    revs_limit: 5,
    auto_compaction: true
  };


  constructor() {
    

    //subscriptions
    this.addSyncCall$.pipe(
      throttleTime(5000),
    ).subscribe(() => {
        this._syncRemote();
      })
  }

  // access

  async getDoc(id: string, attachments = false, opts = {}): Promise<any> {
    try {
      const doc = await this._pouch.get(id, { ...{ attachments: attachments }, ...opts });
      return doc;
    }
    catch (e) {
      console.log(e.red);
;      return null;
    }
  }

  async getDocList(ids: string[], attachments = false, opts = {}): Promise<any> {
    try {
      const options = {
        docs: ids.map(value => {return {id: value}}),
        attachments
      }
      console.log('GetDocList:: ', options)
      const result = await this._pouch.bulkGet({ ...options, ...opts });
      return result.results.map((res: any) => {
          if(res.docs.length ===  0) return false;
          if(res.docs[0].error) {
            console.log(res.docs[0].error);
            return false
          }
          if(res.docs[0].ok){
            return res.docs[0].ok;
          }
          return false;
        }).filter((doc:any) => doc);
    }
    catch (e) {
      console.log('Get Doc Error: ', ids, e);
      return null;
    }
  }


  async getImage(id, name) {
    const img = this._pouch.getAttachment(id, name);
    return img;
  }

  async findDocsByProperty(value, prop: string): Promise<any> {
    try {

      const query = { [prop]: { $eq: value } };
      console.log('Query: ', query);


      const docs = await this._pouch.find({
        selector: {
          [prop]: { $eq: value }
        }
      });

      return docs.docs;
    }
    catch (e) {
      console.log('Error finding docs by property: ', e, value, prop);
      return [];
    }
  }


  async getAllDocs() {
    const res = await this._pouch.allDocs({ include_docs: true });
    const docs = res.rows.map(row => row.doc);
    return docs;
  }

  async getAllByProjectAndType(projectid, type, attachments = false) {
    const projectChildId = getProjectChildId(projectid);
    const res = await this._pouch.allDocs({
      include_docs: true,
      attachments: attachments,
      startkey: projectChildId + DIV + type + DIV,
      endkey: projectChildId + DIV + type + DIV + 'z'
    });
    const docs = res.rows.map(row => row.doc);
    return docs;
  }


  // modify

  async save(doc, collection: string = '', old = null, attachment: any = null, syncRemote = true): Promise<any> {
    // if its a design doc, or query, skip it
    if (doc._id != null && doc._id.startsWith('_')) {
      return false;
    }
    let oldDoc = {};

    if (doc._id && old == null) {
      oldDoc = await this._pouch.get(doc._id);
    }

    console.log('Checking if no changes made: ', oldDoc);
    if (isEqual(oldDoc, doc)) {
      console.log('No changes, skip saving');
      return false; // we have no need to save, maybe here we need something else, like a message
    }

    let res;
    try {
      doc.updated = Date.now();

      if (doc._id == null) {
        throw new Error("Save function can't be used to save new doc, use saveinproject")
      }

      res = await this._pouch.put({ ...oldDoc, ...doc });

      //see if we have an attachment
      if (attachment) {
        //TODO:: use attachment.size to restrict big files
        res = await this._pouch.putAttachment(doc._id, 'file', res.rev, attachment, attachment.type);
      }

      if (syncRemote)
        this.addSyncCall$.next();

      console.log('Saved doc: ', res);
      if (res.ok)
        return res;
      else
        return false;
    }
    catch (e) {
      console.log('Save Pouch Error: ', e);
      return false;
    }
  }

  getDefaultProject() {
    const uuid = 'u-' + authService.userid;
    return {
      _id: generateProjectUUID(uuid),
      [env.ACCESS_META_KEY]: genrateMetaData(authService.userid), 
    }
  }

  async saveNewProject(doc, channel: string|null = null, syncRemote = true): Promise<any> {
    doc._id = generateProjectUUID(undefined, authService.userid);

    if(!channel)
      doc[env.ACCESS_META_KEY] = genrateMetaData(authService.userid); 
    else
      doc[env.ACCESS_META_KEY] = [channel];

    try {
      const res = await this._pouch.put(doc);

      if(syncRemote) this.addSyncCall$.next();

      return res;
  }
    catch(e){
      console.log('Error saving new project: '.red, e);
      return false;
    }

  }


  public async saveInProject(doc,
    project: ProjectItem = new ProjectItem(),
    collection: string = '',
    oldDoc = null,
    attachment: any = null,
    syncRemote = true,
    forceSave = false): Promise<any> {
    console.log('Save in project::: ', doc, project, syncRemote);
    // if its a design doc, or query, skip it
    if (doc._id != null && doc._id.startsWith('_')) {
      return false;
    }

    log.trace('Saving Doc: ', doc, project, collection, oldDoc);

    // see if we need to compare changes and only save if there are any
    // lets see if there are actual changes
    // Here we can also load an old doc, see if it exists
    if (!oldDoc && doc._id) {
      try {
        //see if we have old doc.
        oldDoc = await this._pouch.get(doc._id);
      }
      catch (e) {

      }
    }

    if (oldDoc != null) {
      if (isEqual(oldDoc, doc)) {
        return false; // we have no need to save, maybe here we need something else, like a message
      }

      if(forceSave){
        if(oldDoc != null)
        {
          // @ts-ignore: null check
          doc._rev = oldDoc._rev;

        }
          
      }
    }

    //make sure access is same as project
    doc[env.ACCESS_META_KEY] = project[env.ACCESS_META_KEY];

    let res;
    try {
      doc.updated = Date.now();

      if (doc._id == null) {
        if(!project._id) throw new Error('Project needs id, cannot save project children');
        doc._id = generateProjectChildId(project._id, collection);
      }

      res = await this._pouch.put(doc);

      //see if we have an attachment
      if (attachment) {
        //TODO:: use attachment.size to restrict big files
        res = await this._pouch.putAttachment(doc._id, 'file', res.rev, attachment, attachment.type);
      }

      if (syncRemote)
        this.addSyncCall$.next();

      log.trace('Saved doc: ', res.green);

      if (res.ok)
        return res;
      else
        return false;
    }
    catch (e) {
      log.error('Save Pouch Error: '.red, e);
      return false;
    }
  }


  public async remove(id, syncRemote = true) {
    try {
      if (typeof id !== 'string') {
        if (id) {
          if (id._id)
            id = id._id;
        }
      }
      const doc = await this._pouch.get(id);
      doc._deleted = true;
      doc.updated = Date.now();
      const res = await this._pouch.put(doc);

      if (syncRemote)
        this.addSyncCall$.next();

      if (res.ok)
        return res;
      else
        return false;
    }
    catch (e) {
      console.log('Remove Pouch Error:: '.red, e);
      return false;
    }
  }

  public async removeProject(project: ProjectItem, syncRemote = true) {
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
  }



  // streams
  subscribeChanges(): Observable<any> {
    return this._changes.asObservable().pipe(
      // debounceTime(1000),
      map(doc => {
        return doc;
      })
    );
  }

  subscribeDocChanges(id: string, debounce: number = 0): Observable<any> {
    return this._changes.asObservable().pipe(
      debounceTime(debounce),
      filter((doc: any) => doc._id === id)
    );
  }

  subscribeProjectsChanges(debounce: number = 0): Observable<any> {
    return this._changes.asObservable().pipe(
      debounceTime(debounce),
      filter((doc: any) => doc._id.startsWith(PROJECT_SERVICE + '|' + PROJECT_INDEX_SERVICE + '|'))
    );
  }

  subscribeProjectCollectionChanges(projectid: string|undefined,
    type: string,
    debounce: number = 0): Observable<any> {
    if(projectid === undefined) 
      throw new Error('Project id, can not be undefined, can not subscribe to id') ;
    const projectChildId = getProjectChildId(projectid);
    return this._changes.asObservable().pipe(
      debounceTime(debounce),
      filter((doc: any) => doc._id.startsWith(projectChildId + '|' + type + '|'))
    );
  }



  // internal
  public get ready() {
    return this._ready;
  }
  public set ready(value: boolean) {
    this._ready = value;
    this.pouchReady$.next(value);
  }



  public async init(authid: string , syncRemote = false, mergeOldData = false) {
    console.log('InitPouch')
    //see if we already are loading this
    if(authid === this.authId) return;
    this.authId = authid;
    //TODO: check if we need to destory the previous pouch
    try {
      await this.initPouch(env.APP_ID + authid, syncRemote, mergeOldData);
      if (syncRemote)
        this.addSyncCall$.next();
      
      return true;
    }
    catch(e) {
      console.log(e);
      return false;
    }
  }

  public async clearPouchData() {
    //TODO: clear old data
  }

  public addIndex (fields:string[], indexName:string = '') {
    if(indexName === ''){
      this._pouch.createIndex({
        index: {fields: fields}
      }); 
    }
    else {
      this._pouch.createIndex({
        index: {
            fields: fields,
            ddoc: indexName}
      }); 
    }
        
  }


 

  private async initPouch(pouchName: string, syncRemote: boolean = false, mergeOldData: boolean = false) {
    this.ready = false;
    log.info('initDB name: ', pouchName);

    let oldDocs;
    if (mergeOldData && this._pouch) {
      oldDocs = await this.getAllDocs();
    }

    this._pouch = await new PouchDB(pouchName, this._localPouchOptions);

    // this index can be used by everyone
    this.addIndex(['type'], 'typeIndex');

    this._pouch.info().then(async info => {
      console.log('@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@ Pouch info: ', info);
    
      // create our event subject
      this._pouch.changes({ live: true, since: 'now', include_docs: true })
      .on('change', change => {
        log.info('Pouch on change ', change);
        this._changes.next(change.doc);
      });

      if (mergeOldData && oldDocs) {
        oldDocs.forEach(d => {
          this.save(d);
        });
      }
      
      await waitMS(1000);
      this.ready = true;

      if (syncRemote) {
        this.addSyncCall$.next();
      }
      return true;
    });

    window['PouchDB'] = this._pouch;

    

  }



  private async _syncRemote() {
    console.log('REMOTE SYNC: ', env.COUCH_SERVER);

    if(this._pouch_syc)
      this._pouch_syc.cancel();
    
    const token = authService.getToken() || '';
    console.log(token);
    const all = await this.getAllDocs();
    console.log('ALL DOCS::: ', all);
    console.log("Getting ready....... ", this._pouch, token);
    const remoteDB = new PouchDB(env.COUCH_SERVER,
      { headers: { 'x-access-token': token } });

    const opts = {
      live: false,
      retry: false
    };

    try{
      this._pouch_syc = this._pouch.sync(remoteDB, opts)
      .on('change', function (change) {
        console.log('========= Remote Sync: ', change);
      }).on('error', function (err) {
        console.log('========= Remote Error: ', err);
        // yo, we got an error! (maybe the user went offline?)
      }).on('======== Complete', function () {
        console.log('Remote Sync Completed ');
      }).on('========= Paused', function (info) {
        console.log('Remote Sync PAUSED: ');
        // replication was paused, usually because of a lost connection
      }).on('active', function () {
        console.log('========== Remote Sync ACTIVE: ');
      });
    }
    catch(e) {
      console.log(e)
    }
    
  }


}

export const dataService = new DataService();
