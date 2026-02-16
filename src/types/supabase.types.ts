// src/types/supabase.types.ts
// Types générés depuis votre schéma Supabase
// ⚠️ NE PAS MODIFIER MANUELLEMENT - Généré automatiquement

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          phone: string | null
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          phone?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          phone?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      beauty_profiles: {
        Row: {
          id: string
          user_id: string
          skin_tone: string | null
          skin_type: string | null
          concerns: string[] | null
          preferences: Json | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          skin_tone?: string | null
          skin_type?: string | null
          concerns?: string[] | null
          preferences?: Json | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          skin_tone?: string | null
          skin_type?: string | null
          concerns?: string[] | null
          preferences?: Json | null
          created_at?: string
          updated_at?: string
        }
      }
      brands: {
        Row: {
          id: string
          name: string
          slug: string
          description: string | null
          logo_url: string | null
          website: string | null
          is_featured: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          description?: string | null
          logo_url?: string | null
          website?: string | null
          is_featured?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          description?: string | null
          logo_url?: string | null
          website?: string | null
          is_featured?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      products: {
        Row: {
          id: string
          brand_id: string | null
          name: string
          slug: string
          description: string | null
          category: string
          price: number
          image_url: string | null
          images: Json | null
          shades: Json | null
          stock: number
          is_featured: boolean
          in_stock: boolean
          is_available: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          brand_id?: string | null
          name: string
          slug: string
          description?: string | null
          category: string
          price: number
          image_url?: string | null
          images?: Json | null
          shades?: Json | null
          stock?: number
          is_featured?: boolean
          in_stock?: boolean
          is_available?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          brand_id?: string | null
          name?: string
          slug?: string
          description?: string | null
          category?: string
          price?: number
          image_url?: string | null
          images?: Json | null
          shades?: Json | null
          stock?: number
          is_featured?: boolean
          in_stock?: boolean
          is_available?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      looks: {
        Row: {
          id: string
          title: string
          description: string | null
          category: string | null
          difficulty: string | null
          image_url: string | null
          video_url: string | null
          tutorial_video_url: string | null
          creator_name: string
          creator_username: string
          creator_avatar: string | null
          tags: string[] | null
          likes: number
          saves: number
          views: number
          is_featured: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          category?: string | null
          difficulty?: string | null
          image_url?: string | null
          video_url?: string | null
          tutorial_video_url?: string | null
          creator_name?: string
          creator_username?: string
          creator_avatar?: string | null
          tags?: string[] | null
          likes?: number
          saves?: number
          views?: number
          is_featured?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          category?: string | null
          difficulty?: string | null
          image_url?: string | null
          video_url?: string | null
          tutorial_video_url?: string | null
          creator_name?: string
          creator_username?: string
          creator_avatar?: string | null
          tags?: string[] | null
          likes?: number
          saves?: number
          views?: number
          is_featured?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      look_products: {
        Row: {
          id: string
          look_id: string
          product_id: string
          shade_id: string | null
          category: string | null
          note: string | null
          position: number
          step_number: number | null
          created_at: string
        }
        Insert: {
          id?: string
          look_id: string
          product_id: string
          shade_id?: string | null
          category?: string | null
          note?: string | null
          position?: number
          step_number?: number | null
          created_at?: string
        }
        Update: {
          id?: string
          look_id?: string
          product_id?: string
          shade_id?: string | null
          category?: string | null
          note?: string | null
          position?: number
          step_number?: number | null
          created_at?: string
        }
      }
      packs: {
        Row: {
          id: string
          name: string
          slug: string
          description: string | null
          category: string | null
          image_url: string | null
          discount_percentage: number | null
          is_active: boolean
          is_featured: boolean
          in_stock: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          description?: string | null
          category?: string | null
          image_url?: string | null
          discount_percentage?: number | null
          is_active?: boolean
          is_featured?: boolean
          in_stock?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          description?: string | null
          category?: string | null
          image_url?: string | null
          discount_percentage?: number | null
          is_active?: boolean
          is_featured?: boolean
          in_stock?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      pack_products: {
        Row: {
          id: string
          pack_id: string
          product_id: string
          shade_id: string | null
          quantity: number
          position: number
          created_at: string
        }
        Insert: {
          id?: string
          pack_id: string
          product_id: string
          shade_id?: string | null
          quantity?: number
          position?: number
          created_at?: string
        }
        Update: {
          id?: string
          pack_id?: string
          product_id?: string
          shade_id?: string | null
          quantity?: number
          position?: number
          created_at?: string
        }
      }
      orders: {
        Row: {
          id: string
          user_id: string | null
          email: string
          phone: string
          customer_name: string
          status: string
          total_amount: number
          shipping_cost: number
          shipping_address: Json | null
          billing_address: Json | null
          stripe_payment_id: string | null
          stripe_session_id: string | null
          pdf_invoice_url: string | null
          whatsapp_sent: boolean
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          email: string
          phone: string
          customer_name?: string
          status?: string
          total_amount: number
          shipping_cost?: number
          shipping_address?: Json | null
          billing_address?: Json | null
          stripe_payment_id?: string | null
          stripe_session_id?: string | null
          pdf_invoice_url?: string | null
          whatsapp_sent?: boolean
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          email?: string
          phone?: string
          customer_name?: string
          status?: string
          total_amount?: number
          shipping_cost?: number
          shipping_address?: Json | null
          billing_address?: Json | null
          stripe_payment_id?: string | null
          stripe_session_id?: string | null
          pdf_invoice_url?: string | null
          whatsapp_sent?: boolean
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      order_items: {
        Row: {
          id: string
          order_id: string
          product_id: string | null
          look_id: string | null
          pack_id: string | null
          product_name: string
          product_brand: string | null
          shade_id: string | null
          shade_name: string | null
          quantity: number
          price: number
          subtotal: number
          created_at: string
        }
        Insert: {
          id?: string
          order_id: string
          product_id?: string | null
          look_id?: string | null
          pack_id?: string | null
          product_name: string
          product_brand?: string | null
          shade_id?: string | null
          shade_name?: string | null
          quantity: number
          price: number
          subtotal: number
          created_at?: string
        }
        Update: {
          id?: string
          order_id?: string
          product_id?: string | null
          look_id?: string | null
          pack_id?: string | null
          product_name?: string
          product_brand?: string | null
          shade_id?: string | null
          shade_name?: string | null
          quantity?: number
          price?: number
          subtotal?: number
          created_at?: string
        }
      }
      favorites: {
        Row: {
          id: string
          user_id: string
          item_type: string
          item_id: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          item_type: string
          item_id: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          item_type?: string
          item_id?: string
          created_at?: string
        }
      }
      reviews: {
        Row: {
          id: string
          product_id: string
          user_id: string
          rating: number
          title: string | null
          comment: string | null
          is_verified_purchase: boolean
          helpful_count: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          product_id: string
          user_id: string
          rating: number
          title?: string | null
          comment?: string | null
          is_verified_purchase?: boolean
          helpful_count?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          product_id?: string
          user_id?: string
          rating?: number
          title?: string | null
          comment?: string | null
          is_verified_purchase?: boolean
          helpful_count?: number
          created_at?: string
          updated_at?: string
        }
      }
      cart_items: {
        Row: {
          id: string
          user_id: string
          product_id: string
          shade_id: string | null
          quantity: number
          skin_tone: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          product_id: string
          shade_id?: string | null
          quantity?: number
          skin_tone?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          product_id?: string
          shade_id?: string | null
          quantity?: number
          skin_tone?: string | null
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      increment_likes: {
        Args: { look_uuid: string }
        Returns: void
      }
      increment_views: {
        Args: { look_uuid: string }
        Returns: void
      }
      generate_order_number: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      is_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
    }
    Enums: {
      [_ in never]: never
    }
  }
}

// Types helpers pour faciliter l'utilisation
export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']
export type Inserts<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert']
export type Updates<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update']

// Types spécifiques pour chaque table (pour l'autocomplétion)
export type Profile = Tables<'profiles'>
export type BeautyProfile = Tables<'beauty_profiles'>
export type Brand = Tables<'brands'>
export type Product = Tables<'products'>
export type Look = Tables<'looks'>
export type LookProduct = Tables<'look_products'>
export type Pack = Tables<'packs'>
export type PackProduct = Tables<'pack_products'>
export type Order = Tables<'orders'>
export type OrderItem = Tables<'order_items'>
export type Favorite = Tables<'favorites'>
export type Review = Tables<'reviews'>
export type CartItem = Tables<'cart_items'>