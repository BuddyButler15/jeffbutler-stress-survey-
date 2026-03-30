import { Switch, Route, Router as WouterRouter } from "wouter";
import Home from "@/pages/home";
import Survey from "@/pages/survey";
import Results from "@/pages/results";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/survey" component={Survey} />
      <Route path="/results" component={Results} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
      <Router />
      <footer className="site-footer">
        Survey by Buddy Butler, BAIS:3300 - spring 2026
      </footer>
    </WouterRouter>
  );
}

export default App;
