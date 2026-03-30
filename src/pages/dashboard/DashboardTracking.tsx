import TrackingLinkManager from "@/components/TrackingLinkManager";
import { useDashboardData } from "@/hooks/useDashboardData";

const DashboardTracking = () => {
  const { events } = useDashboardData();

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Tracking Links</h2>
      <TrackingLinkManager events={events?.map((e) => ({ id: e.id, title: e.title })) ?? []} />
    </div>
  );
};

export default DashboardTracking;
