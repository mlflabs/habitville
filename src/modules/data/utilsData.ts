import { PROJECT_SERVICE, DIV, PROJECT_INDEX_SERVICE, LASTCHAR, ProjectItem, Doc } from './models';
import shortid from 'shortid';
import { env } from '../../env';

export const TYPE_SETTINGS = 'set';

export function generateUserChannelId(userid): string {
  return 'u' + env.APP_ID + userid;
}

export function getDefaultProject(userid): ProjectItem {
  const uuid = 'u' + env.APP_ID + userid;
  return {
    id: generateProjectUUID(uuid, ''),
    rev: 1,
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

export function isThisUserProject(id:string|undefined, userid): boolean {
  return (getChannelFromProjectId(id) === generateUserChannelId(userid));
}

export function getChannelNameFromId(id:string|undefined) {
  if(id === undefined) throw new Error('Id cannot be undefined');
  return id.split(DIV)[0];
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

export function generateCollectionId(projectid: string, collection, id = generateUUID()): string {
  //eliminate dots from id, not allowed
  id = id.replace('.','');
  
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

export const extractChannelNameFromDocId = (id) => {
  return id.split(DIV)[0];
}


//rights functions
/*
    Rights, each digit represents different right
    0.  0 - Not admin 1- Admin, can change everything
    1.  (Project item) 0 - can't see, 1 - can see, 2 - can edit
    2.  (Project children) 0 - can't see, 1 - can see own, 2 - can see all items
    3.  (Project children edit) 0 -can't edit, 1 can edit/make own, 2 can edit all 
*/

export const getDocumentRights = (id: string|undefined, user):string|undefined => {
  console.log(id, user);
  const channel = getChannelNameFromId(id);
  return user[env.ACCESS_META_KEY][channel];
}

export const canEditProject = (id, user): boolean => {
  const rights = getDocumentRights(id, user);
  if(!rights) return false;
  return canEditProjectByRights(rights);
} 

export const canEditProjectByRights = (rights: string): boolean => {
  if(rights.substring(0,1) === '1') return true;
  if(rights.substring(1,2) === '2') return true;
  return false;
}


export const canEditDoc= (doc:Doc, user): boolean => {
  const rights = getDocumentRights(doc.id, user);
  if(!rights) return false;
  return canEditItemByRights(rights, doc.creator === user.id);
} 

export const canEditOwnedItemByRights = (rights: string): boolean => {
  if(rights.substring(0,1) === '1') return true;
  if(rights.substring(3,4) === '1') return true;
  if(rights.substring(3,4) === '2') return true;
  return false;
}

export const canEditOthersItemByRights = (rights: string): boolean => {
  if(rights.substring(0,1) === '1') return true;
  if(rights.substring(3,4) === '2') return true;
  return false;
}

export const canEditItemByRights = (rights: string, myItem:boolean): boolean => {
  return (myItem)? canEditOwnedItemByRights(rights) : canEditOthersItemByRights(rights);
}