export const packService = {
  getAll: async () => {
    try {
      return []
    } catch (error) {
      console.error("Erreur getAll packs:", error)
      throw error
    }
  },

  getById: async (id: string) => {
    try {
      return null
    } catch (error) {
      console.error("Erreur getById pack:", error)
      throw error
    }
  },

  create: async (data: any) => {
    try {
      return data
    } catch (error) {
      console.error("Erreur create pack:", error)
      throw error
    }
  }
}
