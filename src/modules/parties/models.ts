import { Doc, ProjectItem } from "../data/models";
export const TYPE_PARTY = 'party';


export interface PartyMember {
  id: string,
  username: string,
  rights: string
}


export class PartyProject extends ProjectItem {
  type: string = 'party'
  creator: string = '';
  channel: string = '';

  members: PartyMember[]  = []

  constructor(values: Object = {}) {
    super()
    Object.assign(this, values);
  }
}
