// src/app/(main)/checkout/success/page.tsx
'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { CheckCircle, Download, Play, ShoppingBag } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'

interface LookVideo {
  id: string
  title: string
  cloudinary_video_id: string | null
  cloudinary_image_id: string | null
}

function getVideoUrl(cloudinaryVideoId: string | null): string | null {
  if (!cloudinaryVideoId) return null
  if (cloudinaryVideoId.startsWith('http')) return cloudinaryVideoId
  return 'https://res.cloudinary.com/' + process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME + '/video/upload/' + cloudinaryVideoId
}

function getThumbnail(cloudinaryImageId: string | null): string {
  if (!cloudinaryImageId) return ''
  if (cloudinaryImageId.startsWith('http')) return cloudinaryImageId
  return 'https://res.cloudinary.com/' + process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME + '/image/upload/w_600,h_400,c_fill/' + cloudinaryImageId
}

function SuccessContent() {
  const searchParams = useSearchParams()
  const sessionId = searchParams.get('session_id')
  const [looks, setLooks] = useState<LookVideo[]>([])
  const [loading, setLoading] = useState(true)
  const [playingId, setPlayingId] = useState<string | null>(null)

  useEffect(() => {
    async function fetchLookVideos() {
      if (!sessionId) { setLoading(false); return }

      const { data: order } = await supabase
        .from('orders')
        .select('items')
        .eq('stripe_session_id', sessionId)
        .single()

      if (!order?.items) { setLoading(false); return }

      const lookIds: string[] = (order.items as any[])
        .map((item: any) => item.look_id)
        .filter(Boolean)

      if (lookIds.length === 0) { setLoading(false); return }

      const { data: looksData } = await supabase
        .from('looks')
        .select('id, title, cloudinary_video_id, cloudinary_image_id')
        .in('id', lookIds)

      if (looksData) setLooks(looksData)
      setLoading(false)
    }

    fetchLookVideos()
  }, [sessionId])

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 py-12">

        <div className="text-center bg-white rounded-2xl p-10 shadow-sm border border-gray-100 mb-8">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5">
            <CheckCircle className="w-12 h-12 text-green-500" />
          </div>
          <h1 className="text-3xl font-black text-gray-900 mb-2">Commande confirmée ! 🎉</h1>
          <p className="text-gray-500 mb-1">Merci pour ton achat</p>
          <p className="text-gray-400 text-sm">
            Tu recevras un email de confirmation. Ta commande est en cours de traitement.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center mt-8">
            <Link
              href="/profile"
              className="flex items-center justify-center gap-2 px-6 py-3 bg-pink-500 text-white font-semibold rounded-xl hover:bg-pink-600 transition-colors"
            >
              <ShoppingBag className="w-4 h-4" />
              Voir mes commandes
            </Link>
            <Link
              href="/"
              className="flex items-center justify-center gap-2 px-6 py-3 border border-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-colors"
            >
              Retour à l'accueil
            </Link>
          </div>
        </div>

        {loading && (
          <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500 mx-auto mb-3" />
            <p className="text-gray-400 text-sm">Chargement de tes tutoriels...</p>
          </div>
        )}

        {!loading && looks.length > 0 && (
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-pink-100 rounded-xl flex items-center justify-center">
                <Play className="w-5 h-5 text-pink-500" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Tes tutoriels exclusifs 🎬</h2>
                <p className="text-sm text-gray-400">
                  {looks.length} tutoriel{looks.length > 1 ? 's' : ''} disponible{looks.length > 1 ? 's' : ''}
                </p>
              </div>
            </div>

            <div className="space-y-6">
              {looks.map((look) => {
                const videoUrl = getVideoUrl(look.cloudinary_video_id)
                const thumbnail = getThumbnail(look.cloudinary_image_id)
                const isPlaying = playingId === look.id
                const downloadName = 'tutoriel-' + look.title.replace(/\s+/g, '-') + '.mp4'

                return (
                  <div key={look.id} className="border border-gray-100 rounded-xl overflow-hidden">

                    <div className="px-4 py-3 border-b border-gray-50 flex items-center justify-between">
                      <div>
                        <h3 className="font-bold text-gray-900">{look.title}</h3>
                        <p className="text-xs text-gray-400">
                          🎬 Télécharge ce tutoriel pour mieux réussir ce look
                        </p>
                      </div>
                      {videoUrl && (
                        <a href={videoUrl} download={downloadName} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 px-3 py-2 bg-pink-500 text-white text-xs font-semibold rounded-lg hover:bg-pink-600 transition-colors flex-shrink-0 ml-3">
                          <Download className="w-3.5 h-3.5" />
                          <span>Telecharger</span>
                        </a>
                      )}
                    </div>

                    {videoUrl ? (
                      <div className="bg-black">
                        {!isPlaying ? (
                          <div
                            className="relative aspect-video cursor-pointer group"
                            onClick={() => setPlayingId(look.id)}
                          >
                            {thumbnail ? (
                              <img
                                src={thumbnail}
                                alt={look.title}
                                className="w-full h-full object-cover opacity-75"
                              />
                            ) : (
                              <div className="w-full aspect-video bg-gray-900" />
                            )}
                            <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/30 transition-colors">
                              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform">
                                <Play className="w-7 h-7 text-pink-500 ml-1" />
                              </div>
                            </div>
                            <div className="absolute bottom-3 left-3 bg-black/60 text-white text-xs px-2.5 py-1 rounded-lg">
                              🎬 Clique pour regarder le tutoriel
                            </div>
                          </div>
                        ) : (
                          <video src={videoUrl} controls autoPlay className="w-full aspect-video">
                            Votre navigateur ne supporte pas la lecture video.
                          </video>
                        )}
                      </div>
                    ) : (
                      <div className="aspect-video bg-gray-50 flex items-center justify-center">
                        <div className="text-center">
                          <Play className="w-14 h-14 mx-auto mb-3 text-gray-200" />
                          <p className="text-sm text-gray-400">Tutoriel bientot disponible</p>
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>

            <p className="text-xs text-gray-400 text-center mt-5">
              Ces tutoriels sont aussi accessibles depuis Mes commandes dans ton profil.
            </p>
          </div>
        )}

      </div>
    </div>
  )
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500" />
      </div>
    }>
      <SuccessContent />
    </Suspense>
  )
}