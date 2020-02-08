export const PROJECT_SERVICE = 'p';
export const PROJECT_INDEX_SERVICE = 'pi';

export const LASTCHAR = String.fromCharCode(65535);
export const DIV = '|';
export const DOUBLE_DIV = '||';

export const ACTION_SAVE = 'save';
export const ACTION_REMOVE = 'remove';

// user default project = u- + username

export class Doc {
  public _id: string|undefined = undefined;
  public _rev?: string;
  public _deleted?: boolean;
  public updated?: number;

  constructor(values: Object = {}) {
      Object.assign(this, values);
  }

}

export class ProjectItem extends Doc {
  public name?: string;
  public note?: string;

  public meta_access?;
  public childId?;

}









