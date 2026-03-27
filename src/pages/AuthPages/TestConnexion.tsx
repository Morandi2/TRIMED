import React from 'react';
import AuthLayout from './AuthPageLayout';

export default function TestConnexion() {
    return (
        <AuthLayout>
            <div style={{ padding: '20px', background: 'red', color: 'white' }}>
                <h1>TEST CONNEXION PAGE</h1>
                <p>Si ou wè sa, routing la ap mache!</p>
            </div>
        </AuthLayout>
    );
}
