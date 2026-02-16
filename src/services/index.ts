// src/services/index.ts
// Export centralisé de tous les services

export { productService } from './product.service'
export { lookService } from './look.service'
export { packService } from './pack.service'
export { orderService } from './order.service'
export { userService } from './user.service'

// Re-export du client Supabase si besoin
export { supabase, getCurrentUser, signIn, signUp, signOut } from '@/lib/supabase'