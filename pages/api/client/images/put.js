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
      const s3Key = `${regNo}/${applicantNo}/${fileName}`

      const { error } = await supabase.storage
        .from('worker-photos')
        .upload(s3Key, buffer, {
          contentType: 'image/jpeg',
          upsert: false  // never overwrite existing
        })

      if (error) {
        console.error('Supabase storage error:', error.message)
        return res.status(500).end()
      }

      return res.status(200).end()

    } catch (err) {
      console.error('PUT error:', err.message)
      return res.status(500).end()
    }
  })

  req.on('error', () => res.status(500).end())
}
