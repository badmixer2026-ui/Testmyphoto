import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
)

export const config = {
  api: { bodyParser: false }
}

export default async function handler(req, res) {
  if (req.method !== 'PUT') {
    return res.status(200).end()
  }

  const { regNo, applicantNo, fileName } = req.query

  try {
    // Read raw bytes
    const chunks = []
    await new Promise((resolve, reject) => {
      req.on('data', chunk => chunks.push(chunk))
      req.on('end', resolve)
      req.on('error', reject)
    })
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

    // Return 200 — app checks status code only
    return res.status(200).end()

  } catch (err) {
    console.error('PUT error:', err.message)
    return res.status(500).end()
  }
}
