import { PROJECT_SERVICE, DIV, PROJECT_INDEX_SERVICE, LASTCHAR, ProjectItem } from './models';
import shortid from 'shortid';
import { env } from '../../env';

export const TYPE_SETTINGS = 'set';

export function getDefaultProject(userid): ProjectItem {
  const uuid = 'u' + env.APP_ID + userid;
  return {
    id: generateProjectUUID(uuid, ''),
    name: 'default',
    access:[],
    type: TYPE_SETTINGS,
    updated: 0, //Date.now(),
    [env.ACCESS_META_KEY]: genrateMetaData(userid), 
  }
}

export function generateUUID():string {
  let id;
  let ok = false;
  while (!ok) {
    id = shortid.generate();
    if(id.substring(0,1)!== '_' && id.substring(0,1)!== '-')
      ok = true;
  }

  return id;
}

export function getProjectChildId(id:string|undefined): string {
  if(id === undefined) throw new Error('Id can not be undefined');
  let length = PROJECT_INDEX_SERVICE.length + DIV.length;
  return id.substring(0, id.length-length);
}

export function getChannelFromProjectId(id: string|undefined):string {
  return getProjectChildId(id);
}

export function generateProjectUUID(id = generateUUID(), app = env.APP_ID):string {
  return app + id +  DIV + PROJECT_INDEX_SERVICE;
}

export function generateProjectChildId(projectId: string, type: string, id = generateUUID()):string {
  return PROJECT_SERVICE+ DIV + projectId.split(DIV)[1] + DIV + type +
          DIV + id;
}

export function generateCollectionId(projectid: string|undefined, collection, id = generateUUID()): string {
  if(projectid === undefined) throw new Error("Project can't be underfined");
  const length = PROJECT_INDEX_SERVICE.length;
  return projectid.substring(0, projectid.length-length)+collection+ DIV +id; 
}

export const waitMS = (ms) => {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
};


export function saveIntoArray(item: Object, ary: Array<any> = [], idKey: string = 'id'): Array<any> {
  let i = getIndexById(item[idKey], ary, idKey);
  if (i === -1) {
    i = ary.length;
  }
  return [...ary.slice(0, i),
  Object.assign({}, item),
  ...ary.slice(i + 1)];
}

export function genrateMetaData(userid:string):string[]{
    return [ 'u'+ env.APP_ID + userid,]; 
}



export function getIndexById(id: string, ary: any, idKey: string = 'id'): number {
  for (let i = 0; i < ary.length; i++) {
    if (id === ary[i][idKey]) {
      return i;
    }
  }
  // if we don't have a match return null
  return -1;
}

export const extractTypeCollectionFromDocId = (id) => {
  return id.split(DIV)[2];
}