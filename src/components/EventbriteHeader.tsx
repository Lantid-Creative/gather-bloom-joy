import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Search, MapPin, ChevronDown, Menu, X, User, LogOut } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";

const EventbriteHeader = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [searchText, setSearchText] = useState(searchParams.get("q") ?? "");

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const handleSearch = () => {
    if (searchText.trim()) {
      navigate(`/?q=${encodeURIComponent(searchText.trim())}`);
    } else {
      navigate("/");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSearch();
  };

  return (
    <header className="sticky top-0 z-50 bg-background border-b">
      <div className="container flex h-14 items-center gap-4">
        {/* Logo */}
        <Link to="/" className="shrink-0">
          <span className="text-xl font-bold text-primary tracking-tight">afritickets</span>
        </Link>

        {/* Search Bar - Desktop */}
        <div className="hidden md:flex items-center flex-1 max-w-2xl">
          <div className="flex items-center flex-1 rounded-full border bg-background overflow-hidden h-10">
            <div className="flex items-center flex-1 px-3 gap-2 border-r">
              <Search className="h-4 w-4 text-muted-foreground shrink-0" />
              <input
                type="text"
                placeholder="Search events"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                onKeyDown={handleKeyDown}
                className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
              />
            </div>
            <div className="flex items-center flex-1 px-3 gap-2">
              <MapPin className="h-4 w-4 text-muted-foreground shrink-0" />
              <input
                type="text"
                placeholder="Your City"
                className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
              />
            </div>
            <button onClick={handleSearch} className="h-10 w-10 flex items-center justify-center bg-primary text-primary-foreground rounded-full shrink-0 mr-0.5 hover:bg-primary/90 transition-colors">
              <Search className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Nav Links - Desktop */}
        <nav className="hidden lg:flex items-center gap-1 ml-auto">
          <Link to="/" className="text-sm font-medium px-3 py-2 rounded-md hover:bg-accent transition-colors">
            Find Events
          </Link>
          <Link to="/create-event" className="text-sm font-medium px-3 py-2 rounded-md hover:bg-accent transition-colors">
            Create Events
          </Link>
          <button className="text-sm font-medium px-3 py-2 rounded-md hover:bg-accent transition-colors flex items-center gap-1">
            Help Center <ChevronDown className="h-3.5 w-3.5" />
          </button>
          <div className="w-px h-6 bg-border mx-1" />
          {user ? (
            <div className="flex items-center gap-1">
              <Link to="/my-events" className="text-sm font-medium px-3 py-2 rounded-md hover:bg-accent transition-colors">
                My Events
              </Link>
              <Link to="/my-tickets" className="text-sm font-medium px-3 py-2 rounded-md hover:bg-accent transition-colors">
                My Tickets
              </Link>
              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="h-4 w-4 text-primary" />
              </div>
              <button
                onClick={handleSignOut}
                className="text-sm font-medium px-3 py-2 rounded-md hover:bg-accent transition-colors flex items-center gap-1"
              >
                <LogOut className="h-3.5 w-3.5" /> Sign out
              </button>
            </div>
          ) : (
            <Link to="/auth" className="text-sm font-medium px-3 py-2 rounded-md hover:bg-accent transition-colors">
              Sign in
            </Link>
          )}
        </nav>

        {/* Mobile Menu Toggle */}
        <button
          className="lg:hidden ml-auto p-2"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile Search */}
      <div className="md:hidden px-4 pb-3">
        <div className="flex items-center rounded-full border bg-background overflow-hidden h-10">
          <div className="flex items-center flex-1 px-3 gap-2">
            <Search className="h-4 w-4 text-muted-foreground shrink-0" />
            <input
              type="text"
              placeholder="Search events"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              onKeyDown={handleKeyDown}
              className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            />
          </div>
          <button onClick={handleSearch} className="h-8 w-8 flex items-center justify-center bg-primary text-primary-foreground rounded-full shrink-0 mr-1">
            <Search className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="lg:hidden border-t bg-background p-4 space-y-1">
          <Link to="/" className="block text-sm font-medium py-2 px-3 rounded-md hover:bg-accent" onClick={() => setMobileOpen(false)}>Find Events</Link>
          <Link to="/create-event" className="block text-sm font-medium py-2 px-3 rounded-md hover:bg-accent" onClick={() => setMobileOpen(false)}>Create Events</Link>
          <button className="block w-full text-left text-sm font-medium py-2 px-3 rounded-md hover:bg-accent">Help Center</button>
          <div className="border-t my-2" />
          {user ? (
            <>
              <Link to="/my-events" className="block text-sm font-medium py-2 px-3 rounded-md hover:bg-accent" onClick={() => setMobileOpen(false)}>My Events</Link>
              <button onClick={() => { handleSignOut(); setMobileOpen(false); }} className="block w-full text-left text-sm font-medium py-2 px-3 rounded-md hover:bg-accent">Sign out</button>
            </>
          ) : (
            <Link to="/auth" className="block text-sm font-medium py-2 px-3 rounded-md hover:bg-accent" onClick={() => setMobileOpen(false)}>Sign in</Link>
          )}
        </div>
      )}
    </header>
  );
};

export default EventbriteHeader;
