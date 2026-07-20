import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
)

export const config = {
  api: { bodyParser: { sizeLimit: '10mb' } }
}

export default async function handler(req, res) {
  if (req.method !== 'PUT') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { regNo, applicantNo, fileName } = req.query

  try {
    // Collect raw bytes from request
    const chunks = []
    for await (const chunk of req) {
      chunks.push(chunk)
    }
    const buffer = Buffer.concat(chunks)

    const s3Key = `${regNo}/${applicantNo}/${fileName || 'photo.jpg'}`

    // Upload to Supabase
    const { error } = await supabase.storage
      .from('worker-photos')
      .upload(s3Key, buffer, {
        contentType: 'image/jpeg',
        upsert: true
      })

    if (error) throw error

    return res.status(200).json({ success: true })

  } catch (err) {
    return res.status(500).json({ 
      success: false, 
      message: err.message 
    })
  }
}
