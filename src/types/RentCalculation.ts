export type RentCalculationState = 'realtime' | 'global';

export interface RentCalculation {
  state: RentCalculationState;
  date: number; // timestamp
}
