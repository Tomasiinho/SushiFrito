import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactElement } from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { SushiFritoApp } from "@/application/SushiFritoApp";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1
    }
  }
});

export default function App(): ReactElement {
  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <SushiFritoApp />
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}
