import { Shell } from "./components/Shell";
import { LoginScreen } from "./components/LoginScreen";

export default function Page() {
  return (
    <Shell className="justify-center">
      <LoginScreen />
    </Shell>
  );
}