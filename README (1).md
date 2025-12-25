# Fake Gambling Bot

## Comenzi

- `.coinflip [sumă] [cap/pajura]`
- `.dice [sumă] [1-6]`
- `.slots [sumă]`
- `.blackjack [sumă]`
- `.daily`
- `.work`
- `.balance`
- `.lb`
- `.info`
- `.admin [opțiune]` (doar pentru admini)
- `.exit`

## Admin

- `.admin give [user] [sumă]` – oferă monede
- `.admin boost [user] [luck%] [money_multiplier]` – boost temporar 10 min
- `.admin reset [user]` – resetează user
- `.admin list` – lista userilor

## Note

- Monedele sunt VIRTUALE
- Boost permanent pe level multiplu de 5
- Boost temporar de la admin expiră după 10 minute
- Antifaliment: dacă ajungi la 0 primești +300 monede o dată la 24h

# WhatsApp Gambling 24h


Bot WhatsApp real folosind Baileys + Pairing Code (fără QR).

## Instalare (Termux)

```bash
pkg install nodejs git
git clone https://github.com/USERNAME/wa-gambling-bot.git
cd wa-gambling-bot
npm install
node index.js
