import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET(req: NextRequest, { params }: { params: Promise<{ orderId: string }> }) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { orderId } = await params

  const { data: order } = await supabase
    .from('orders')
    .select('look_ids')
    .eq('id', orderId)
    .single()

  if (!order?.look_ids?.length) {
    return NextResponse.json({ error: 'Aucun tutoriel trouvé' }, { status: 404 })
  }

  const { data: looks } = await supabase
    .from('looks')
    .select('id, title, cloudinary_video_id')
    .in('id', order.look_ids)

  if (!looks?.length || !looks[0].cloudinary_video_id) {
    return NextResponse.json({ error: 'Vidéo non disponible' }, { status: 404 })
  }

  const look = looks[0]
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
  const videoUrl = look.cloudinary_video_id.startsWith('http')
    ? look.cloudinary_video_id
    : 'https://res.cloudinary.com/' + cloudName + '/video/upload/' + look.cloudinary_video_id

  const response = await fetch(videoUrl)
  if (!response.ok) {
    return NextResponse.json({ error: 'Vidéo introuvable' }, { status: 404 })
  }

  const fileName = 'tutoriel-' + look.title.replace(/\s+/g, '-').toLowerCase() + '.mp4'

  // ✅ Stream direct — pas de buffer en mémoire, téléchargement immédiat
  return new NextResponse(response.body, {
    headers: {
      'Content-Type': 'video/mp4',
      'Content-Disposition': 'attachment; filename="' + fileName + '"',
      ...(response.headers.get('content-length')
        ? { 'Content-Length': response.headers.get('content-length')! }
        : {}),
    },
  })
}