import React from "react";
import { createRoot } from "react-dom/client";

const App = () => {
  return <div>Hello2</div>;
};

const rootElement = document.getElementById("root");
const root = createRoot(rootElement);
root.render(<App />);
