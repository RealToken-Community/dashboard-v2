// @ts-ignore

import React, { useState, createContext, useContext, ReactNode } from "react";

export enum APIRealTokenCurrency {
  USD = 'USD',
  EUR = 'EUR'
}

interface CurrencyContextProps {
  currency: APIRealTokenCurrency;
  setCurrency: React.Dispatch<React.SetStateAction<APIRealTokenCurrency>>;
}

const CurrencyContext = createContext<CurrencyContextProps | undefined>(undefined);

export const CurrencyProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currency, setCurrency] = useState<APIRealTokenCurrency>(APIRealTokenCurrency.USD);

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
