const express = require('express')
const cors = require('cors')
const nodemailer = require('nodemailer')
const { OAuth2Client } = require('google-auth-library')

const app = express()
app.use(cors())
app.use(express.json())

// Google 驗證設定
const GOOGLE_CLIENT_ID = '742225736851-duban4t1g73ouiv1t49lmotksuprh8ho.apps.googleusercontent.com' 
const googleClient = new OAuth2Client(GOOGLE_CLIENT_ID)

// 信件設定
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'a0983399440@gmail.com',     // ← 換成你自己的
    pass: 'kkulkhmescrfrbup'           // ← 用 Gmail 申請的 app 密碼
  }
})

// 暫時儲存驗證碼
let codeStore = {}

// Google 登入 + 驗證信流程
app.post('/auth/google', async (req, res) => {
  const { token } = req.body

  try {
    const ticket = await googleClient.verifyIdToken({
      idToken: token,
      audience: GOOGLE_CLIENT_ID
    })

    const payload = ticket.getPayload()
    const email = payload.email
    const code = Math.floor(100000 + Math.random() * 900000).toString()

    codeStore[email] = code

    await transporter.sendMail({
      from: 'a0983399440@gmail.com',
      to: email,
      subject: '你的驗證碼',
      text: `您的驗證碼是：${code}`
    })

    res.json({ success: true, message: '驗證碼已寄出', email })
  } catch (err) {
    console.error('Google 驗證失敗', err)
    res.json({ success: false, message: '驗證失敗' })
  }
})

app.listen(3000, () => {
  console.log('✅ 伺服器啟動在 http://localhost:3000')
})
