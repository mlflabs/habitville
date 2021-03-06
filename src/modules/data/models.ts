export const PROJECT_SERVICE = '';
export const PROJECT_INDEX_SERVICE = 'ch';
export const SYSTEM_DOC = 'sys';

export const LASTCHAR = String.fromCharCode(65535);
export const DIV = '.';
export const DOUBLE_DIV = '..';

export class Doc {
  public id: string|undefined = undefined;
  name: string = '';
  public deleted?: boolean;
  public created?: number = Date.now();
  public updated?: number = Date.now();
  public creator?: string;
  public type: string = 'doc';
  public dirty?: number = 0;
  public rev = 1;
  constructor(values: Object = {}) {
      Object.assign(this, values);
  }

}

export class ProjectItem extends Doc {
  public id:string;
  public name: string = '';
  public note?: string;
  public access = [];

  constructor(values: Object = {}) {
    super();
    Object.assign(this, values);
    this.id = values['id'];
    if(!this.id)
      this.id = ''; 
  }
}









