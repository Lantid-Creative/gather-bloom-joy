import type { Event } from "./types";
import eventAfroTech from "@/assets/event-afrotech.jpg";
import eventAfroFood from "@/assets/event-afrofood.jpg";
import eventAfroArt from "@/assets/event-afroart.jpg";
import eventAfroWellness from "@/assets/event-afrowellness.jpg";

export const mockEvents: Event[] = [
  {
    id: "1",
    title: "AfroTech Summit Lagos 2026",
    description:
      "Africa's largest technology conference brings together 2,000+ founders, developers, and investors shaping the future of the continent's digital economy. Featuring keynotes from Africa's top tech leaders, startup pitch competitions, and hands-on workshops.",
    date: "2026-04-15",
    end_date: "2026-04-16",
    time: "9:00 AM",
    location: "Eko Convention Centre, Lagos, Nigeria",
    image_url: eventAfroTech,
    category: "Business",
    organizer: "AfroTech Foundation",
    capacity: 2000,
    tickets_sold: 1542,
    is_online: false,
    tags: ["Tech", "Startups", "Innovation", "Africa", "Conference"],
    ticket_types: [
      { id: "t1", name: "General Admission", price: 75, description: "Access to all keynotes, exhibition hall, and networking", available: 458, max_per_order: 5 },
      { id: "t2", name: "VIP Pass", price: 250, description: "Priority seating, speaker dinner, exclusive workshops, and swag bag", available: 45, max_per_order: 2 },
      { id: "t3", name: "Student", price: 25, description: "Valid student ID required at check-in", available: 200, max_per_order: 1 },
    ],
    schedule: [
      { time: "9:00 AM", title: "Doors Open & Registration" },
      { time: "10:00 AM", title: "Opening Keynote: Africa's Digital Future", speaker: "Iyinoluwa Aboyeji" },
      { time: "11:30 AM", title: "Workshop: Building Fintech for the Unbanked" },
      { time: "1:00 PM", title: "Lunch & Networking" },
      { time: "2:30 PM", title: "Panel: Scaling Across African Markets" },
      { time: "4:00 PM", title: "Startup Pitch Competition Finals" },
      { time: "5:30 PM", title: "Closing Remarks & Networking Party" },
    ],
  },
  {
    id: "2",
    title: "Jollof & Suya Festival",
    description:
      "A spectacular celebration of West African cuisine! Over 30 vendors serving the best jollof rice, suya, puff puff, and more. Live afrobeats DJ sets, cooking competitions, and a family-friendly atmosphere under the stars at the Accra waterfront.",
    date: "2026-05-02",
    time: "4:00 PM",
    location: "Labadi Beach, Accra, Ghana",
    image_url: eventAfroFood,
    category: "Food & Drink",
    organizer: "Ghana Food Collective",
    capacity: 500,
    tickets_sold: 380,
    is_online: false,
    tags: ["Food", "Jollof", "West Africa", "Festival", "Culture"],
    ticket_types: [
      { id: "t4", name: "Tasting Pass", price: 40, description: "Unlimited tastings from all food vendors", available: 120, max_per_order: 6 },
      { id: "t5", name: "Premium Experience", price: 120, description: "VIP seating, chef's table dinner, unlimited drinks, and cooking class", available: 25, max_per_order: 2 },
    ],
    schedule: [
      { time: "4:00 PM", title: "Gates Open" },
      { time: "4:30 PM", title: "Welcome & Opening Drum Circle" },
      { time: "5:00 PM", title: "Jollof Wars: Nigeria vs Ghana Cook-Off" },
      { time: "7:00 PM", title: "Live Afrobeats DJ Set" },
      { time: "9:00 PM", title: "Dessert Hour & Closing Vibes" },
    ],
  },
  {
    id: "3",
    title: "Contemporary African Art Exhibition",
    description:
      "Discover 'Ubuntu' — a groundbreaking exhibition featuring 20 emerging African artists from across the continent. Exploring themes of identity, migration, tradition, and modernity through painting, sculpture, and digital art.",
    date: "2026-04-28",
    time: "6:00 PM",
    location: "Nubuke Foundation, Accra, Ghana",
    image_url: eventAfroArt,
    category: "Performing & Visual Arts",
    organizer: "Nubuke Foundation",
    capacity: 200,
    tickets_sold: 156,
    is_online: false,
    tags: ["Art", "Gallery", "Contemporary", "African Art", "Culture"],
    ticket_types: [
      { id: "t6", name: "Opening Night", price: 20, description: "Access to opening night reception with palm wine and small chops", available: 44, max_per_order: 4 },
      { id: "t7", name: "Collector Preview", price: 100, description: "Early access, artist meet & greet, exhibition catalog", available: 10, max_per_order: 2 },
    ],
  },
  {
    id: "4",
    title: "Savanna Sunrise Wellness Retreat",
    description:
      "A transformative sunrise experience in the Kenyan highlands. Guided yoga, meditation, and breathwork sessions overlooking the Maasai Mara. Led by wellness practitioner Amina Osei, this retreat blends African healing traditions with modern mindfulness.",
    date: "2026-04-20",
    time: "5:30 AM",
    location: "Maasai Mara Conservancy, Kenya",
    image_url: eventAfroWellness,
    category: "Hobbies",
    organizer: "Ubuntu Wellness",
    capacity: 40,
    tickets_sold: 28,
    is_online: false,
    tags: ["Yoga", "Wellness", "Nature", "Retreat", "Kenya"],
    ticket_types: [
      { id: "t8", name: "Day Pass", price: 60, description: "Morning session with guided meditation and bush breakfast", available: 12, max_per_order: 2 },
      { id: "t9", name: "Full Retreat (3 Days)", price: 350, description: "All sessions, accommodation, meals, and safari walk", available: 6, max_per_order: 1 },
    ],
    schedule: [
      { time: "5:30 AM", title: "Sunrise Meditation" },
      { time: "6:15 AM", title: "Vinyasa Flow Yoga", speaker: "Amina Osei" },
      { time: "7:30 AM", title: "Breathwork & Sound Healing with African Drums" },
      { time: "8:30 AM", title: "Bush Breakfast & Herbal Tea Ceremony" },
    ],
  },
];
