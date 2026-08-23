import { Landing } from "./components/Landing";
import { ApplicationForm } from "./components/ApplicationForm";

export default function App() {
  return (
    <div className="app-shell">
      <Landing />
      <div id="apply">
        <ApplicationForm />
      </div>
    </div>
  );
}
