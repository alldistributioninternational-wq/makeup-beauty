export const orderService = {
  getAll: async () => {
    try {
      return []
    } catch (error) {
      console.error("Erreur getAll orders:", error)
      throw error
    }
  },

  getById: async (id: string) => {
    try {
      return null
    } catch (error) {
      console.error("Erreur getById order:", error)
      throw error
    }
  },

  create: async (data: any) => {
    try {
      return data
    } catch (error) {
      console.error("Erreur create order:", error)
      throw error
    }
  }
}
