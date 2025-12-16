import { createRoot } from "react-dom/client";
import { Popup } from "./Popup";

function start() {
  const root = createRoot(document.getElementById("root")!);
  root.render(<Popup />);
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", start);
} else {
  start();
}
