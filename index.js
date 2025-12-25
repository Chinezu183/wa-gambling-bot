import makeWASocket, {
  useMultiFileAuthState,
  DisconnectReason
} from "@whiskeysockets/baileys"
import pino from "pino"
import readline from "readline"

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

async function startBot() {
  console.log("📱 Pornire bot WhatsApp...")

  const { state, saveCreds } = await useMultiFileAuthState("./auth")

  const sock = makeWASocket({
    logger: pino({ level: "silent" }),
    auth: state,
    printQRInTerminal: false
  })

  sock.ev.on("creds.update", saveCreds)

  // 🔑 PAIRING CODE (FĂRĂ QR)
  if (!state.creds.registered) {
    rl.question("📱 Număr WhatsApp (ex: 40xxxxxxxxx): ", async (number) => {
      const code = await sock.requestPairingCode(number.trim())
      console.log("\n🔑 COD DE CONECTARE:", code)
      console.log("👉 WhatsApp → Setări → Dispozitive conectate → Conectare cu cod\n")
      rl.close()
    })
  }

  sock.ev.on("connection.update", (update) => {
    const { connection, lastDisconnect } = update

    if (connection === "open") {
      console.log("✅ BOT CONECTAT LA WHATSAPP")
    }

    if (connection === "close") {
      const reason = lastDisconnect?.error?.output?.statusCode
      if (reason !== DisconnectReason.loggedOut) {
        console.log("🔄 Reconectare...")
        startBot()
      } else {
        console.log("❌ Deconectat definitiv (logout)")
      }
    }
  })

  // 📩 COMENZI DE TEST
  sock.ev.on("messages.upsert", async ({ messages }) => {
    const msg = messages[0]
    if (!msg.message || msg.key.fromMe) return

    const jid = msg.key.remoteJid
    const text =
      msg.message.conversation ||
      msg.message.extendedTextMessage?.text ||
      ""

    if (!text.startsWith(".")) return

    if (text === ".ping") {
      await sock.sendMessage(jid, { text: "🏓 Pong! Bot online." })
    }

    if (text === ".menu") {
      await sock.sendMessage(jid, {
        text: `
🎰 *GAMBLING BOT*
.ping
.menu

(urmează jocurile)
`
      })
    }
  })
}

startBot()
