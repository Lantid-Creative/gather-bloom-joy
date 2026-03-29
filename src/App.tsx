import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/useAuth";
import ProtectedRoute from "@/components/ProtectedRoute";
import ScrollToTop from "@/components/ScrollToTop";
import BackToTopButton from "@/components/BackToTopButton";
import Index from "./pages/Index.tsx";
import EventDetail from "./pages/EventDetail.tsx";
import Checkout from "./pages/Checkout.tsx";
import Auth from "./pages/Auth.tsx";
import ResetPassword from "./pages/ResetPassword.tsx";
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
import OrganizerProfile from "./pages/OrganizerProfile.tsx";
import CheckIn from "./pages/CheckIn.tsx";
import SavedEvents from "./pages/SavedEvents.tsx";
import Partners from "./pages/Partners.tsx";
import PartnerDashboard from "./pages/PartnerDashboard.tsx";
import Influencers from "./pages/Influencers.tsx";
import InfluencerProfile from "./pages/InfluencerProfile.tsx";
import InfluencerDashboard from "./pages/InfluencerDashboard.tsx";
import HireInfluencer from "./pages/HireInfluencer.tsx";
import MyHires from "./pages/MyHires.tsx";
import FeatureTicketing from "./pages/features/FeatureTicketing.tsx";
import FeatureCheckIn from "./pages/features/FeatureCheckIn.tsx";
import FeatureDashboard from "./pages/features/FeatureDashboard.tsx";
import FeatureInfluencers from "./pages/features/FeatureInfluencers.tsx";
import FeatureSponsorship from "./pages/features/FeatureSponsorship.tsx";
import FeaturePromoCodes from "./pages/features/FeaturePromoCodes.tsx";
import FeaturePayments from "./pages/features/FeaturePayments.tsx";
import FeatureAfrica from "./pages/features/FeatureAfrica.tsx";
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
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/create-event" element={<ProtectedRoute><CreateEvent /></ProtectedRoute>} />
            <Route path="/my-events" element={<ProtectedRoute><MyEvents /></ProtectedRoute>} />
            <Route path="/edit-event/:id" element={<ProtectedRoute><EditEvent /></ProtectedRoute>} />
            <Route path="/my-tickets" element={<ProtectedRoute><MyTickets /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/saved" element={<ProtectedRoute><SavedEvents /></ProtectedRoute>} />
            <Route path="/check-in/:eventId" element={<ProtectedRoute><CheckIn /></ProtectedRoute>} />
            <Route path="/organizer/:id" element={<OrganizerProfile />} />
            <Route path="/about" element={<About />} />
            <Route path="/pricing" element={<Pricing />} />
            <Route path="/help" element={<HelpCenter />} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/careers" element={<Careers />} />
            <Route path="/partners" element={<Partners />} />
            <Route path="/partner-dashboard" element={<ProtectedRoute><PartnerDashboard /></ProtectedRoute>} />
            <Route path="/influencers" element={<Influencers />} />
            <Route path="/influencer/:id" element={<InfluencerProfile />} />
            <Route path="/influencer-dashboard" element={<ProtectedRoute><InfluencerDashboard /></ProtectedRoute>} />
            <Route path="/hire/:influencerId" element={<ProtectedRoute><HireInfluencer /></ProtectedRoute>} />
            <Route path="/my-hires" element={<ProtectedRoute><MyHires /></ProtectedRoute>} />
            <Route path="/features/ticketing" element={<FeatureTicketing />} />
            <Route path="/features/check-in" element={<FeatureCheckIn />} />
            <Route path="/features/dashboard" element={<FeatureDashboard />} />
            <Route path="/features/influencers" element={<FeatureInfluencers />} />
            <Route path="/features/sponsorship" element={<FeatureSponsorship />} />
            <Route path="/features/promo-codes" element={<FeaturePromoCodes />} />
            <Route path="/features/payments" element={<FeaturePayments />} />
            <Route path="/features/africa" element={<FeatureAfrica />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
