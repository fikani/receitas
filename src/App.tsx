import { Router, Route } from "@solidjs/router";
import Home from "./pages/Home";
import Plan from "./pages/Plan";
import Shopping from "./pages/Shopping";
import CookingHub from "./pages/CookingHub";
import CookingStep from "./pages/CookingStep";
import Storage from "./pages/Storage";
import PlanComplete from "./pages/PlanComplete";

export default function App() {
  return (
    <Router>
      <Route path="/" component={Home} />
      <Route path="/plan" component={Plan} />
      <Route path="/shopping" component={Shopping} />
      <Route path="/cooking" component={CookingHub} />
      <Route path="/cooking/:id" component={CookingStep} />
      <Route path="/storage" component={Storage} />
      <Route path="/done" component={PlanComplete} />
    </Router>
  );
}
