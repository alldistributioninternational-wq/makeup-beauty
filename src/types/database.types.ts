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
          full_name: string | null
          phone: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          full_name?: string | null
          phone?: string | null
        }
        Update: {
          full_name?: string | null
          phone?: string | null
        }
      }
      products: {
        Row: {
          id: string
          brand_id: string | null
          name: string
          description: string | null
          price: number
          category: string
          images: Json | null
          colors: Json | null
          stock: number
          created_at: string
          updated_at: string
        }
        Insert: {
          brand_id?: string | null
          name: string
          description?: string | null
          price: number
          category: string
          images?: Json | null
          colors?: Json | null
          stock?: number
        }
        Update: {
          name?: string
          description?: string | null
          price?: number
          category?: string
          images?: Json | null
          colors?: Json | null
          stock?: number
        }
      }
      looks: {
        Row: {
          id: string
          title: string
          description: string | null
          image_url: string | null
          video_url: string | null
          tutorial_video_url: string | null
          views: number
          likes: number
          created_at: string
          updated_at: string
        }
        Insert: {
          title: string
          description?: string | null
          image_url?: string | null
          video_url?: string | null
          tutorial_video_url?: string | null
        }
        Update: {
          title?: string
          description?: string | null
          image_url?: string | null
          video_url?: string | null
          tutorial_video_url?: string | null
          views?: number
          likes?: number
        }
      }
      orders: {
        Row: {
          id: string
          user_id: string | null
          email: string
          phone: string
          total_amount: number
          status: string
          stripe_payment_id: string | null
          shipping_address: Json | null
          created_at: string
          updated_at: string
        }
        Insert: {
          user_id?: string | null
          email: string
          phone: string
          total_amount: number
          status?: string
          stripe_payment_id?: string | null
          shipping_address?: Json | null
        }
        Update: {
          status?: string
          stripe_payment_id?: string | null
          shipping_address?: Json | null
        }
      }
    }
  }
}