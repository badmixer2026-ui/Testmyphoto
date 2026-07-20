import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
)

export const config = {
  api: { 
    bodyParser: false,
    sizeLimit: '10mb'
  }
}

export default async function handler(req, res) {
  console.log('upload-binary called:', req.method, req.query)

  if (req.method !== 'PUT') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { regNo, applicantNo, fileName } = req.query

  if (!regNo || !applicantNo) {
    return res.status(400).json({ 
      success: false, 
      message: 'Missing regNo or applicantNo' 
    })
  }

  try {
    const chunks = []
    await new Promise((resolve, reject) => {
      req.on('data', chunk => chunks.push(chunk))
      req.on('end', resolve)
      req.on('error', reject)
    })

    const buffer = Buffer.concat(chunks)
    console.log('Received bytes:', buffer.length)

    if (buffer.length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Empty file received' 
      })
    }

    const s3Key = `${regNo}/${applicantNo}/${fileName || 'photo.jpg'}`
    console.log('Uploading to Supabase:', s3Key)

    const { error } = await supabase.storage
      .from('worker-photos')
      .upload(s3Key, buffer, {
        contentType: 'image/jpeg',
        upsert: true
      })

    if (error) {
      console.log('Supabase error:', error.message)
      throw error
    }

    console.log('Upload success:', s3Key)
    return res.status(200).json({ success: true })

  } catch (err) {
    console.log('Upload error:', err.message)
    return res.status(500).json({ 
      success: false, 
      message: err.message 
    })
  }
}
