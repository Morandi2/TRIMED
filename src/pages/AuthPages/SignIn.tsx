import PageMeta from "../../components/common/PageMeta";
import AuthLayout from "./AuthPageLayout";
import SignInForm from "../../components/auth/SignInForm";

export default function SignIn() {
  return (
    <>
      <PageMeta
        title="TRIMED"
        description="La plateforme médicale complète pour gérer vos patients, rendez-vous et prescriptions en toute simplicité. 
        Accédez à tous vos outils professionnels en un seul endroit sécurisé."
      />
      <AuthLayout>
        <SignInForm />
      </AuthLayout>
    </>
  );
}
