import { AuthGuard } from "../components/layout/AuthGuard";
import { ProfileContent } from "../components/profile/ProfileContent";

export default function ProfilePage() {
  return (
    <AuthGuard requireOnboarding={false}>
      <ProfileContent />
    </AuthGuard>
  );
}
