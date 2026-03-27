import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { UserProvider } from "./context/UserContext";
import { TenantProvider } from "./context/TenantContext";
import Index from "./pages/index/Index";

export default function App() {
    return (
        <TenantProvider>
            <UserProvider>
                <Router>
                    <Routes>
                        <Route path="/" element={<Index />} />
                        <Route path="/connexion" element={<div>PAGE CONNEXION</div>} />
                    </Routes>
                </Router>
            </UserProvider>
        </TenantProvider>
    );
}
