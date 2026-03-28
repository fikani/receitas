import { Router, Route } from "@solidjs/router";

function Home() {
  return <div class="page"><h1>Meal Prep Planner</h1></div>;
}

export default function App() {
  return (
    <Router>
      <Route path="/" component={Home} />
    </Router>
  );
}
