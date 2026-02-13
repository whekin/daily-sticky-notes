export type Json = string | number | boolean | null | { [key: string]: Json } | Json[];

export interface Database {
  public: {
    Tables: {
      gift_events: {
        Row: {
          created_at: string;
          event_type: string;
          gift_id: string | null;
          id: string;
          payload: Json;
        };
        Insert: {
          created_at?: string;
          event_type: string;
          gift_id?: string | null;
          id?: string;
          payload: Json;
        };
        Update: {
          created_at?: string;
          event_type?: string;
          gift_id?: string | null;
          id?: string;
          payload?: Json;
        };
      };
      gift_notes: {
        Row: {
          body: string;
          created_at: string;
          day_index: number;
          gift_id: string;
          id: string;
          image_url: string | null;
        };
        Insert: {
          body: string;
          created_at?: string;
          day_index: number;
          gift_id: string;
          id?: string;
          image_url?: string | null;
        };
        Update: {
          body?: string;
          created_at?: string;
          day_index?: number;
          gift_id?: string;
          id?: string;
          image_url?: string | null;
        };
      };
      gift_settings: {
        Row: {
          created_at: string;
          id: string;
          slug: string;
          start_date: string;
          title: string;
          unlock_hour: number;
        };
        Insert: {
          created_at?: string;
          id?: string;
          slug: string;
          start_date: string;
          title: string;
          unlock_hour?: number;
        };
        Update: {
          created_at?: string;
          id?: string;
          slug?: string;
          start_date?: string;
          title?: string;
          unlock_hour?: number;
        };
      };
    };
    Functions: {
      rpc_get_today_note: {
        Args: { p_slug: string; p_tz: string };
        Returns: {
          body: string;
          created_at: string;
          day_index: number;
          id: string;
          image_url: string | null;
        }[];
      };
      rpc_get_unlock_context: {
        Args: { p_slug: string; p_tz: string };
        Returns: {
          day_index: number;
          is_complete: boolean;
          start_date: string;
          total_count: number;
          unlock_hour: number;
          unlocked_count: number;
        }[];
      };
      rpc_get_unlocked_notes: {
        Args: { p_slug: string; p_tz: string };
        Returns: {
          body: string;
          created_at: string;
          day_index: number;
          id: string;
          image_url: string | null;
        }[];
      };
    };
  };
}
