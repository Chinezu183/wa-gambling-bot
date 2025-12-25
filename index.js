import makeWASocket, {
  useMultiFileAuthState,
  DisconnectReason
} from "@whiskeysockets/baileys"
import pino from "pino"
import readline from "readline"

const PREFIX = "."

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

let askedNumber = false

async function startBot() {
  console.log("📱 Pornire bot WhatsApp...")

  const { state, saveCreds } = await useMultiFileAuthState("./auth")

  const sock = makeWASocket({
    auth: state,
    logger: pino({ level: "silent" }),
    printQRInTerminal: false
  })

  sock.ev.on("creds.update", saveCreds)

  // 🔐 Pairing code (o singură dată)
  if (!state.creds.registered && !askedNumber) {
    askedNumber = true
    rl.question("📱 Număr WhatsApp (ex: 40xxxxxxxxx): ", async (num) => {
      try {
        const code = await sock.requestPairingCode(num.trim())
        console.log("\n🔑 COD DE CONECTARE:", code)
        console.log("👉 WhatsApp → Setări → Dispozitive conectate → Conectare cu cod\n")
      } catch (e) {
        console.log("❌ Eroare pairing:", e.message)
      }
    })
  }

  sock.ev.on("connection.update", (update) => {
    const { connection, lastDisconnect } = update

    if (connection === "open") {
      console.log("✅ BOT CONECTAT CU SUCCES LA WHATSAPP")
    }

    if (connection === "close") {
      const reason = lastDisconnect?.error?.output?.statusCode
      if (reason === DisconnectReason.loggedOut) {
        console.log("❌ LOGOUT DETECTAT – șterge folderul auth și reconectează")
      } else {
        console.log("⚠️ Conexiune pierdută, reconectare automată...")
        startBot()
      }
    }
  })

  // 📩 Mesaje
  sock.ev.on("messages.upsert", async ({ messages }) => {
    const msg = messages[0]
    if (!msg?.message || msg.key.fromMe) return

    const jid = msg.key.remoteJid
    const text =
      msg.message.conversation ||
      msg.message.extendedTextMessage?.text ||
      ""

    if (!text.startsWith(PREFIX)) return

    const cmd = text.slice(1).toLowerCase()

    if (cmd === "ping") {
      await sock.sendMessage(jid, { text: "🏓 Pong! Bot online." })
    }

    if (cmd === "menu") {
      await sock.sendMessage(jid, {
        text:
`🎰 *FAKE GAMBLING BOT*

• .ping – test bot
• .menu – acest meniu

🔒 Sistem sigur
👮 Admin ready
💰 Monede false
🍀 Luck boost
⚙️ Termux compatible`
      })
    }
  })
}

startBot()
