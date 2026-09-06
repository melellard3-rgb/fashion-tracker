import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import FashionRankings from "../FashionRankings.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <FashionRankings />
  </StrictMode>,
);
