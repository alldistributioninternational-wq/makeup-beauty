// src/services/user.service.ts
// Service pour les fonctionnalités utilisateur (favoris, reviews, profil beauté)

import { supabase } from '@/lib/supabase'
import type { Favorite, Review, BeautyProfile, Inserts, Updates } from '@/types/supabase.types'

export const userService = {
  // ============================================
  // PROFIL BEAUTÉ
  // ============================================

  /**
   * Récupérer le profil beauté d'un utilisateur
   */
  async getBeautyProfile(userId: string) {
    const { data, error } = await supabase
      .from('beauty_profiles')
      .select('*')
      .eq('user_id', userId)
      .single()

    return { data, error }
  },

  /**
   * Créer ou mettre à jour le profil beauté
   */
  async upsertBeautyProfile(beautyProfile: Inserts<'beauty_profiles'>) {
    const { data, error } = await supabase
      .from('beauty_profiles')
      .upsert(beautyProfile)
      .select()
      .single()

    return { data, error }
  },

  // ============================================
  // FAVORIS
  // ============================================

  /**
   * Récupérer tous les favoris d'un utilisateur
   */
  async getFavorites(userId: string, itemType?: 'look' | 'product') {
    let query = supabase
      .from('favorites')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (itemType) {
      query = query.eq('item_type', itemType)
    }

    const { data, error } = await query

    return { data, error }
  },

  /**
   * Récupérer les looks favoris avec détails
   */
  async getFavoriteLooks(userId: string) {
    const { data: favorites, error } = await supabase
      .from('favorites')
      .select(`
        *,
        looks:item_id (
          id,
          title,
          description,
          image_url,
          creator_name,
          creator_username,
          likes,
          views
        )
      `)
      .eq('user_id', userId)
      .eq('item_type', 'look')
      .order('created_at', { ascending: false })

    return { data: favorites, error }
  },

  /**
   * Récupérer les produits favoris avec détails
   */
  async getFavoriteProducts(userId: string) {
    const { data: favorites, error } = await supabase
      .from('favorites')
      .select(`
        *,
        products:item_id (
          id,
          name,
          slug,
          price,
          image_url,
          brands (
            name,
            slug
          )
        )
      `)
      .eq('user_id', userId)
      .eq('item_type', 'product')
      .order('created_at', { ascending: false })

    return { data: favorites, error }
  },

  /**
   * Vérifier si un item est en favori
   */
  async isFavorite(userId: string, itemType: 'look' | 'product', itemId: string) {
    const { data, error } = await supabase
      .from('favorites')
      .select('id')
      .eq('user_id', userId)
      .eq('item_type', itemType)
      .eq('item_id', itemId)
      .single()

    return { isFavorite: !!data, error }
  },

  /**
   * Ajouter aux favoris
   */
  async addFavorite(userId: string, itemType: 'look' | 'product', itemId: string) {
    const { data, error } = await supabase
      .from('favorites')
      .insert({
        user_id: userId,
        item_type: itemType,
        item_id: itemId,
      })
      .select()
      .single()

    return { data, error }
  },

  /**
   * Retirer des favoris
   */
  async removeFavorite(userId: string, itemType: 'look' | 'product', itemId: string) {
    const { error } = await supabase
      .from('favorites')
      .delete()
      .eq('user_id', userId)
      .eq('item_type', itemType)
      .eq('item_id', itemId)

    return { error }
  },

  /**
   * Toggle favori (ajouter/retirer)
   */
  async toggleFavorite(userId: string, itemType: 'look' | 'product', itemId: string) {
    const { isFavorite } = await this.isFavorite(userId, itemType, itemId)

    if (isFavorite) {
      return await this.removeFavorite(userId, itemType, itemId)
    } else {
      return await this.addFavorite(userId, itemType, itemId)
    }
  },

  // ============================================
  // AVIS (REVIEWS)
  // ============================================

  /**
   * Récupérer les avis d'un produit
   */
  async getProductReviews(productId: string) {
    const { data, error } = await supabase
      .from('reviews')
      .select(`
        *,
        profiles (
          full_name,
          avatar_url
        )
      `)
      .eq('product_id', productId)
      .order('created_at', { ascending: false })

    return { data, error }
  },

  /**
   * Récupérer les avis d'un utilisateur
   */
  async getUserReviews(userId: string) {
    const { data, error } = await supabase
      .from('reviews')
      .select(`
        *,
        products (
          id,
          name,
          slug,
          image_url
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    return { data, error }
  },

  /**
   * Créer un avis
   */
  async createReview(review: Inserts<'reviews'>) {
    const { data, error } = await supabase
      .from('reviews')
      .insert(review)
      .select()
      .single()

    return { data, error }
  },

  /**
   * Mettre à jour un avis
   */
  async updateReview(reviewId: string, updates: Updates<'reviews'>) {
    const { data, error } = await supabase
      .from('reviews')
      .update(updates)
      .eq('id', reviewId)
      .select()
      .single()

    return { data, error }
  },

  /**
   * Supprimer un avis
   */
  async deleteReview(reviewId: string) {
    const { error } = await supabase
      .from('reviews')
      .delete()
      .eq('id', reviewId)

    return { error }
  },

  /**
   * Calculer la note moyenne d'un produit
   */
  async getProductRating(productId: string) {
    const { data, error } = await supabase
      .from('reviews')
      .select('rating')
      .eq('product_id', productId)

    if (error || !data || data.length === 0) {
      return { averageRating: 0, totalReviews: 0, error }
    }

    const totalReviews = data.length
    const averageRating = data.reduce((sum, r) => sum + r.rating, 0) / totalReviews

    return { averageRating, totalReviews, error: null }
  },

  // ============================================
  // PROFIL UTILISATEUR
  // ============================================

  /**
   * Mettre à jour le profil utilisateur
   */
  async updateProfile(userId: string, updates: Updates<'profiles'>) {
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single()

    return { data, error }
  },
}