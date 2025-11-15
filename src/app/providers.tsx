'use client';

import { Provider } from 'react-redux';
import { QueryClientProvider } from '@tanstack/react-query';
import { store } from '@/store';
import { AuthProvider } from '@/hooks/useAuth';
import NavigationLoading from '@/components/layout/NavigationLoading';
import { queryClient } from '@/lib/queryClient';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <Provider store={store}>
        <AuthProvider>
          <NavigationLoading />
          {children}
        </AuthProvider>
      </Provider>
    </QueryClientProvider>
  );
}
