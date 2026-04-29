import PageMeta from "../../components/common/PageMeta";
import AuthLayout from "./AuthPageLayout";
import SignUpForm from "../../components/auth/SignUpForm";

export default function SignUp() {
  return (
    <>
      <PageMeta
        title="TRIMEDH"
        description="TRIMEDH est une plateforme de gestion de santé visant à améliorer l'accès et l'efficacité des services de santé grâce à une technologie avancée."
      />
      <AuthLayout maxWidth="max-w-4xl">
        <SignUpForm />
      </AuthLayout>
    </>
  );
}
