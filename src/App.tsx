import { Home } from "./pages/Home";
import { HistoryPage } from "./pages/History";
import { Toaster } from "sonner";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { Route, Switch } from "wouter";

export default function App() {
  return (
    <ErrorBoundary>
      <Toaster position="top-center" expand={false} richColors />
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/history" component={HistoryPage} />
      </Switch>
    </ErrorBoundary>
  );
}
