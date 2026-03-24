import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import "swiper/swiper-bundle.css";
import "flatpickr/dist/flatpickr.css";
import App from "./App.tsx";
import { AppWrapper } from "./components/common/PageMeta.tsx";
import { ThemeProvider } from "./context/ThemeContext.tsx";
import ErrorBoundary from "./components/common/ErrorBoundary.tsx";

console.log("DEBUG: Main.tsx execution started");

const container = document.getElementById("root");
console.log("DEBUG: Container found:", !!container);

if (container) {
  const root = createRoot(container);
  console.log("DEBUG: Rendering app...");
  root.render(
    <StrictMode>
      <ErrorBoundary>
        <ThemeProvider>
          <AppWrapper>
            <App />
          </AppWrapper>
        </ThemeProvider>
      </ErrorBoundary>
    </StrictMode>
  );
  console.log("DEBUG: Render command issued");
} else {
  console.error("DEBUG: Root container not found");
}
