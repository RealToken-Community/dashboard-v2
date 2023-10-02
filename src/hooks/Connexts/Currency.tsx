// @ts-ignore

import React, { useState, createContext, useContext, ReactNode, useEffect } from "react";
import { getCookie, setCookie } from 'cookies-next';

export enum APIRealTokenCurrency {
  USD = 'USD',
  EUR = 'EUR'
}

interface CurrencyContextProps {
  currency: APIRealTokenCurrency | undefined;
  setCurrency: React.Dispatch<React.SetStateAction<APIRealTokenCurrency | undefined>>;
}

const CurrencyContext = createContext<CurrencyContextProps | undefined>(undefined);

export const CurrencyProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currency, setCurrency] = useState<APIRealTokenCurrency | undefined>();

  useEffect(() => {
    const cookieCurrency = getCookie('currency');
    console.log({ cookieCurrency });
    if(!cookieCurrency){
      setCurrency(APIRealTokenCurrency.USD);
      setCookie('currency', APIRealTokenCurrency.USD);
      return;
    }

    setCurrency(cookieCurrency as APIRealTokenCurrency);
  }, []);


  useEffect(() => {
    if(!currency) return;
    console.log('update currency', { currency })
    setCookie('currency', currency);
  }, [currency]);
    

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export const useCurrency = () => {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error("useCurrency must be used within a CurrencyProvider");
  }
  return context;
}
