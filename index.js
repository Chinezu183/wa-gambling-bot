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

let pairingInProgress = false

async function startBot() {
  console.log("📱 Pornire bot WhatsApp...")

  // folosește folder auth/ pentru login
  const { state, saveCreds } = await useMultiFileAuthState("./auth")

  const sock = makeWASocket({
    logger: pino({ level: "silent" }),
    auth: state,
    printQRInTerminal: false
  })

  sock.ev.on("creds.update", saveCreds)

  // 🔑 Pairing code – doar o dată
  if (!state.creds.registered && !pairingInProgress) {
    pairingInProgress = true

    rl.question("📱 Număr WhatsApp (ex: 40xxxxxxxxx): ", async (number) => {
      try {
        const code = await sock.requestPairingCode(number.trim())
        console.log("\n🔑 COD DE CONECTARE:", code)
        console.log("👉 WhatsApp → Setări → Dispozitive conectate → Conectare cu cod\n")
      } catch (err) {
        console.log("❌ Eroare pairing:", err.message)
      }
    })
  }

  // 🔄 Update conexiune
  sock.ev.on("connection.update", (update) => {
    const { connection, lastDisconnect } = update

    if (connection === "open") {
      console.log("✅ BOT CONECTAT LA WHATSAPP")
      pairingInProgress = false
      rl.close()
    }

    if (connection === "close") {
      const statusCode = lastDisconnect?.error?.output?.statusCode

      if (statusCode === DisconnectReason.loggedOut) {
        console.log("❌ Logout – șterge auth/ și reconectează manual")
      } else {
        console.log("⚠️ Conexiune pierdută, aștept...")
        // ❌ NU mai apelăm startBot() aici ca să evităm loop
      }
    }
  })

  // 📩 COMENZI DE TEST
  sock.ev.on("messages.upsert", async ({ messages }) => {
    const msg = messages[0]
    if (!msg?.message || msg.key.fromMe) return

    const jid = msg.key.remoteJid
    const text =
      msg.message.conversation ||
      msg.message.extendedTextMessage?.text ||
      ""

    if (!text.startsWith(".")) return

    // Comenzi simple de test
    if (text === ".ping") {
      await sock.sendMessage(jid, { text: "🏓 Pong! Bot online." })
    }

    if (text === ".menu") {
      await sock.sendMessage(jid, {
        text: `
🎰 *GAMBLING BOT*
.ping - testează conexiunea
.menu - vezi acest meniu

✅ Urmează să fie integrate:
.coinflip
.dice
.slots
.blackjack
.daily
.work
.admin
`
      })
    }
  })
}

// PORNEȘTE BOTUL
startBot()
