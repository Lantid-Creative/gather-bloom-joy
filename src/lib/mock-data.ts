import type { Event } from "./types";
import eventConference from "@/assets/event-conference.jpg";
import eventFood from "@/assets/event-food.jpg";
import eventArt from "@/assets/event-art.jpg";
import eventWellness from "@/assets/event-wellness.jpg";

export const mockEvents: Event[] = [
  {
    id: "1",
    title: "Future of AI Summit 2026",
    description:
      "Join world-leading AI researchers and industry pioneers for a two-day exploration of artificial intelligence breakthroughs. Featuring keynotes, hands-on workshops, and networking with 500+ professionals shaping the future of technology.",
    date: "2026-04-15",
    end_date: "2026-04-16",
    time: "9:00 AM",
    location: "Moscone Center, San Francisco, CA",
    image_url: eventConference,
    category: "Business",
    organizer: "TechForward Inc.",
    capacity: 500,
    tickets_sold: 342,
    is_online: false,
    tags: ["AI", "Machine Learning", "Technology", "Conference"],
    ticket_types: [
      { id: "t1", name: "General Admission", price: 149, description: "Access to all keynotes and exhibition hall", available: 158, max_per_order: 5 },
      { id: "t2", name: "VIP Pass", price: 399, description: "Priority seating, speaker dinner, and exclusive workshops", available: 23, max_per_order: 2 },
      { id: "t3", name: "Student", price: 49, description: "Valid student ID required at check-in", available: 75, max_per_order: 1 },
    ],
    schedule: [
      { time: "9:00 AM", title: "Doors Open & Registration" },
      { time: "10:00 AM", title: "Opening Keynote: The Next Frontier", speaker: "Dr. Sarah Chen" },
      { time: "11:30 AM", title: "Workshop: Building with LLMs" },
      { time: "1:00 PM", title: "Lunch & Networking" },
      { time: "2:30 PM", title: "Panel: Ethics in AI" },
      { time: "4:00 PM", title: "Closing Remarks & Happy Hour" },
    ],
  },
  {
    id: "2",
    title: "Artisan Food & Wine Festival",
    description:
      "A curated evening celebrating local artisan food producers and winemakers. Taste over 50 wines, enjoy live cooking demonstrations, and savor dishes from 15 acclaimed chefs — all under the stars.",
    date: "2026-05-02",
    time: "5:00 PM",
    location: "Napa Valley Estate, California",
    image_url: eventFood,
    category: "Food & Drink",
    organizer: "Culinary Collective",
    capacity: 300,
    tickets_sold: 210,
    is_online: false,
    tags: ["Food", "Wine", "Outdoor", "Festival"],
    ticket_types: [
      { id: "t4", name: "Tasting Pass", price: 85, description: "Unlimited tastings from all vendors", available: 90, max_per_order: 4 },
      { id: "t5", name: "Premium Experience", price: 195, description: "Chef's table dinner + all tastings + wine pairing masterclass", available: 15, max_per_order: 2 },
    ],
    schedule: [
      { time: "5:00 PM", title: "Gates Open" },
      { time: "5:30 PM", title: "Welcome Toast" },
      { time: "6:00 PM", title: "Live Cooking Demo: Chef Marco Rossi" },
      { time: "7:30 PM", title: "Wine Pairing Masterclass" },
      { time: "9:00 PM", title: "Live Music & Dessert" },
    ],
  },
  {
    id: "3",
    title: "Contemporary Art Exhibition Opening",
    description:
      "An exclusive opening night for 'Perspectives' — a groundbreaking exhibition featuring works from 12 emerging contemporary artists exploring identity, technology, and nature.",
    date: "2026-04-28",
    time: "7:00 PM",
    location: "Gallery Modern, New York, NY",
    image_url: eventArt,
    category: "Performing & Visual Arts",
    organizer: "Gallery Modern",
    capacity: 200,
    tickets_sold: 156,
    is_online: false,
    tags: ["Art", "Gallery", "Contemporary", "Exhibition"],
    ticket_types: [
      { id: "t6", name: "Opening Night", price: 35, description: "Access to opening night reception with complimentary drinks", available: 44, max_per_order: 4 },
      { id: "t7", name: "Collector Preview", price: 150, description: "Early access, artist meet & greet, exhibition catalog", available: 8, max_per_order: 2 },
    ],
  },
  {
    id: "4",
    title: "Sunrise Wellness Retreat",
    description:
      "A transformative morning of yoga, meditation, and mindful movement in a stunning garden setting. Led by internationally renowned wellness instructor Maya Johnson.",
    date: "2026-04-20",
    time: "6:00 AM",
    location: "Botanical Gardens, Austin, TX",
    image_url: eventWellness,
    category: "Hobbies",
    organizer: "MindBody Co.",
    capacity: 60,
    tickets_sold: 45,
    is_online: false,
    tags: ["Yoga", "Meditation", "Wellness", "Outdoor"],
    ticket_types: [
      { id: "t8", name: "Single Session", price: 45, description: "One morning session with guided meditation", available: 15, max_per_order: 2 },
      { id: "t9", name: "Full Retreat", price: 120, description: "All sessions + organic brunch + wellness goodie bag", available: 8, max_per_order: 1 },
    ],
    schedule: [
      { time: "6:00 AM", title: "Sunrise Meditation" },
      { time: "6:45 AM", title: "Vinyasa Flow Yoga", speaker: "Maya Johnson" },
      { time: "8:00 AM", title: "Breathwork & Sound Healing" },
      { time: "9:00 AM", title: "Organic Brunch" },
    ],
  },
];
