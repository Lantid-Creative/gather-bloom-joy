const popularCities = [
  "Lagos", "Nairobi", "Accra", "Johannesburg", "Cape Town",
  "Dar es Salaam", "Kigali", "Addis Ababa", "Kampala", "Abuja",
  "Dakar", "Casablanca", "Lusaka", "Maputo", "Harare",
];

const EventbriteFooter = () => {
  return (
    <footer className="border-t bg-background">
      {/* Popular cities section */}
      <div className="container py-10">
        <h3 className="text-lg font-bold mb-4">Popular cities in Africa</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
          {popularCities.map((city) => (
            <button
              key={city}
              className="text-left text-sm text-eb-blue hover:underline py-1"
            >
              Events in {city}
            </button>
          ))}
        </div>
      </div>

      <div className="border-t">
        <div className="container py-10">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8 text-left">
            {/* Use Afritickets */}
            <div className="space-y-3">
              <h4 className="text-sm font-bold">Use Afritickets</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><button className="text-left hover:text-foreground transition-colors">Create Events</button></li>
                <li><button className="text-left hover:text-foreground transition-colors">Pricing</button></li>
                <li><button className="text-left hover:text-foreground transition-colors">Event Marketing Platform</button></li>
                <li><button className="text-left hover:text-foreground transition-colors">Afritickets Mobile App</button></li>
                <li><button className="text-left hover:text-foreground transition-colors">Check-In App</button></li>
                <li><button className="text-left hover:text-foreground transition-colors">Organizer Dashboard</button></li>
                <li><button className="text-left hover:text-foreground transition-colors">Event Registration</button></li>
              </ul>
            </div>

            {/* Plan Events */}
            <div className="space-y-3">
              <h4 className="text-sm font-bold">Plan Events</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><button className="text-left hover:text-foreground transition-colors">Sell Tickets Online</button></li>
                <li><button className="text-left hover:text-foreground transition-colors">Event Planning</button></li>
                <li><button className="text-left hover:text-foreground transition-colors">Concert Ticketing</button></li>
                <li><button className="text-left hover:text-foreground transition-colors">Mobile Money Payments</button></li>
                <li><button className="text-left hover:text-foreground transition-colors">Festival Management</button></li>
                <li><button className="text-left hover:text-foreground transition-colors">Conference Solutions</button></li>
              </ul>
            </div>

            {/* Find Events */}
            <div className="space-y-3">
              <h4 className="text-sm font-bold">Find Events</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><button className="text-left hover:text-foreground transition-colors">Events Near Me</button></li>
                <li><button className="text-left hover:text-foreground transition-colors">Events in Lagos</button></li>
                <li><button className="text-left hover:text-foreground transition-colors">Events in Nairobi</button></li>
                <li><button className="text-left hover:text-foreground transition-colors">Events in Accra</button></li>
                <li><button className="text-left hover:text-foreground transition-colors">Events in Johannesburg</button></li>
                <li><button className="text-left hover:text-foreground transition-colors">Online Events</button></li>
              </ul>
            </div>

            {/* Connect With Us */}
            <div className="space-y-3">
              <h4 className="text-sm font-bold">Connect With Us</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><button className="text-left hover:text-foreground transition-colors">Contact Support</button></li>
                <li><button className="text-left hover:text-foreground transition-colors">Twitter / X</button></li>
                <li><button className="text-left hover:text-foreground transition-colors">Instagram</button></li>
                <li><button className="text-left hover:text-foreground transition-colors">Facebook</button></li>
                <li><button className="text-left hover:text-foreground transition-colors">LinkedIn</button></li>
                <li><button className="text-left hover:text-foreground transition-colors">TikTok</button></li>
              </ul>
            </div>

            {/* Company */}
            <div className="space-y-3">
              <h4 className="text-sm font-bold">Company</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><button className="text-left hover:text-foreground transition-colors">About Us</button></li>
                <li><button className="text-left hover:text-foreground transition-colors">Blog</button></li>
                <li><button className="text-left hover:text-foreground transition-colors">Help Center</button></li>
                <li><button className="text-left hover:text-foreground transition-colors">Careers</button></li>
                <li><button className="text-left hover:text-foreground transition-colors">Press</button></li>
                <li><button className="text-left hover:text-foreground transition-colors">Partners</button></li>
                <li><button className="text-left hover:text-foreground transition-colors">Investors</button></li>
                <li><button className="text-left hover:text-foreground transition-colors">Security</button></li>
                <li><button className="text-left hover:text-foreground transition-colors">Developers API</button></li>
              </ul>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="mt-10 pt-6 border-t flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span>© 2026 Afritickets</span>
              <button className="hover:text-foreground transition-colors">Terms</button>
              <button className="hover:text-foreground transition-colors">Privacy</button>
              <button className="hover:text-foreground transition-colors">Accessibility</button>
              <button className="hover:text-foreground transition-colors">Cookies</button>
            </div>
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <button className="hover:text-foreground transition-colors">🌍 Africa</button>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default EventbriteFooter;
