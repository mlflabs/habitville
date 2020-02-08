import { PROJECT_SERVICE, DIV, PROJECT_INDEX_SERVICE, LASTCHAR } from './models';

const nanoid = require('nanoid');


export function generateProjectUUID():string {
  return PROJECT_SERVICE + DIV + PROJECT_INDEX_SERVICE + DIV + nanoid();
}

export function generateProjectChildId(projectId: string, type: string):string {
  return PROJECT_SERVICE+ DIV + projectId.split(DIV)[2] + 
          DIV + nanoid();
}


export function generateUUID(prefix:string ="id"): string{
  return prefix + nanoid();
}

export function generateShortUUID(prefix:string ="id"): string{
  return prefix + nanoid();
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