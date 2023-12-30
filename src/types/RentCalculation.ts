export enum RentCalculationState {
  Realtime = 'realtime',
  Global = 'global',
}

export interface RentCalculation {
  state: RentCalculationState
  date: number // timestamp
}
