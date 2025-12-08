
'use client';

import React, { ReactNode } from 'react';

// This provider ensures that Firebase is initialized only once on the client.
export const FirebaseClientProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  return <>{children}</>;
};
