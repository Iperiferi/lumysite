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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      accommodations: {
        Row: {
          business_id: string
          created_at: string
          description: string | null
          focal_point: string | null
          id: string
          image_url: string | null
          name: string
          sort_order: number | null
        }
        Insert: {
          business_id: string
          created_at?: string
          description?: string | null
          focal_point?: string | null
          id?: string
          image_url?: string | null
          name: string
          sort_order?: number | null
        }
        Update: {
          business_id?: string
          created_at?: string
          description?: string | null
          focal_point?: string | null
          id?: string
          image_url?: string | null
          name?: string
          sort_order?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "accommodations_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "accommodations_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses_public"
            referencedColumns: ["id"]
          },
        ]
      }
      businesses: {
        Row: {
          about_text: string | null
          accent_color: string | null
          address: string | null
          business_name: string
          created_at: string
          cta_text: string | null
          email: string | null
          facebook_url: string | null
          font_style: string | null
          google_maps_embed: string | null
          hero_focal_point: string | null
          hero_image_url: string | null
          id: string
          instagram_url: string | null
          is_published: boolean | null
          linkedin_url: string | null
          logo_url: string | null
          opening_hours: Json | null
          owner_id: string
          phone: string | null
          short_description: string | null
          subdomain: string
          tiktok_url: string | null
          updated_at: string
          youtube_url: string | null
        }
        Insert: {
          about_text?: string | null
          accent_color?: string | null
          address?: string | null
          business_name: string
          created_at?: string
          cta_text?: string | null
          email?: string | null
          facebook_url?: string | null
          font_style?: string | null
          google_maps_embed?: string | null
          hero_focal_point?: string | null
          hero_image_url?: string | null
          id?: string
          instagram_url?: string | null
          is_published?: boolean | null
          linkedin_url?: string | null
          logo_url?: string | null
          opening_hours?: Json | null
          owner_id: string
          phone?: string | null
          short_description?: string | null
          subdomain: string
          tiktok_url?: string | null
          updated_at?: string
          youtube_url?: string | null
        }
        Update: {
          about_text?: string | null
          accent_color?: string | null
          address?: string | null
          business_name?: string
          created_at?: string
          cta_text?: string | null
          email?: string | null
          facebook_url?: string | null
          font_style?: string | null
          google_maps_embed?: string | null
          hero_focal_point?: string | null
          hero_image_url?: string | null
          id?: string
          instagram_url?: string | null
          is_published?: boolean | null
          linkedin_url?: string | null
          logo_url?: string | null
          opening_hours?: Json | null
          owner_id?: string
          phone?: string | null
          short_description?: string | null
          subdomain?: string
          tiktok_url?: string | null
          updated_at?: string
          youtube_url?: string | null
        }
        Relationships: []
      }
      events: {
        Row: {
          business_id: string
          created_at: string
          description: string | null
          event_date: string | null
          event_end_date: string | null
          event_end_time: string | null
          event_time: string | null
          focal_point: string | null
          id: string
          image_url: string | null
          sort_order: number | null
          title: string
        }
        Insert: {
          business_id: string
          created_at?: string
          description?: string | null
          event_date?: string | null
          event_end_date?: string | null
          event_end_time?: string | null
          event_time?: string | null
          focal_point?: string | null
          id?: string
          image_url?: string | null
          sort_order?: number | null
          title: string
        }
        Update: {
          business_id?: string
          created_at?: string
          description?: string | null
          event_date?: string | null
          event_end_date?: string | null
          event_end_time?: string | null
          event_time?: string | null
          focal_point?: string | null
          id?: string
          image_url?: string | null
          sort_order?: number | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "events_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "events_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses_public"
            referencedColumns: ["id"]
          },
        ]
      }
      experiences: {
        Row: {
          business_id: string
          created_at: string
          description: string | null
          focal_point: string | null
          id: string
          image_url: string | null
          name: string
          sort_order: number | null
        }
        Insert: {
          business_id: string
          created_at?: string
          description?: string | null
          focal_point?: string | null
          id?: string
          image_url?: string | null
          name: string
          sort_order?: number | null
        }
        Update: {
          business_id?: string
          created_at?: string
          description?: string | null
          focal_point?: string | null
          id?: string
          image_url?: string | null
          name?: string
          sort_order?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "experiences_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "experiences_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses_public"
            referencedColumns: ["id"]
          },
        ]
      }
      faq: {
        Row: {
          answer: string
          business_id: string
          created_at: string
          id: string
          question: string
          sort_order: number | null
        }
        Insert: {
          answer: string
          business_id: string
          created_at?: string
          id?: string
          question: string
          sort_order?: number | null
        }
        Update: {
          answer?: string
          business_id?: string
          created_at?: string
          id?: string
          question?: string
          sort_order?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "faq_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "faq_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses_public"
            referencedColumns: ["id"]
          },
        ]
      }
      gallery_images: {
        Row: {
          alt_text: string | null
          business_id: string
          created_at: string
          focal_point: string | null
          id: string
          image_url: string
          sort_order: number | null
        }
        Insert: {
          alt_text?: string | null
          business_id: string
          created_at?: string
          focal_point?: string | null
          id?: string
          image_url: string
          sort_order?: number | null
        }
        Update: {
          alt_text?: string | null
          business_id?: string
          created_at?: string
          focal_point?: string | null
          id?: string
          image_url?: string
          sort_order?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "gallery_images_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "gallery_images_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses_public"
            referencedColumns: ["id"]
          },
        ]
      }
      menu: {
        Row: {
          business_id: string
          content: string | null
          created_at: string
          id: string
          pdf_url: string | null
          title: string | null
          updated_at: string
        }
        Insert: {
          business_id: string
          content?: string | null
          created_at?: string
          id?: string
          pdf_url?: string | null
          title?: string | null
          updated_at?: string
        }
        Update: {
          business_id?: string
          content?: string | null
          created_at?: string
          id?: string
          pdf_url?: string | null
          title?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "menu_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: true
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "menu_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: true
            referencedRelation: "businesses_public"
            referencedColumns: ["id"]
          },
        ]
      }
      news: {
        Row: {
          business_id: string
          content: string | null
          created_at: string
          focal_point: string | null
          id: string
          image_url: string | null
          published_date: string | null
          sort_order: number | null
          title: string
        }
        Insert: {
          business_id: string
          content?: string | null
          created_at?: string
          focal_point?: string | null
          id?: string
          image_url?: string | null
          published_date?: string | null
          sort_order?: number | null
          title: string
        }
        Update: {
          business_id?: string
          content?: string | null
          created_at?: string
          focal_point?: string | null
          id?: string
          image_url?: string | null
          published_date?: string | null
          sort_order?: number | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "news_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "news_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses_public"
            referencedColumns: ["id"]
          },
        ]
      }
      sections: {
        Row: {
          business_id: string
          created_at: string
          id: string
          is_enabled: boolean | null
          section_type: string
          sort_order: number | null
        }
        Insert: {
          business_id: string
          created_at?: string
          id?: string
          is_enabled?: boolean | null
          section_type: string
          sort_order?: number | null
        }
        Update: {
          business_id?: string
          created_at?: string
          id?: string
          is_enabled?: boolean | null
          section_type?: string
          sort_order?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "sections_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sections_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses_public"
            referencedColumns: ["id"]
          },
        ]
      }
      services: {
        Row: {
          business_id: string
          created_at: string
          description: string | null
          id: string
          name: string
          sort_order: number | null
        }
        Insert: {
          business_id: string
          created_at?: string
          description?: string | null
          id?: string
          name: string
          sort_order?: number | null
        }
        Update: {
          business_id?: string
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          sort_order?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "services_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "services_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses_public"
            referencedColumns: ["id"]
          },
        ]
      }
      testimonials: {
        Row: {
          author_name: string
          business_id: string
          content: string
          created_at: string
          id: string
          sort_order: number | null
        }
        Insert: {
          author_name: string
          business_id: string
          content: string
          created_at?: string
          id?: string
          sort_order?: number | null
        }
        Update: {
          author_name?: string
          business_id?: string
          content?: string
          created_at?: string
          id?: string
          sort_order?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "testimonials_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "testimonials_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses_public"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      businesses_public: {
        Row: {
          about_text: string | null
          accent_color: string | null
          address: string | null
          business_name: string | null
          created_at: string | null
          cta_text: string | null
          email: string | null
          facebook_url: string | null
          font_style: string | null
          google_maps_embed: string | null
          hero_focal_point: string | null
          hero_image_url: string | null
          id: string | null
          instagram_url: string | null
          is_published: boolean | null
          linkedin_url: string | null
          logo_url: string | null
          opening_hours: Json | null
          phone: string | null
          short_description: string | null
          subdomain: string | null
          tiktok_url: string | null
          updated_at: string | null
          youtube_url: string | null
        }
        Insert: {
          about_text?: string | null
          accent_color?: string | null
          address?: string | null
          business_name?: string | null
          created_at?: string | null
          cta_text?: string | null
          email?: string | null
          facebook_url?: string | null
          font_style?: string | null
          google_maps_embed?: string | null
          hero_focal_point?: string | null
          hero_image_url?: string | null
          id?: string | null
          instagram_url?: string | null
          is_published?: boolean | null
          linkedin_url?: string | null
          logo_url?: string | null
          opening_hours?: Json | null
          phone?: string | null
          short_description?: string | null
          subdomain?: string | null
          tiktok_url?: string | null
          updated_at?: string | null
          youtube_url?: string | null
        }
        Update: {
          about_text?: string | null
          accent_color?: string | null
          address?: string | null
          business_name?: string | null
          created_at?: string | null
          cta_text?: string | null
          email?: string | null
          facebook_url?: string | null
          font_style?: string | null
          google_maps_embed?: string | null
          hero_focal_point?: string | null
          hero_image_url?: string | null
          id?: string | null
          instagram_url?: string | null
          is_published?: boolean | null
          linkedin_url?: string | null
          logo_url?: string | null
          opening_hours?: Json | null
          phone?: string | null
          short_description?: string | null
          subdomain?: string | null
          tiktok_url?: string | null
          updated_at?: string | null
          youtube_url?: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      is_published_business: {
        Args: { _business_id: string }
        Returns: boolean
      }
      owns_business_folder: { Args: { folder_name: string }; Returns: boolean }
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
