import PromoCodeManager from "@/components/PromoCodeManager";
import { useDashboardData } from "@/hooks/useDashboardData";

const DashboardPromoCodes = () => {
  const { events } = useDashboardData();

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Promo Codes</h2>
      <PromoCodeManager events={events?.map((e) => ({ id: e.id, title: e.title })) ?? []} />
    </div>
  );
};

export default DashboardPromoCodes;
