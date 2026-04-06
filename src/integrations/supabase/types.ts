export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      attendee_check_ins: {
        Row: {
          checked_in_at: string
          checked_in_by: string
          id: string
          order_item_id: string
        }
        Insert: {
          checked_in_at?: string
          checked_in_by: string
          id?: string
          order_item_id: string
        }
        Update: {
          checked_in_at?: string
          checked_in_by?: string
          id?: string
          order_item_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "attendee_check_ins_order_item_id_fkey"
            columns: ["order_item_id"]
            isOneToOne: false
            referencedRelation: "order_items"
            referencedColumns: ["id"]
          },
        ]
      }
      dp_templates: {
        Row: {
          created_at: string
          event_id: string
          id: string
          is_active: boolean
          is_preset: boolean
          name: string
          photo_height: number
          photo_shape: string
          photo_width: number
          photo_x: number
          photo_y: number
          template_image_url: string
          user_id: string
        }
        Insert: {
          created_at?: string
          event_id: string
          id?: string
          is_active?: boolean
          is_preset?: boolean
          name?: string
          photo_height?: number
          photo_shape?: string
          photo_width?: number
          photo_x?: number
          photo_y?: number
          template_image_url?: string
          user_id: string
        }
        Update: {
          created_at?: string
          event_id?: string
          id?: string
          is_active?: boolean
          is_preset?: boolean
          name?: string
          photo_height?: number
          photo_shape?: string
          photo_width?: number
          photo_x?: number
          photo_y?: number
          template_image_url?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "dp_templates_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      email_send_log: {
        Row: {
          created_at: string
          error_message: string | null
          id: string
          message_id: string | null
          metadata: Json | null
          recipient_email: string
          status: string
          template_name: string
        }
        Insert: {
          created_at?: string
          error_message?: string | null
          id?: string
          message_id?: string | null
          metadata?: Json | null
          recipient_email: string
          status: string
          template_name: string
        }
        Update: {
          created_at?: string
          error_message?: string | null
          id?: string
          message_id?: string | null
          metadata?: Json | null
          recipient_email?: string
          status?: string
          template_name?: string
        }
        Relationships: []
      }
      email_send_state: {
        Row: {
          auth_email_ttl_minutes: number
          batch_size: number
          id: number
          retry_after_until: string | null
          send_delay_ms: number
          transactional_email_ttl_minutes: number
          updated_at: string
        }
        Insert: {
          auth_email_ttl_minutes?: number
          batch_size?: number
          id?: number
          retry_after_until?: string | null
          send_delay_ms?: number
          transactional_email_ttl_minutes?: number
          updated_at?: string
        }
        Update: {
          auth_email_ttl_minutes?: number
          batch_size?: number
          id?: number
          retry_after_until?: string | null
          send_delay_ms?: number
          transactional_email_ttl_minutes?: number
          updated_at?: string
        }
        Relationships: []
      }
      email_unsubscribe_tokens: {
        Row: {
          created_at: string
          email: string
          id: string
          token: string
          used_at: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          token: string
          used_at?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          token?: string
          used_at?: string | null
        }
        Relationships: []
      }
      event_addons: {
        Row: {
          available: number
          created_at: string
          description: string
          event_id: string
          id: string
          name: string
          price: number
        }
        Insert: {
          available?: number
          created_at?: string
          description?: string
          event_id: string
          id?: string
          name: string
          price?: number
        }
        Update: {
          available?: number
          created_at?: string
          description?: string
          event_id?: string
          id?: string
          name?: string
          price?: number
        }
        Relationships: [
          {
            foreignKeyName: "event_addons_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      event_ads: {
        Row: {
          clicks: number
          conversions: number
          cost_per_click: number
          created_at: string
          daily_budget: number
          end_date: string | null
          event_id: string
          id: string
          impressions: number
          placements: string[]
          spent: number
          start_date: string
          status: string
          title: string
          total_budget: number
          updated_at: string
          user_id: string
        }
        Insert: {
          clicks?: number
          conversions?: number
          cost_per_click?: number
          created_at?: string
          daily_budget?: number
          end_date?: string | null
          event_id: string
          id?: string
          impressions?: number
          placements?: string[]
          spent?: number
          start_date?: string
          status?: string
          title?: string
          total_budget?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          clicks?: number
          conversions?: number
          cost_per_click?: number
          created_at?: string
          daily_budget?: number
          end_date?: string | null
          event_id?: string
          id?: string
          impressions?: number
          placements?: string[]
          spent?: number
          start_date?: string
          status?: string
          title?: string
          total_budget?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_ads_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      event_collection_items: {
        Row: {
          collection_id: string
          event_id: string
          id: string
          sort_order: number
        }
        Insert: {
          collection_id: string
          event_id: string
          id?: string
          sort_order?: number
        }
        Update: {
          collection_id?: string
          event_id?: string
          id?: string
          sort_order?: number
        }
        Relationships: [
          {
            foreignKeyName: "event_collection_items_collection_id_fkey"
            columns: ["collection_id"]
            isOneToOne: false
            referencedRelation: "event_collections"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_collection_items_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      event_collections: {
        Row: {
          created_at: string
          description: string
          id: string
          name: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string
          id?: string
          name: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string
          id?: string
          name?: string
          user_id?: string
        }
        Relationships: []
      }
      event_favorites: {
        Row: {
          created_at: string
          event_id: string
          id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          event_id: string
          id?: string
          user_id: string
        }
        Update: {
          created_at?: string
          event_id?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_favorites_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      event_feedback: {
        Row: {
          comment: string
          created_at: string
          event_id: string
          id: string
          rating: number
          user_id: string
        }
        Insert: {
          comment?: string
          created_at?: string
          event_id: string
          id?: string
          rating?: number
          user_id: string
        }
        Update: {
          comment?: string
          created_at?: string
          event_id?: string
          id?: string
          rating?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_feedback_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      event_lineup_artists: {
        Row: {
          apple_music_url: string
          bio: string
          created_at: string
          event_id: string
          genre: string
          headliner: boolean
          id: string
          instagram_url: string
          name: string
          photo_url: string
          set_end_time: string
          set_time: string
          sort_order: number
          soundcloud_embed_url: string
          soundcloud_url: string
          spotify_embed_url: string
          spotify_url: string
          stage: string
          twitter_url: string
          website_url: string
        }
        Insert: {
          apple_music_url?: string
          bio?: string
          created_at?: string
          event_id: string
          genre?: string
          headliner?: boolean
          id?: string
          instagram_url?: string
          name: string
          photo_url?: string
          set_end_time?: string
          set_time?: string
          sort_order?: number
          soundcloud_embed_url?: string
          soundcloud_url?: string
          spotify_embed_url?: string
          spotify_url?: string
          stage?: string
          twitter_url?: string
          website_url?: string
        }
        Update: {
          apple_music_url?: string
          bio?: string
          created_at?: string
          event_id?: string
          genre?: string
          headliner?: boolean
          id?: string
          instagram_url?: string
          name?: string
          photo_url?: string
          set_end_time?: string
          set_time?: string
          sort_order?: number
          soundcloud_embed_url?: string
          soundcloud_url?: string
          spotify_embed_url?: string
          spotify_url?: string
          stage?: string
          twitter_url?: string
          website_url?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_lineup_artists_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      event_time_slots: {
        Row: {
          booked: number
          capacity: number
          created_at: string
          end_time: string
          event_id: string
          id: string
          is_active: boolean
          label: string
          sort_order: number
          start_time: string
        }
        Insert: {
          booked?: number
          capacity?: number
          created_at?: string
          end_time: string
          event_id: string
          id?: string
          is_active?: boolean
          label?: string
          sort_order?: number
          start_time: string
        }
        Update: {
          booked?: number
          capacity?: number
          created_at?: string
          end_time?: string
          event_id?: string
          id?: string
          is_active?: boolean
          label?: string
          sort_order?: number
          start_time?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_time_slots_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      events: {
        Row: {
          capacity: number
          category: string
          created_at: string
          currency: string
          date: string
          description: string
          end_date: string | null
          extra_images: string[]
          id: string
          image_url: string
          is_online: boolean
          location: string
          meeting_platform: string
          meeting_url: string
          organizer: string
          parent_event_id: string | null
          recurrence_end_date: string | null
          recurrence_type: string
          seeking_sponsors: boolean
          sponsor_description: string
          status: string
          tags: string[]
          tickets_sold: number
          time: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          capacity?: number
          category?: string
          created_at?: string
          currency?: string
          date: string
          description?: string
          end_date?: string | null
          extra_images?: string[]
          id?: string
          image_url?: string
          is_online?: boolean
          location?: string
          meeting_platform?: string
          meeting_url?: string
          organizer?: string
          parent_event_id?: string | null
          recurrence_end_date?: string | null
          recurrence_type?: string
          seeking_sponsors?: boolean
          sponsor_description?: string
          status?: string
          tags?: string[]
          tickets_sold?: number
          time?: string
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          capacity?: number
          category?: string
          created_at?: string
          currency?: string
          date?: string
          description?: string
          end_date?: string | null
          extra_images?: string[]
          id?: string
          image_url?: string
          is_online?: boolean
          location?: string
          meeting_platform?: string
          meeting_url?: string
          organizer?: string
          parent_event_id?: string | null
          recurrence_end_date?: string | null
          recurrence_type?: string
          seeking_sponsors?: boolean
          sponsor_description?: string
          status?: string
          tags?: string[]
          tickets_sold?: number
          time?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "events_parent_event_id_fkey"
            columns: ["parent_event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      flash_sales: {
        Row: {
          applies_to_ticket_ids: string[]
          created_at: string
          discount_type: string
          discount_value: number
          ends_at: string
          event_id: string
          id: string
          is_active: boolean
          max_uses: number | null
          name: string
          starts_at: string
          used_count: number
        }
        Insert: {
          applies_to_ticket_ids?: string[]
          created_at?: string
          discount_type?: string
          discount_value?: number
          ends_at: string
          event_id: string
          id?: string
          is_active?: boolean
          max_uses?: number | null
          name: string
          starts_at: string
          used_count?: number
        }
        Update: {
          applies_to_ticket_ids?: string[]
          created_at?: string
          discount_type?: string
          discount_value?: number
          ends_at?: string
          event_id?: string
          id?: string
          is_active?: boolean
          max_uses?: number | null
          name?: string
          starts_at?: string
          used_count?: number
        }
        Relationships: [
          {
            foreignKeyName: "flash_sales_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      influencer_orders: {
        Row: {
          amount: number
          client_approved: boolean
          client_id: string
          created_at: string
          deadline: string | null
          deliverables_note: string | null
          deliverables_url: string | null
          description: string
          escrow_status: string
          id: string
          influencer_id: string
          influencer_submitted: boolean
          service_id: string | null
          status: string
          stripe_payment_intent_id: string | null
          title: string
          updated_at: string
        }
        Insert: {
          amount?: number
          client_approved?: boolean
          client_id: string
          created_at?: string
          deadline?: string | null
          deliverables_note?: string | null
          deliverables_url?: string | null
          description?: string
          escrow_status?: string
          id?: string
          influencer_id: string
          influencer_submitted?: boolean
          service_id?: string | null
          status?: string
          stripe_payment_intent_id?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          amount?: number
          client_approved?: boolean
          client_id?: string
          created_at?: string
          deadline?: string | null
          deliverables_note?: string | null
          deliverables_url?: string | null
          description?: string
          escrow_status?: string
          id?: string
          influencer_id?: string
          influencer_submitted?: boolean
          service_id?: string | null
          status?: string
          stripe_payment_intent_id?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "influencer_orders_influencer_id_fkey"
            columns: ["influencer_id"]
            isOneToOne: false
            referencedRelation: "influencer_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "influencer_orders_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "influencer_services"
            referencedColumns: ["id"]
          },
        ]
      }
      influencer_profiles: {
        Row: {
          avatar_url: string | null
          avg_rating: number
          bio: string
          categories: string[]
          city: string
          country: string
          created_at: string
          display_name: string
          facebook_followers: number | null
          facebook_url: string | null
          hourly_rate: number | null
          id: string
          instagram_followers: number | null
          instagram_url: string | null
          is_available: boolean
          linkedin_followers: number | null
          linkedin_url: string | null
          min_budget: number | null
          proof_screenshots: string[]
          region: string
          tiktok_followers: number | null
          tiktok_url: string | null
          total_jobs: number
          twitter_followers: number | null
          twitter_url: string | null
          updated_at: string
          user_id: string
          youtube_subscribers: number | null
          youtube_url: string | null
        }
        Insert: {
          avatar_url?: string | null
          avg_rating?: number
          bio?: string
          categories?: string[]
          city?: string
          country?: string
          created_at?: string
          display_name: string
          facebook_followers?: number | null
          facebook_url?: string | null
          hourly_rate?: number | null
          id?: string
          instagram_followers?: number | null
          instagram_url?: string | null
          is_available?: boolean
          linkedin_followers?: number | null
          linkedin_url?: string | null
          min_budget?: number | null
          proof_screenshots?: string[]
          region?: string
          tiktok_followers?: number | null
          tiktok_url?: string | null
          total_jobs?: number
          twitter_followers?: number | null
          twitter_url?: string | null
          updated_at?: string
          user_id: string
          youtube_subscribers?: number | null
          youtube_url?: string | null
        }
        Update: {
          avatar_url?: string | null
          avg_rating?: number
          bio?: string
          categories?: string[]
          city?: string
          country?: string
          created_at?: string
          display_name?: string
          facebook_followers?: number | null
          facebook_url?: string | null
          hourly_rate?: number | null
          id?: string
          instagram_followers?: number | null
          instagram_url?: string | null
          is_available?: boolean
          linkedin_followers?: number | null
          linkedin_url?: string | null
          min_budget?: number | null
          proof_screenshots?: string[]
          region?: string
          tiktok_followers?: number | null
          tiktok_url?: string | null
          total_jobs?: number
          twitter_followers?: number | null
          twitter_url?: string | null
          updated_at?: string
          user_id?: string
          youtube_subscribers?: number | null
          youtube_url?: string | null
        }
        Relationships: []
      }
      influencer_reviews: {
        Row: {
          comment: string
          created_at: string
          id: string
          influencer_id: string
          order_id: string
          rating: number
          reviewer_id: string
        }
        Insert: {
          comment?: string
          created_at?: string
          id?: string
          influencer_id: string
          order_id: string
          rating?: number
          reviewer_id: string
        }
        Update: {
          comment?: string
          created_at?: string
          id?: string
          influencer_id?: string
          order_id?: string
          rating?: number
          reviewer_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "influencer_reviews_influencer_id_fkey"
            columns: ["influencer_id"]
            isOneToOne: false
            referencedRelation: "influencer_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "influencer_reviews_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: true
            referencedRelation: "influencer_orders"
            referencedColumns: ["id"]
          },
        ]
      }
      influencer_services: {
        Row: {
          category: string
          created_at: string
          delivery_days: number
          description: string
          id: string
          influencer_id: string
          is_active: boolean
          price: number
          title: string
        }
        Insert: {
          category?: string
          created_at?: string
          delivery_days?: number
          description?: string
          id?: string
          influencer_id: string
          is_active?: boolean
          price?: number
          title: string
        }
        Update: {
          category?: string
          created_at?: string
          delivery_days?: number
          description?: string
          id?: string
          influencer_id?: string
          is_active?: boolean
          price?: number
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "influencer_services_influencer_id_fkey"
            columns: ["influencer_id"]
            isOneToOne: false
            referencedRelation: "influencer_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string
          id: string
          link: string | null
          message: string
          read: boolean
          title: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          link?: string | null
          message?: string
          read?: boolean
          title: string
          type?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          link?: string | null
          message?: string
          read?: boolean
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      order_items: {
        Row: {
          created_at: string
          event_id: string
          event_title: string
          id: string
          order_id: string
          quantity: number
          ticket_name: string
          ticket_price: number
          ticket_type_id: string
          time_slot_id: string | null
          time_slot_label: string | null
        }
        Insert: {
          created_at?: string
          event_id: string
          event_title: string
          id?: string
          order_id: string
          quantity: number
          ticket_name: string
          ticket_price: number
          ticket_type_id: string
          time_slot_id?: string | null
          time_slot_label?: string | null
        }
        Update: {
          created_at?: string
          event_id?: string
          event_title?: string
          id?: string
          order_id?: string
          quantity?: number
          ticket_name?: string
          ticket_price?: number
          ticket_type_id?: string
          time_slot_id?: string | null
          time_slot_label?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "order_items_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_ticket_type_id_fkey"
            columns: ["ticket_type_id"]
            isOneToOne: false
            referencedRelation: "ticket_types"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_time_slot_id_fkey"
            columns: ["time_slot_id"]
            isOneToOne: false
            referencedRelation: "event_time_slots"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          created_at: string
          customer_email: string
          customer_name: string
          id: string
          status: string
          stripe_session_id: string | null
          total: number
          user_id: string
        }
        Insert: {
          created_at?: string
          customer_email: string
          customer_name: string
          id?: string
          status?: string
          stripe_session_id?: string | null
          total?: number
          user_id: string
        }
        Update: {
          created_at?: string
          customer_email?: string
          customer_name?: string
          id?: string
          status?: string
          stripe_session_id?: string | null
          total?: number
          user_id?: string
        }
        Relationships: []
      }
      organizer_followers: {
        Row: {
          created_at: string
          follower_id: string
          id: string
          organizer_id: string
        }
        Insert: {
          created_at?: string
          follower_id: string
          id?: string
          organizer_id: string
        }
        Update: {
          created_at?: string
          follower_id?: string
          id?: string
          organizer_id?: string
        }
        Relationships: []
      }
      organizer_wallets: {
        Row: {
          account_name: string
          account_number: string
          available_balance: number
          bank_code: string
          bank_name: string
          id: string
          pending_balance: number
          total_earned: number
          total_withdrawn: number
          updated_at: string
          user_id: string
        }
        Insert: {
          account_name?: string
          account_number?: string
          available_balance?: number
          bank_code?: string
          bank_name?: string
          id?: string
          pending_balance?: number
          total_earned?: number
          total_withdrawn?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          account_name?: string
          account_number?: string
          available_balance?: number
          bank_code?: string
          bank_name?: string
          id?: string
          pending_balance?: number
          total_earned?: number
          total_withdrawn?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      partner_profiles: {
        Row: {
          company_logo_url: string | null
          company_name: string
          created_at: string
          description: string | null
          id: string
          industry: string | null
          updated_at: string
          user_id: string
          website: string | null
        }
        Insert: {
          company_logo_url?: string | null
          company_name: string
          created_at?: string
          description?: string | null
          id?: string
          industry?: string | null
          updated_at?: string
          user_id: string
          website?: string | null
        }
        Update: {
          company_logo_url?: string | null
          company_name?: string
          created_at?: string
          description?: string | null
          id?: string
          industry?: string | null
          updated_at?: string
          user_id?: string
          website?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string
          full_name: string | null
          id: string
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          full_name?: string | null
          id: string
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      promo_codes: {
        Row: {
          code: string
          created_at: string
          discount_type: string
          discount_value: number
          event_id: string
          expires_at: string | null
          id: string
          usage_limit: number | null
          used_count: number
        }
        Insert: {
          code: string
          created_at?: string
          discount_type?: string
          discount_value?: number
          event_id: string
          expires_at?: string | null
          id?: string
          usage_limit?: number | null
          used_count?: number
        }
        Update: {
          code?: string
          created_at?: string
          discount_type?: string
          discount_value?: number
          event_id?: string
          expires_at?: string | null
          id?: string
          usage_limit?: number | null
          used_count?: number
        }
        Relationships: [
          {
            foreignKeyName: "promo_codes_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      referral_conversions: {
        Row: {
          commission_amount: number
          created_at: string
          id: string
          order_id: string
          referral_link_id: string
          status: string
        }
        Insert: {
          commission_amount?: number
          created_at?: string
          id?: string
          order_id: string
          referral_link_id: string
          status?: string
        }
        Update: {
          commission_amount?: number
          created_at?: string
          id?: string
          order_id?: string
          referral_link_id?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "referral_conversions_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "referral_conversions_referral_link_id_fkey"
            columns: ["referral_link_id"]
            isOneToOne: false
            referencedRelation: "referral_links"
            referencedColumns: ["id"]
          },
        ]
      }
      referral_links: {
        Row: {
          clicks: number
          code: string
          conversions: number
          created_at: string
          id: string
          program_id: string
          referrer_id: string
          total_earned: number
        }
        Insert: {
          clicks?: number
          code: string
          conversions?: number
          created_at?: string
          id?: string
          program_id: string
          referrer_id: string
          total_earned?: number
        }
        Update: {
          clicks?: number
          code?: string
          conversions?: number
          created_at?: string
          id?: string
          program_id?: string
          referrer_id?: string
          total_earned?: number
        }
        Relationships: [
          {
            foreignKeyName: "referral_links_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "referral_programs"
            referencedColumns: ["id"]
          },
        ]
      }
      referral_programs: {
        Row: {
          commission_type: string
          commission_value: number
          created_at: string
          event_id: string
          id: string
          is_active: boolean
        }
        Insert: {
          commission_type?: string
          commission_value?: number
          created_at?: string
          event_id: string
          id?: string
          is_active?: boolean
        }
        Update: {
          commission_type?: string
          commission_value?: number
          created_at?: string
          event_id?: string
          id?: string
          is_active?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "referral_programs_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: true
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      refund_requests: {
        Row: {
          created_at: string
          id: string
          order_id: string
          reason: string
          resolved_at: string | null
          status: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          order_id: string
          reason?: string
          resolved_at?: string | null
          status?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          order_id?: string
          reason?: string
          resolved_at?: string | null
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "refund_requests_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      schedule_items: {
        Row: {
          created_at: string
          description: string | null
          event_id: string
          id: string
          sort_order: number
          speaker: string | null
          time: string
          title: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          event_id: string
          id?: string
          sort_order?: number
          speaker?: string | null
          time: string
          title: string
        }
        Update: {
          created_at?: string
          description?: string | null
          event_id?: string
          id?: string
          sort_order?: number
          speaker?: string | null
          time?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "schedule_items_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      scheduled_posts: {
        Row: {
          content: string
          created_at: string
          error_message: string | null
          event_id: string
          id: string
          platform: string
          posted_at: string | null
          scheduled_at: string
          status: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          error_message?: string | null
          event_id: string
          id?: string
          platform: string
          posted_at?: string | null
          scheduled_at: string
          status?: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          error_message?: string | null
          event_id?: string
          id?: string
          platform?: string
          posted_at?: string | null
          scheduled_at?: string
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "scheduled_posts_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      sponsorship_requests: {
        Row: {
          created_at: string
          custom_offer_amount: number | null
          custom_offer_benefits: string | null
          event_id: string
          id: string
          message: string | null
          partner_id: string
          payment_status: string
          status: string
          stripe_session_id: string | null
          tier_id: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          custom_offer_amount?: number | null
          custom_offer_benefits?: string | null
          event_id: string
          id?: string
          message?: string | null
          partner_id: string
          payment_status?: string
          status?: string
          stripe_session_id?: string | null
          tier_id?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          custom_offer_amount?: number | null
          custom_offer_benefits?: string | null
          event_id?: string
          id?: string
          message?: string | null
          partner_id?: string
          payment_status?: string
          status?: string
          stripe_session_id?: string | null
          tier_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "sponsorship_requests_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sponsorship_requests_tier_id_fkey"
            columns: ["tier_id"]
            isOneToOne: false
            referencedRelation: "sponsorship_tiers"
            referencedColumns: ["id"]
          },
        ]
      }
      sponsorship_tiers: {
        Row: {
          benefits: string[]
          created_at: string
          currency: string
          event_id: string
          id: string
          max_sponsors: number | null
          name: string
          price: number
          sort_order: number
          sponsors_count: number
        }
        Insert: {
          benefits?: string[]
          created_at?: string
          currency?: string
          event_id: string
          id?: string
          max_sponsors?: number | null
          name: string
          price?: number
          sort_order?: number
          sponsors_count?: number
        }
        Update: {
          benefits?: string[]
          created_at?: string
          currency?: string
          event_id?: string
          id?: string
          max_sponsors?: number | null
          name?: string
          price?: number
          sort_order?: number
          sponsors_count?: number
        }
        Relationships: [
          {
            foreignKeyName: "sponsorship_tiers_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      suppressed_emails: {
        Row: {
          created_at: string
          email: string
          id: string
          metadata: Json | null
          reason: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          metadata?: Json | null
          reason: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          metadata?: Json | null
          reason?: string
        }
        Relationships: []
      }
      ticket_types: {
        Row: {
          access_code: string | null
          available: number
          created_at: string
          description: string
          event_id: string
          id: string
          is_donation: boolean
          is_hidden: boolean
          max_per_order: number
          min_price: number
          name: string
          price: number
          sales_end: string | null
          sales_start: string | null
        }
        Insert: {
          access_code?: string | null
          available?: number
          created_at?: string
          description?: string
          event_id: string
          id?: string
          is_donation?: boolean
          is_hidden?: boolean
          max_per_order?: number
          min_price?: number
          name: string
          price?: number
          sales_end?: string | null
          sales_start?: string | null
        }
        Update: {
          access_code?: string | null
          available?: number
          created_at?: string
          description?: string
          event_id?: string
          id?: string
          is_donation?: boolean
          is_hidden?: boolean
          max_per_order?: number
          min_price?: number
          name?: string
          price?: number
          sales_end?: string | null
          sales_start?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ticket_types_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      tracking_links: {
        Row: {
          clicks: number
          code: string
          created_at: string
          event_id: string
          id: string
          label: string
        }
        Insert: {
          clicks?: number
          code: string
          created_at?: string
          event_id: string
          id?: string
          label?: string
        }
        Update: {
          clicks?: number
          code?: string
          created_at?: string
          event_id?: string
          id?: string
          label?: string
        }
        Relationships: [
          {
            foreignKeyName: "tracking_links_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      waitlist_entries: {
        Row: {
          created_at: string
          email: string
          event_id: string
          id: string
          status: string
          user_id: string
        }
        Insert: {
          created_at?: string
          email: string
          event_id: string
          id?: string
          status?: string
          user_id: string
        }
        Update: {
          created_at?: string
          email?: string
          event_id?: string
          id?: string
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "waitlist_entries_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      wallet_transactions: {
        Row: {
          amount: number
          available_at: string
          created_at: string
          description: string
          fee_amount: number
          id: string
          net_amount: number
          order_id: string | null
          status: string
          type: string
          user_id: string
          wallet_id: string
        }
        Insert: {
          amount?: number
          available_at?: string
          created_at?: string
          description?: string
          fee_amount?: number
          id?: string
          net_amount?: number
          order_id?: string | null
          status?: string
          type?: string
          user_id: string
          wallet_id: string
        }
        Update: {
          amount?: number
          available_at?: string
          created_at?: string
          description?: string
          fee_amount?: number
          id?: string
          net_amount?: number
          order_id?: string | null
          status?: string
          type?: string
          user_id?: string
          wallet_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "wallet_transactions_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "wallet_transactions_wallet_id_fkey"
            columns: ["wallet_id"]
            isOneToOne: false
            referencedRelation: "organizer_wallets"
            referencedColumns: ["id"]
          },
        ]
      }
      withdrawal_requests: {
        Row: {
          account_name: string
          account_number: string
          admin_note: string
          amount: number
          bank_code: string
          bank_name: string
          created_at: string
          id: string
          processed_at: string | null
          processed_by: string | null
          status: string
          user_id: string
          wallet_id: string
        }
        Insert: {
          account_name?: string
          account_number?: string
          admin_note?: string
          amount: number
          bank_code?: string
          bank_name?: string
          created_at?: string
          id?: string
          processed_at?: string | null
          processed_by?: string | null
          status?: string
          user_id: string
          wallet_id: string
        }
        Update: {
          account_name?: string
          account_number?: string
          admin_note?: string
          amount?: number
          bank_code?: string
          bank_name?: string
          created_at?: string
          id?: string
          processed_at?: string | null
          processed_by?: string | null
          status?: string
          user_id?: string
          wallet_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "withdrawal_requests_wallet_id_fkey"
            columns: ["wallet_id"]
            isOneToOne: false
            referencedRelation: "organizer_wallets"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      delete_email: {
        Args: { message_id: number; queue_name: string }
        Returns: boolean
      }
      enqueue_email: {
        Args: { payload: Json; queue_name: string }
        Returns: number
      }
      get_active_flash_sale: {
        Args: { p_event_id: string; p_ticket_type_id: string }
        Returns: {
          discount_type: string
          discount_value: number
          sale_name: string
        }[]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_admin: { Args: never; Returns: boolean }
      is_event_organizer_for_order: {
        Args: { p_order_id: string }
        Returns: boolean
      }
      move_to_dlq: {
        Args: {
          dlq_name: string
          message_id: number
          payload: Json
          source_queue: string
        }
        Returns: number
      }
      read_email_batch: {
        Args: { batch_size: number; queue_name: string; vt: number }
        Returns: {
          message: Json
          msg_id: number
          read_ct: number
        }[]
      }
      record_ad_click: { Args: { p_ad_id: string }; Returns: undefined }
      record_ad_impression: { Args: { p_ad_id: string }; Returns: undefined }
      release_pending_funds: { Args: never; Returns: undefined }
      track_link_click: {
        Args: { p_code: string; p_event_id: string }
        Returns: undefined
      }
      track_referral_click: { Args: { p_code: string }; Returns: undefined }
      use_promo_code: {
        Args: { p_code: string; p_event_id: string }
        Returns: {
          discount_type: string
          discount_value: number
        }[]
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "moderator", "user"],
    },
  },
} as const
