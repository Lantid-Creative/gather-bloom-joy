import { Link } from "react-router-dom";

const popularCities = [
  "Lagos", "Nairobi", "Accra", "Johannesburg", "Cape Town",
  "Dar es Salaam", "Kigali", "Addis Ababa", "Kampala", "Abuja",
  "Dakar", "Casablanca", "Lusaka", "Maputo", "Harare",
];

const QantidFooter = () => {
  return (
    <footer className="border-t bg-background pb-16 lg:pb-0">
      {/* Popular cities section */}
      <div className="container py-10">
        <h3 className="text-lg font-bold mb-4">Popular cities in Africa</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
          {popularCities.map((city) => (
            <Link
              key={city}
              to={`/?q=${encodeURIComponent(city)}`}
              className="text-left text-sm text-eb-blue hover:underline py-1"
            >
              Events in {city}
            </Link>
          ))}
        </div>
      </div>

      <div className="border-t">
        <div className="container py-10">
          <div className="grid grid-cols-2 md:grid-cols-6 gap-8 text-left">
            {/* Use Qantid */}
            <div className="space-y-3">
              <h4 className="text-sm font-bold">Use Qantid</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link to="/create-event" className="hover:text-foreground transition-colors">Create Events</Link></li>
                <li><Link to="/pricing" className="hover:text-foreground transition-colors">Pricing</Link></li>
                <li><Link to="/dashboard" className="hover:text-foreground transition-colors">Organizer Dashboard</Link></li>
                <li><Link to="/my-tickets" className="hover:text-foreground transition-colors">My Tickets</Link></li>
                <li><Link to="/my-events" className="hover:text-foreground transition-colors">My Events</Link></li>
              </ul>
            </div>

            {/* Features */}
            <div className="space-y-3">
              <h4 className="text-sm font-bold">Features</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link to="/features/ticketing" className="hover:text-foreground transition-colors">Smart Ticketing</Link></li>
                <li><Link to="/features/check-in" className="hover:text-foreground transition-colors">QR Check-In</Link></li>
                <li><Link to="/features/dashboard" className="hover:text-foreground transition-colors">Dashboard</Link></li>
                <li><Link to="/features/influencers" className="hover:text-foreground transition-colors">Influencers</Link></li>
                <li><Link to="/features/sponsorship" className="hover:text-foreground transition-colors">Sponsorship</Link></li>
                <li><Link to="/features/promo-codes" className="hover:text-foreground transition-colors">Promo Codes</Link></li>
                <li><Link to="/features/payments" className="hover:text-foreground transition-colors">Payments</Link></li>
                <li><Link to="/features/africa" className="hover:text-foreground transition-colors">Africa-First</Link></li>
              </ul>
            </div>

            {/* Plan Events */}
            <div className="space-y-3">
              <h4 className="text-sm font-bold">Plan Events</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link to="/create-event" className="hover:text-foreground transition-colors">Sell Tickets Online</Link></li>
                <li><Link to="/help" className="hover:text-foreground transition-colors">Event Planning</Link></li>
                <li><Link to="/pricing" className="hover:text-foreground transition-colors">Concert Ticketing</Link></li>
                <li><Link to="/help" className="hover:text-foreground transition-colors">Mobile Money Payments</Link></li>
                <li><Link to="/help" className="hover:text-foreground transition-colors">Festival Management</Link></li>
              </ul>
            </div>

            {/* Find Events */}
            <div className="space-y-3">
              <h4 className="text-sm font-bold">Find Events</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link to="/" className="hover:text-foreground transition-colors">Events Near Me</Link></li>
                <li><Link to="/?q=Lagos" className="hover:text-foreground transition-colors">Events in Lagos</Link></li>
                <li><Link to="/?q=Nairobi" className="hover:text-foreground transition-colors">Events in Nairobi</Link></li>
                <li><Link to="/?q=Accra" className="hover:text-foreground transition-colors">Events in Accra</Link></li>
                <li><Link to="/?q=Johannesburg" className="hover:text-foreground transition-colors">Events in Johannesburg</Link></li>
                <li><Link to="/?q=online" className="hover:text-foreground transition-colors">Online Events</Link></li>
              </ul>
            </div>

            {/* Connect With Us */}
            <div className="space-y-3">
              <h4 className="text-sm font-bold">Connect With Us</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link to="/contact" className="hover:text-foreground transition-colors">Contact Support</Link></li>
                <li><a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors">Twitter / X</a></li>
                <li><a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors">Instagram</a></li>
                <li><a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors">Facebook</a></li>
                <li><a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors">LinkedIn</a></li>
                <li><a href="https://tiktok.com" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors">TikTok</a></li>
              </ul>
            </div>

            {/* Company */}
            <div className="space-y-3">
              <h4 className="text-sm font-bold">Company</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link to="/about" className="hover:text-foreground transition-colors">About Us</Link></li>
                <li><Link to="/blog" className="hover:text-foreground transition-colors">Blog</Link></li>
                <li><Link to="/help" className="hover:text-foreground transition-colors">Help Center</Link></li>
                <li><Link to="/careers" className="hover:text-foreground transition-colors">Careers</Link></li>
                <li><Link to="/contact" className="hover:text-foreground transition-colors">Press</Link></li>
                <li><Link to="/contact" className="hover:text-foreground transition-colors">Partners</Link></li>
              </ul>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="mt-10 pt-6 border-t flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span>© 2026 Qantid</span>
              <Link to="/terms" className="hover:text-foreground transition-colors">Terms</Link>
              <Link to="/privacy" className="hover:text-foreground transition-colors">Privacy</Link>
              <Link to="/help" className="hover:text-foreground transition-colors">Accessibility</Link>
            </div>
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <span>🌍 Africa</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default QantidFooter;
