import { createSlice } from '@reduxjs/toolkit';
import { APIRealTokenCurrency } from 'src/types/APIRealToken';
import { setCookie, getCookie } from 'cookies-next'

const cookieCurrency = getCookie('currency') as APIRealTokenCurrency;

const initialState = {
  value: cookieCurrency ? cookieCurrency : APIRealTokenCurrency.USD,
};

const currencySlice = createSlice({
  name: 'currency',
  initialState,
  reducers: {
    setCurrency: (state, action) => {
      state.value = action.payload
      setCookie('currency', action.payload);
    },
  },
});

export const { setCurrency } = currencySlice.actions;
export default currencySlice.reducer;
