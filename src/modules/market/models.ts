export const TYPE_MARKET = 'mkt';

export const DEFAULT_SEED_NAME = 'Maple';


export enum MarketItemType {
  seed = 'seed',
  building = 'building',
  clothing = 'clothing'
}

export const getMarketItem = (id,
                              name, 
                              itemType: MarketItemType,
                              price:number,
                              difficulty:number = 0,):MarketItem => {
  return {
    id,
    name,
    itemType,
    price,
    difficulty,
    quantity:1
  }
}

export const defaultSeed: MarketItem = 
  getMarketItem('tree.' + DEFAULT_SEED_NAME, DEFAULT_SEED_NAME, MarketItemType.seed, 1, 0);

export const MarketItems: MarketItem[]  = [
  getMarketItem('tree.plant1', 'Green Ash', MarketItemType.seed, 10, 1),
  getMarketItem('tree.plant2', 'River Birch', MarketItemType.seed, 25, 1),
  getMarketItem('tree.plant3', 'Paper Birch', MarketItemType.seed, 25, 1),
]



export class MarketItem  {
  name!: string;
  id!: string;
  itemType!: MarketItemType;
  price!: number;
  difficulty: number = 0; 
  quantity: number = 0;

  constructor(values: Object = {}) {
    Object.assign(this, values);
    if(!values['itemType']) throw new Error('MarketItem Doc item type required');
    if(!values['id']) throw new Error('MarketItem Doc id required');
    if(!values['name']) throw new Error('MarketItem Doc name required');
    if(!values['price']) throw new Error('MarketItem Doc price required');
  }
}
