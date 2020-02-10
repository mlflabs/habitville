import { PROJECT_SERVICE, DIV, PROJECT_INDEX_SERVICE, LASTCHAR } from './models';

import shortid from 'shortid';


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
  if(id === undefined)return '';
  let length = PROJECT_INDEX_SERVICE.length;
  return id.substring(0, id.length-length);
}

export function generateProjectUUID(id = generateUUID(), prefix = '', sufix = ''):string {
  return PROJECT_SERVICE  + DIV + prefix + id +  DIV + PROJECT_INDEX_SERVICE;
}

export function generateProjectChildId(projectId: string, type: string, id = generateUUID()):string {
  return PROJECT_SERVICE+ DIV + projectId.split(DIV)[1] + DIV + type +
          DIV + id;
}

export function generateCollectionId(projectid: string, collection, id = generateUUID()): string {
  const length = PROJECT_INDEX_SERVICE.length;
  return projectid.substring(0, projectid.length-length)+collection+ DIV +id; 
}

export const waitMS = (ms) => {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
};


export function saveIntoArray(item: Object, ary: Array<any> = [], idKey: string = '_id'): Array<any> {
  let i = getIndexById(item[idKey], ary, idKey);
  if (i === -1) {
    i = ary.length;
  }
  return [...ary.slice(0, i),
  Object.assign({}, item),
  ...ary.slice(i + 1)];
}

export function genrateMetaData(userid:string){
    return [ 'u|'+ userid]; 
}



export function getIndexById(id: string, ary: any, idKey: string = '_id'): number {
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