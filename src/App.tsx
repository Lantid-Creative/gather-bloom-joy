import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/useAuth";
import Index from "./pages/Index.tsx";
import EventDetail from "./pages/EventDetail.tsx";
import Checkout from "./pages/Checkout.tsx";
import Auth from "./pages/Auth.tsx";
import CreateEvent from "./pages/CreateEvent.tsx";
import MyEvents from "./pages/MyEvents.tsx";
import EditEvent from "./pages/EditEvent.tsx";
import MyTickets from "./pages/MyTickets.tsx";
import Profile from "./pages/Profile.tsx";
import Dashboard from "./pages/Dashboard.tsx";
import About from "./pages/About.tsx";
import Pricing from "./pages/Pricing.tsx";
import HelpCenter from "./pages/HelpCenter.tsx";
import Blog from "./pages/Blog.tsx";
import Contact from "./pages/Contact.tsx";
import Terms from "./pages/Terms.tsx";
import Privacy from "./pages/Privacy.tsx";
import Careers from "./pages/Careers.tsx";
import NotFound from "./pages/NotFound.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/event/:id" element={<EventDetail />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/create-event" element={<CreateEvent />} />
            <Route path="/my-events" element={<MyEvents />} />
            <Route path="/edit-event/:id" element={<EditEvent />} />
            <Route path="/my-tickets" element={<MyTickets />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/about" element={<About />} />
            <Route path="/pricing" element={<Pricing />} />
            <Route path="/help" element={<HelpCenter />} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/careers" element={<Careers />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
