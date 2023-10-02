import { createSlice } from '@reduxjs/toolkit';
import { APIRealTokenCurrency } from 'src/types/APIRealToken';

const initialState = {
  value: APIRealTokenCurrency.USD,
};

const currencySlice = createSlice({
  name: 'currency',
  initialState,
  reducers: {
    setCurrency: (state, action) => {
      state.value = action.payload;
    },
  },
});

export const { setCurrency } = currencySlice.actions;
export default currencySlice.reducer;
