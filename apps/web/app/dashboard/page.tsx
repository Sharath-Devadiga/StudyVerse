import { AuthGuard } from "../components/layout/AuthGuard";
import { DashboardContent } from "../components/dashboard/DashboardContent";

export default function DashboardPage() {
  return (
    <AuthGuard>
      <DashboardContent />
    </AuthGuard>
  );
}
