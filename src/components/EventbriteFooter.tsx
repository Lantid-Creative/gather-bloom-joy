import { Link } from "react-router-dom";

const popularCities = [
  "Austin", "Denver", "Seattle", "Phoenix", "Nashville",
  "Detroit", "Raleigh", "Baltimore", "Indianapolis", "San Antonio",
  "Portland", "Minneapolis", "Charlotte", "Orlando", "Tampa",
];

const EventbriteFooter = () => {
  return (
    <footer className="border-t bg-background">
      {/* Popular cities section */}
      <div className="container py-10">
        <h3 className="text-lg font-bold mb-4">Popular cities</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
          {popularCities.map((city) => (
            <button
              key={city}
              className="text-left text-sm text-eb-blue hover:underline py-1"
            >
              Things to do in {city}
            </button>
          ))}
        </div>
      </div>

      <div className="border-t">
        <div className="container py-10">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
            {/* Use Eventbrite */}
            <div className="space-y-3">
              <h4 className="text-sm font-bold">Use Eventbrite</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><button className="hover:text-foreground transition-colors">Create Events</button></li>
                <li><button className="hover:text-foreground transition-colors">Pricing</button></li>
                <li><button className="hover:text-foreground transition-colors">Event Marketing Platform</button></li>
                <li><button className="hover:text-foreground transition-colors">Eventbrite Mobile Ticket App</button></li>
                <li><button className="hover:text-foreground transition-colors">Eventbrite Check-In App</button></li>
                <li><button className="hover:text-foreground transition-colors">Eventbrite App Marketplace</button></li>
                <li><button className="hover:text-foreground transition-colors">Event Registration Software</button></li>
              </ul>
            </div>

            {/* Plan Events */}
            <div className="space-y-3">
              <h4 className="text-sm font-bold">Plan Events</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><button className="hover:text-foreground transition-colors">Sell Tickets Online</button></li>
                <li><button className="hover:text-foreground transition-colors">Event Planning</button></li>
                <li><button className="hover:text-foreground transition-colors">Sell Concert Tickets Online</button></li>
                <li><button className="hover:text-foreground transition-colors">Event Payment System</button></li>
                <li><button className="hover:text-foreground transition-colors">Solutions for Professional Services</button></li>
                <li><button className="hover:text-foreground transition-colors">Event Management Software</button></li>
              </ul>
            </div>

            {/* Find Events */}
            <div className="space-y-3">
              <h4 className="text-sm font-bold">Find Events</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><button className="hover:text-foreground transition-colors">Events Near Me</button></li>
                <li><button className="hover:text-foreground transition-colors">Events in San Francisco</button></li>
                <li><button className="hover:text-foreground transition-colors">Events in Los Angeles</button></li>
                <li><button className="hover:text-foreground transition-colors">Events in New York</button></li>
                <li><button className="hover:text-foreground transition-colors">Events in Chicago</button></li>
                <li><button className="hover:text-foreground transition-colors">Online Events</button></li>
              </ul>
            </div>

            {/* Connect With Us */}
            <div className="space-y-3">
              <h4 className="text-sm font-bold">Connect With Us</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><button className="hover:text-foreground transition-colors">Contact Support</button></li>
                <li><button className="hover:text-foreground transition-colors">Twitter</button></li>
                <li><button className="hover:text-foreground transition-colors">Facebook</button></li>
                <li><button className="hover:text-foreground transition-colors">LinkedIn</button></li>
                <li><button className="hover:text-foreground transition-colors">Instagram</button></li>
              </ul>
            </div>

            {/* Company */}
            <div className="space-y-3">
              <h4 className="text-sm font-bold">Company</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><button className="hover:text-foreground transition-colors">About</button></li>
                <li><button className="hover:text-foreground transition-colors">Blog</button></li>
                <li><button className="hover:text-foreground transition-colors">Help</button></li>
                <li><button className="hover:text-foreground transition-colors">Careers</button></li>
                <li><button className="hover:text-foreground transition-colors">Press</button></li>
                <li><button className="hover:text-foreground transition-colors">Impact</button></li>
                <li><button className="hover:text-foreground transition-colors">Investors</button></li>
                <li><button className="hover:text-foreground transition-colors">Security</button></li>
                <li><button className="hover:text-foreground transition-colors">Developers</button></li>
                <li><button className="hover:text-foreground transition-colors">Status</button></li>
              </ul>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="mt-10 pt-6 border-t flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span>© 2026 Eventbrite</span>
              <button className="hover:text-foreground transition-colors">Terms</button>
              <button className="hover:text-foreground transition-colors">Privacy</button>
              <button className="hover:text-foreground transition-colors">Accessibility</button>
              <button className="hover:text-foreground transition-colors">Cookies</button>
            </div>
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <button className="hover:text-foreground transition-colors">🇺🇸 United States</button>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default EventbriteFooter;
