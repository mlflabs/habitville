


export interface LandscapeTree {
  name: string;
  id: string;
  habitId: string;
  level:number; 
  position: number;
}

export const getDefaultLandscape = () => {
  return {
    trees: []
  }
}


export interface Landscape {
  trees: LandscapeTree[],
}
