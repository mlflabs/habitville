export const TYPE_MARKET = 'mkt';

export const DEFAULT_SEED_NAME = 'starter';


export enum MarketItemType {
  seed = 'seed',
  building = 'building',
  clothing = 'clothing'
}

export const getMarketItem = (name, 
                              itemType: MarketItemType,
                              price:number,
                              difficulty:number = 0,
                              pic:string = "default.svg"):MarketItem => {
  return {
    name,
    id: 'mi.'+name,
    itemType,
    price,
    pic,
    difficulty,
    quantity:1
  }
}

export const defaultSeed: MarketItem = 
  getMarketItem(DEFAULT_SEED_NAME, MarketItemType.seed, 1, 0, DEFAULT_SEED_NAME);



export const MarketItems: MarketItem[]  = [
  getMarketItem('plant1', MarketItemType.seed, 1, 1, 'plant1'),
  getMarketItem('plant2', MarketItemType.seed, 1, 1, 'plant2'),
  getMarketItem('plant3', MarketItemType.seed, 1, 1, 'plant3'),

]



export class MarketItem  {
  name!: string;
  id!: string;
  itemType!: MarketItemType;
  price!: number;
  difficulty: number = 0;
  pic: string = 'default.svg';
  quantity: number = 0;

  constructor(values: Object = {}) {
    Object.assign(this, values);
    if(!values['itemType']) throw new Error('MarketItem Doc item type required');
    if(!values['id']) throw new Error('MarketItem Doc id required');
    if(!values['name']) throw new Error('MarketItem Doc name required');
    if(!values['price']) throw new Error('MarketItem Doc price required');
  }
}
