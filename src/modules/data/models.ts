export const PROJECT_SERVICE = '';
export const PROJECT_INDEX_SERVICE = 'ch';

export const LASTCHAR = String.fromCharCode(65535);
export const DIV = '.';
export const DOUBLE_DIV = '..';

export class Doc {
  public _id: string|undefined = undefined;
  public deleted?: boolean;
  public created?: number = Date.now();
  public updated?: number = Date.now();
  public type: string = 'doc';

  constructor(values: Object = {}) {
      Object.assign(this, values);
  }

}

export class ProjectItem extends Doc {
  public name: string = '';
  public note?: string;
  public access = [];

  constructor(values: Object = {}) {
    super();
    Object.assign(this, values);
}
}









