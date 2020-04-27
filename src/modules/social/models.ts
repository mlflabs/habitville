import { Doc } from "../data/models";
import { Landscape } from '../gamify/models';

export const TYPE_SOCIAL = 'social';



export class Friend extends Doc {
  username!: string;
  id!: string;
  landscape!: Landscape;
  secondaryType?: string;


  constructor(values: Object = {}) {
    super()
    Object.assign(this, values);
    if(!values['username']) throw new Error('Friend Doc username required')
    if(!values['id']) throw new Error('Friend Doc id required')
    if(!values['landscape']) throw new Error('Friend Doc landscape required')
  }
}


