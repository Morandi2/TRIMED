import { Component, ErrorInfo, ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  showDetails: boolean;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
    showDetails: false,
  };

  public static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({ error, errorInfo });
    console.error("ErrorBoundary caught:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            minHeight: "100vh",
            background: "linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)",
            fontFamily: "'Inter', 'Segoe UI', system-ui, -apple-system, sans-serif",
            padding: "20px",
          }}
        >
          <div
            style={{
              maxWidth: "560px",
              width: "100%",
              background: "rgba(30, 41, 59, 0.8)",
              backdropFilter: "blur(20px)",
              borderRadius: "24px",
              border: "1px solid rgba(255, 255, 255, 0.08)",
              boxShadow: "0 25px 60px rgba(0, 0, 0, 0.4), 0 0 80px rgba(239, 68, 68, 0.08)",
              padding: "48px 40px",
              textAlign: "center",
            }}
          >
            {/* Icône d'erreur animée */}
            <div
              style={{
                width: "80px",
                height: "80px",
                borderRadius: "50%",
                background: "linear-gradient(135deg, rgba(239, 68, 68, 0.15), rgba(239, 68, 68, 0.05))",
                border: "2px solid rgba(239, 68, 68, 0.3)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 28px",
              }}
            >
              <svg
                width="36"
                height="36"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#ef4444"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
            </div>

            {/* Titre */}
            <h1
              style={{
                color: "#f1f5f9",
                fontSize: "1.5rem",
                fontWeight: 700,
                margin: "0 0 12px",
                letterSpacing: "-0.02em",
              }}
            >
              Une erreur est survenue
            </h1>

            {/* Description */}
            <p
              style={{
                color: "#94a3b8",
                fontSize: "0.95rem",
                lineHeight: 1.6,
                margin: "0 0 32px",
              }}
            >
              L'application a rencontré un problème inattendu.
              Veuillez réessayer ou contacter le support si le problème persiste.
            </p>

            {/* Message d'erreur */}
            <div
              style={{
                background: "rgba(239, 68, 68, 0.08)",
                border: "1px solid rgba(239, 68, 68, 0.2)",
                borderRadius: "12px",
                padding: "14px 18px",
                marginBottom: "28px",
                textAlign: "left",
              }}
            >
              <p
                style={{
                  color: "#fca5a5",
                  fontSize: "0.8rem",
                  fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                  margin: 0,
                  wordBreak: "break-word",
                }}
              >
                {this.state.error?.message || "Erreur inconnue"}
              </p>
            </div>

            {/* Boutons */}
            <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}>
              <button
                onClick={() => window.location.reload()}
                style={{
                  padding: "12px 28px",
                  background: "linear-gradient(135deg, #3b82f6, #2563eb)",
                  color: "white",
                  border: "none",
                  borderRadius: "12px",
                  cursor: "pointer",
                  fontSize: "0.9rem",
                  fontWeight: 600,
                  letterSpacing: "-0.01em",
                  boxShadow: "0 4px 15px rgba(37, 99, 235, 0.3)",
                  transition: "all 0.2s ease",
                }}
                onMouseOver={(e) => {
                  (e.target as HTMLButtonElement).style.transform = "translateY(-1px)";
                  (e.target as HTMLButtonElement).style.boxShadow = "0 6px 20px rgba(37, 99, 235, 0.4)";
                }}
                onMouseOut={(e) => {
                  (e.target as HTMLButtonElement).style.transform = "translateY(0)";
                  (e.target as HTMLButtonElement).style.boxShadow = "0 4px 15px rgba(37, 99, 235, 0.3)";
                }}
              >
                Rafraîchir la page
              </button>

              <button
                onClick={() =>
                  this.setState({ hasError: false, error: null, errorInfo: null })
                }
                style={{
                  padding: "12px 28px",
                  background: "rgba(255, 255, 255, 0.06)",
                  color: "#cbd5e1",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                  borderRadius: "12px",
                  cursor: "pointer",
                  fontSize: "0.9rem",
                  fontWeight: 600,
                  letterSpacing: "-0.01em",
                  transition: "all 0.2s ease",
                }}
                onMouseOver={(e) => {
                  (e.target as HTMLButtonElement).style.background = "rgba(255, 255, 255, 0.1)";
                  (e.target as HTMLButtonElement).style.transform = "translateY(-1px)";
                }}
                onMouseOut={(e) => {
                  (e.target as HTMLButtonElement).style.background = "rgba(255, 255, 255, 0.06)";
                  (e.target as HTMLButtonElement).style.transform = "translateY(0)";
                }}
              >
                Réessayer
              </button>
            </div>

            {/* Toggle détails techniques */}
            <button
              onClick={() => this.setState({ showDetails: !this.state.showDetails })}
              style={{
                marginTop: "24px",
                background: "none",
                border: "none",
                color: "#64748b",
                fontSize: "0.78rem",
                cursor: "pointer",
                textDecoration: "underline",
                textUnderlineOffset: "3px",
              }}
            >
              {this.state.showDetails ? "Masquer les détails techniques" : "Afficher les détails techniques"}
            </button>

            {/* Détails techniques (collapsible) */}
            {this.state.showDetails && (
              <pre
                style={{
                  background: "rgba(0, 0, 0, 0.4)",
                  color: "#94a3b8",
                  padding: "16px",
                  borderRadius: "12px",
                  overflow: "auto",
                  marginTop: "16px",
                  fontSize: "0.7rem",
                  maxHeight: "250px",
                  textAlign: "left",
                  fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                  border: "1px solid rgba(255, 255, 255, 0.05)",
                  lineHeight: 1.5,
                }}
              >
                {this.state.error?.stack}
                {"\n\n--- Pile de composants ---\n"}
                {this.state.errorInfo?.componentStack}
              </pre>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
