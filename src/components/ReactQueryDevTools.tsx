import React from 'react';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

export const ReactQueryDevTools: React.FC = () => {
  // Solo mostrar en desarrollo
  if (process.env.NODE_ENV === 'production') {
    return null;
  }

  return <ReactQueryDevtools initialIsOpen={false} />;
};
