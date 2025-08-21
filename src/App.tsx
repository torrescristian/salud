
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './lib/queryClient';
import { DashboardPage, NotificationContainer } from './components';
import { ReactQueryDevTools } from './components/ReactQueryDevTools';

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <div className="App">
        <DashboardPage />
        <NotificationContainer />
      </div>
      <ReactQueryDevTools />
    </QueryClientProvider>
  );
}

export default App;
