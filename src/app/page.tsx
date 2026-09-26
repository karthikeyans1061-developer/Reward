import DashboardScreen from "@/features/dashboard/DashboardScreen";
import { getDashboardSnapshot } from "@/features/dashboard/repository";

export default async function Home() {
  const dashboard = await getDashboardSnapshot();

  return <DashboardScreen dashboard={dashboard} />;
}

export const dynamic = "force-dynamic";
