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

      // Upload file to storage
      const { error } = await supabase.storage
        .from('worker-photos')
        .upload(s3Key, buffer, {
          contentType: 'image/jpeg',
          upsert: true
        })

      if (error) {
        console.error('Storage error:', error.message)
        return res.status(500).end()
      }

      // Save to DB immediately (don't wait for Step 3)
      const photo_url = `${process.env.SUPABASE_URL}/storage/v1/object/public/worker-photos/${s3Key}`

      await supabase.from('workers').insert({
        reg_no: regNo,
        applicant_no: applicantNo,
        photo_url: photo_url,
        s3_key: s3Key,
        uploaded_at: new Date().toISOString()
      })

      return res.status(200).end()

    } catch (err) {
      console.error('PUT error:', err.message)
      return res.status(500).end()
    }
  })

  req.on('error', () => res.status(500).end())
}
