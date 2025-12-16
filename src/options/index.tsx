import { createRoot } from "react-dom/client";
import { Options } from "./Options";

function start() {
  const root = createRoot(document.getElementById("root")!);
  root.render(<Options />);
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", start);
} else {
  start();
}
