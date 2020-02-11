const nanoid = require('nanoid');


export const capitalize = (s: string) => {
  if (typeof s !== 'string') return ''
  return s.charAt(0).toUpperCase() + s.slice(1)
}

export function getNested(obj: any, ...args: string[]) {
  return args.reduce((obj, level) => obj && obj[level], obj)
}

export const waitMS = (ms: number) => {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
};

export function getAction(todo:string, data = {}){
  return {type:todo, data:data};
}

export function printCleanNote(text: string) {
  const t = text.replace(/(\r\n|\n|\r)/gm," ");
  if(t.length > 40)
    return t.substring(0,37)+'...';
  return t;
}

export function saveIntoArray(item: Object, ary: Array<any> = [], idKey: string = 'id'): Array<any> {
  let i = getIndexById(item[idKey], ary, idKey);
  if (i === -1) {
    i = ary.length;
  }
  return [...ary.slice(0, i),
          Object.assign({}, item),
          ...ary.slice(i + 1)];
}

export function saveIntoDocList(item: Object, ary: Array<any> = [], idKey: string = 'id'): Array<any> {
  if(item['deleted']){
    return ary.filter(d => d[idKey] !== item[idKey])
  }
  let i = getIndexById(item[idKey], ary, idKey);
  if (i === -1) {
    i = ary.length;
  }
  return [...ary.slice(0, i),
          Object.assign({}, item),
          ...ary.slice(i + 1)];
}

export function getIndexById(id: string, ary: any, idKey: string = 'id'): number {
  for (let i = 0; i < ary.length; i++) {
    if (id === ary[i][idKey]) {
      return i;
    }
  }
  return -1;
}

export function findById(id:any, ary: any[], idKey: string = "id"): any {
for (let i = 0; i < ary.length; i++) {
    if (id === ary[i][idKey]) {
      return ary[i];
    }
  }
  return null;
}

export function removeFromArrayById(id: any, ary:Array<any>, idKey = 'id') {
  return ary.filter(o => o[idKey] !== id);
}

export function clamp(val:number, max:number, min:number = 0): number {
  if(val > max) return max;
  if(val < min) return min;
  return val;
}