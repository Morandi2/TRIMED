import AuthPageLayout from "./AuthPageLayout";
import ForgotPasswordForm from "../../components/auth/ForgotPasswordForm";
import PageMeta from "../../components/common/PageMeta";

export default function ForgotPassword() {
    return (
        <>
            <PageMeta
                title="Mot de passe oublié | TRIMEDH"
                description="Réinitialisez votre mot de passe pour accéder à votre compte TRIMEDH."
            />
            <AuthPageLayout>
                <ForgotPasswordForm />
            </AuthPageLayout>
        </>
    );
}
