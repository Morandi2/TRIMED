import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
// Polices servies par le site lui-même (pas d’aller-retour vers Google Fonts) ;
// le navigateur ne télécharge que les fichiers des caractères réellement affichés.
import "@fontsource-variable/lexend";
import "@fontsource-variable/martian-mono/standard.css";
import "@fontsource-variable/outfit";
import "./index.css";
import App from "./App.tsx";
import { AppWrapper } from "./components/common/PageMeta.tsx";
import { ThemeProvider } from "./context/ThemeContext.tsx";
import ErrorBoundary from "./components/common/ErrorBoundary.tsx";

const container = document.getElementById("root");

if (container) {
  createRoot(container).render(
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
} else {
  console.error("Root container not found");
}
