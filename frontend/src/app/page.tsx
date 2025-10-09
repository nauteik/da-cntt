import DashboardClient from "@/app/DashboardClient";

export default function DashboardPage() {
  // This is now a Server Component.
  // You could fetch initial data here and pass it as props to DashboardClient.
  return <DashboardClient />;
}
