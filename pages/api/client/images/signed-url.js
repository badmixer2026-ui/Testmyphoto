import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
)

export const config = {
  api: { bodyParser: { sizeLimit: '10mb' } }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { regNo, applicantNo, fileName } = req.body

  const s3Key = `${regNo}/${applicantNo}/${fileName || 'photo.jpg'}`
  const s3Url = `${process.env.SUPABASE_URL}/storage/v1/object/public/worker-photos/${s3Key}`

  // Return noop URL — actual upload happens in Step 2 PUT to /api/client/images/put
  const uploadUrl = `${process.env.NEXT_PUBLIC_API_URL}/api/client/images/put?regNo=${encodeURIComponent(regNo)}&applicantNo=${encodeURIComponent(applicantNo)}&fileName=${encodeURIComponent(fileName || 'photo.jpg')}`

  return res.json({
    success: true,
    data: {
      uploadUrl,
      s3Key,
      s3Url
    }
  })
}
