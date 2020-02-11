import PouchDB from 'pouchdb';
import PouchDBFind from 'pouchdb-find';
import { nSQL } from "@nano-sql/core";
import { Observable, Subject, BehaviorSubject } from 'rxjs';
import { map, debounceTime, filter, throttleTime } from 'rxjs/operators';
import { generateProjectUUID, getProjectChildId, genrateMetaData, generateCollectionId } from './utilsData';

import colors, {  } from 'colors';
import { ProjectItem, PROJECT_SERVICE, PROJECT_INDEX_SERVICE, DIV } from './models';
import { env } from '../../env';
import { waitMS } from '../../utils';
import { authService } from '../auth/authService';


class DataService {
  private _pouch: any;
  private _pouch_syc: any;
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
  async getDoc(id: string): Promise<any> {
    try{
      if(!this.checkDbIsSynced())return null;
      console.log(id, this.checkDbIsSynced(), this.docTabel);
      const res =   await nSQL(this.docTabel).query('select').where(['id', '===', id]).exec();
      if(res[0])return res[0]
      return null;
    }
    catch(e) {
      console.log(e);
      return null;
    }
    
  }


  async getDocList(ids: string[]): Promise<any> {
    try {
      let docs:any[] = [];
      for(let i = 0; i < ids.length; i++) {
        const res = await nSQL(this.docTabel).query('select').where(['id', '===', ids[i]]).exec();
        docs.push(res);
      }
      return docs;
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

  async findDocsByProperty(value: any, prop: string): Promise<any> {
    console.log(value, prop);
  }

  async getAllDocs() {
    const res =   await nSQL(this.docTabel).query('select').exec();
    console.log(res);
    return res;
  }



  async getAllByProjectAndType(projectid, type):Promise<any> {

    console.log(projectid, type)
    const like = getProjectChildId(projectid)+DIV+type+DIV+'%'
    console.log(like);
    const res = await nSQL(this.docTabel).query('select').where(['id', 'LIKE', like]).exec();
    console.log(res);
    return res;
  }


  // modify

  async save(doc:any, props:{project?: ProjectItem, 
    collection?: string, remoteSync?:boolean} = {}): Promise<any> {
    // if its a design doc, or query, skip it
    try {
      if(props === undefined)props = {};
      if( props.remoteSync === undefined) props.remoteSync = true;
      
      if(!doc.id) {
        if(!props.project)props.project = this.getDefaultProject();
        if(!props.collection) throw new Error('Saving new Doc requires collection');
        // @ts-ignore:  we made this check at the begining
        doc.id = generateCollectionId(props.project.id, props.collection);
        doc.created = Date.now();
        doc.updated = Date.now();
      }
      if(!doc.updated) throw new Error('Doc should have updated field');
      doc.updated++;
      

      const res = await nSQL(this.docTabel).query('upsert', doc).exec();
      console.log(res);

      if (props.remoteSync)
        this.addSyncCall$.next();

      if(res[0])return res[0]
      return null;
  
    }
    catch(e) {
      console.log(e);
      return null;
    }
  }

  getDefaultProject(): ProjectItem {
    const uuid = 'u.' + authService.userid;
    return {
      id: generateProjectUUID(uuid),
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

    return false;
    try {
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

    if(authid === this.authId) return;
    this.authId = authid;
    //TODO: check if we need to destory the previous pouch
    try {
      //await waitMS(500);
      this._initDb('db_' + authid, authid, syncRemote)
    }
    catch(e) {
      console.log(colors.red(e));
      return false;
    }
  }

  private async post_init(authid:string, syncRemote = true) {
    if (syncRemote)
      this.addSyncCall$.next();

  
    if(authid !== this.authId)return;

    this.ready = true;
    return true;
  }

  public getReady() {
    return this._ready$;
  }


// still need listen to changes, and add some indexs for different types
 
  private async _initDb(dbName: string, authid:string, syncRemote) {
    console.log(colors.blue('Init _DB: '), dbName);
    if(this._dbName === dbName) return;

    try {
      this._dbName = dbName;
      nSQL().useDatabase(dbName).on('ready', () => {
        console.log('Database Ready: ', dbName);
        nSQL().useDatabase(dbName);
        nSQL(this.docTabel).on("change", (e) => {
          console.log(colors.blue("Change"), e)
          if(e.oldRow) console.log(e.oldRow);
          this._changes.next(e.result);
        });

        //continue to next function after database is ready
        this.post_init(authid, syncRemote);

        nSQL().useDatabase(dbName).off('ready',()=>{console.log('Unsubscribed from off')});
      });
      await nSQL().createDatabase({
        id: dbName,
        mode: "PERM", 
        tables: [ // tables can be created as part of createDatabase or created later with create table queries
            {
                name: this.docTabel,
                model: {
                    "id:string": {pk: true},
                    "type:string": {},
                    "access:string": {},
                    "todoTags:string[]": {}, //todos table only
                    "*:any": {}
                },
                indexes: {
                  'type:string': {},
                  'date:int': {},
                  'todoTags:string[]': {}
                }
            }
        ],
        version: 1,
      })
    }
    catch(e) {
      console.log(e);
    }
    
  }

  private async _syncRemote() {

  }

}

export const dataService = new DataService();
