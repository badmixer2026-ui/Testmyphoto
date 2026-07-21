import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
)

export const config = {
  api: { bodyParser: false }
}

export default function handler(req, res) {
  if (req.method !== 'PUT') {
    return res.status(200).end()
  }

  const { regNo, applicantNo, fileName } = req.query
  const chunks = []

  req.on('data', chunk => chunks.push(chunk))

  req.on('end', async () => {
    try {
      const buffer = Buffer.concat(chunks)

      const s3Key = `${regNo}/${applicantNo}/${fileName || 'photo.jpg'}`

      const { error } = await supabase.storage
        .from('worker-photos')
        .upload(s3Key, buffer, {
          contentType: 'image/jpeg',
          upsert: true
        })

      if (error) {
        console.error('Supabase error:', error.message)
        return res.status(500).end()
      }

      return res.status(200).end()

    } catch (err) {
      console.error('PUT handler error:', err.message)
      return res.status(500).end()
    }
  })

  req.on('error', err => {
    console.error('Request error:', err.message)
    return res.status(500).end()
  })
}
