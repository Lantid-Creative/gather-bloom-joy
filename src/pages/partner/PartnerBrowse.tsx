import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const PartnerBrowse = () => {
  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Browse Events</h2>
      <div className="text-center py-8 space-y-3">
        <p className="text-muted-foreground">Discover events looking for sponsors and submit your proposals.</p>
        <Button variant="hero" className="rounded-full" asChild><Link to="/partners">Browse Sponsorship Opportunities</Link></Button>
      </div>
    </div>
  );
};

export default PartnerBrowse;
