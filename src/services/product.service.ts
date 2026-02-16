export const productService = {
  getAll: async () => {
    try {
      // Exemple temporaire (à remplacer par ton API)
      return []
    } catch (error) {
      console.error("Erreur getAll products:", error)
      throw error
    }
  },

  getById: async (id: string) => {
    try {
      return null
    } catch (error) {
      console.error("Erreur getById product:", error)
      throw error
    }
  },

  create: async (data: any) => {
    try {
      return data
    } catch (error) {
      console.error("Erreur create product:", error)
      throw error
    }
  }
}
