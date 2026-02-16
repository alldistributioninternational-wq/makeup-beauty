export const lookService = {
  getAll: async () => {
    try {
      return []
    } catch (error) {
      console.error("Erreur getAll looks:", error)
      throw error
    }
  },

  getById: async (id: string) => {
    try {
      return null
    } catch (error) {
      console.error("Erreur getById look:", error)
      throw error
    }
  },

  create: async (data: any) => {
    try {
      return data
    } catch (error) {
      console.error("Erreur create look:", error)
      throw error
    }
  }
}
