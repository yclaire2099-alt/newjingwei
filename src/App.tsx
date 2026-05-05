import { Home } from "./pages/Home";
import { HistoryPage } from "./pages/History";
import { PricingPage } from "./pages/Pricing";
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
        <Route path="/pricing" component={PricingPage} />
      </Switch>
    </ErrorBoundary>
  );
}
