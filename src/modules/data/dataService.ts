import { Observable, Subject, BehaviorSubject } from 'rxjs';
import { map, debounceTime, filter, throttleTime } from 'rxjs/operators';
import { generateProjectUUID, getProjectChildId, genrateMetaData, generateCollectionId } from './utilsData';

import colors, {  } from 'colors';
import { ProjectItem, PROJECT_SERVICE, PROJECT_INDEX_SERVICE, DIV } from './models';
import { env } from '../../env';
import { waitMS } from '../../utils';
import { authService } from '../auth/authService';
import _ from 'lodash';
import DexieAdapter, { DatabaseScheme } from './adapters/dexie';


const databaseScheme: DatabaseScheme =  {
  name: 'guest_dx',
  version: 2,
  tables: [
    {
      name: 'party',
      columns: 'id'
    },
    {
      name: 'todo',
      columns: 'id, done, deleted, parent,  *tags'
    },
    {
      name: 'habit',
      columns: 'id'
    },
    {
      name: 'msg',
      columns: 'id, type, parent'
    },
   
  ]
}



class DataService {
  private db;
  private authId:string = '';
  private _ready = false;
  public _ready$ = new BehaviorSubject(this._ready);
  public addSyncCall$ = new Subject(); // do we need to sync with server
  private _changes = new Subject();



  constructor() {
    //subscriptions
    this.addSyncCall$.pipe(
      throttleTime(5000),
    ).subscribe(() => {
        this._syncRemote();
      })

    
  }


  // access
  async getDoc(id: string,  opts = {}): Promise<any> {
    try {
      const doc = await this._pouch.get(id);
      return doc;
    }
    catch (e) {
      console.log(e.red);
      return null;
    }
  }

  async getDocList(ids: string[]): Promise<any> {
    try {
      const options = {
        docs: ids.map(value => {return {id: value}}),
      }
      console.log('GetDocList:: ', options)
      const result = await this._pouch.bulkGet(options);
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

  async queryByProperty(field:string, operator:string, value: any): Promise<any> {
    const res = await nSQL(this.docTabel).query('select').where([field, operator, value]).exec();
    console.log(res);
    return res;
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


  async save(doc:any, props:{project?: ProjectItem, 
    oldDoc?: any,
    collection?: string, remoteSync?:boolean} = {}): Promise<any> {  
    if(props === undefined)props = {};
    if( props.remoteSync === undefined) props.remoteSync = true;

    // if its a design doc, or query, skip it
    if (doc._id != null && doc._id.startsWith('_')) {
      return false;
    }

    let oldDoc = {};
    if (doc._id && props.oldDoc == null) {
      oldDoc = await this._pouch.get(doc._id);
    }

    console.log('Checking if no changes made: ', oldDoc);
    if (_.isEqual(oldDoc, doc)) {
      console.log('No changes, skip saving');
      return false; // we have no need to save, maybe here we need something else, like a message
    }

    let res;
    try {
      if(!doc._id) {
        if(!props.project)props.project = this.getDefaultProject();
        if(!props.collection) throw new Error('Saving new Doc requires collection');
        // @ts-ignore:  we made this check at the begining
        doc._id = generateCollectionId(props.project.id, props.collection);
        doc.created = Date.now();
        doc.updated = Date.now();
      }
      doc.updated++;
      res = await this._pouch.put({ ...oldDoc, ...doc });
      if (props.remoteSync)
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

  

  getDefaultProject(): ProjectItem {
    const uuid = 'u.' + authService.userid;
    return {
      _id: generateProjectUUID(uuid),
      name: 'default',
      access:[],
      type: 'pi',
      updated: 0, //Date.now(),
      [env.ACCESS_META_KEY]: genrateMetaData(authService.userid), 
    }
  }


  async saveNewProject(project:ProjectItem, channel: string): Promise<any> {
    //make new channels, we need internet let server make it

    return false;
    /*doc._id = generateProjectUUID(undefined, authService.userid);

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

    */
  }



  public async remove(id: string, remoteSync:boolean = true) {
    try {
      const doc = this.getDoc(id);
      if(!doc) return false;
      const res =   await nSQL(this.docTabel).query('delete')
        .where(['id','==', id]).exec();
      console.log(res);
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
      filter((doc: any) => doc.id === id)
    );
  }

  subscribeProjectsChanges(debounce: number = 0): Observable<any> {
    return this._changes.asObservable().pipe(
      debounceTime(debounce),
      filter((doc: any) => doc.id.startsWith(PROJECT_SERVICE + '|' + PROJECT_INDEX_SERVICE + '|'))
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
      filter((doc: any) => doc.id.startsWith(projectChildId + DIV + type + DIV))
    );
  }



  // internal
  public get ready() {
    return this._ready;
  }
  public set ready(value: boolean) {
    this._ready = value;
    if(value) // only send if true, this way we can have one time listeners
      this._ready$.next(value);
  }

  private checkDbIsSynced():boolean {
    return this._dbName === nSQL().selectedDB;
  }


  public async init(authid: string , syncRemote = true) {
    console.log('Init DB')
    const scheme = databaseScheme;
    scheme.name = authid;
    this.db = new DexieAdapter(scheme);
    const dbSub = this.db.ready$.subscribe(ready => {
      if(!ready) return;

      this.ready = true;
      if (syncRemote)
        this.addSyncCall$.next();

      dbSub.unsubscribe();
      
    });
  }


  public getReady() {
    return this._ready$;
  }


}

export const dataService = new DataService();
