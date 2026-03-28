import { Router, Route } from "@solidjs/router";
import Home from "./pages/Home";
import Plan from "./pages/Plan";

export default function App() {
  return (
    <Router>
      <Route path="/" component={Home} />
      <Route path="/plan" component={Plan} />
    </Router>
  );
}
