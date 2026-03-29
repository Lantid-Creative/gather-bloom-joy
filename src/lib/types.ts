export interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  end_date?: string;
  time: string;
  location: string;
  image_url: string;
  category: string;
  organizer: string;
  capacity: number;
  tickets_sold: number;
  is_online: boolean;
  tags: string[];
  ticket_types: TicketType[];
  schedule?: ScheduleItem[];
}

export interface TicketType {
  id: string;
  name: string;
  price: number;
  description: string;
  available: number;
  max_per_order: number;
}

export interface ScheduleItem {
  time: string;
  title: string;
  description?: string;
  speaker?: string;
}

export interface CartItem {
  ticketType: TicketType;
  quantity: number;
  eventId: string;
  eventTitle: string;
  timeSlotId?: string;
  timeSlotLabel?: string;
}

export interface Order {
  id: string;
  items: CartItem[];
  total: number;
  email: string;
  name: string;
  created_at: string;
}
