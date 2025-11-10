import PageMeta from "../../components/common/PageMeta";
import AuthLayout from "./AuthPageLayout";
import SignUpForm from "../../components/auth/SignUpForm";

export default function SignUp() {
  return (
    <>
      <PageMeta
        title="TRIMED"
        description="TRIMED se yon platfòm jesyon sante ki vize amelyore aksè ak efikasite nan sèvis sante atravè teknoloji avanse."
      />
      <AuthLayout>
        <SignUpForm />
      </AuthLayout>
    </>
  );
}
