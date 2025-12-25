import time
import sys
import random

from data import load_users, save_users, get_user, ADMINS, antifaliment, check_boost
from games import coinflip, dice, slots, blackjack

# ============================
# FAKE WHATSAPP CONNECT
# ============================
def whatsapp_connect():
    print("📱 Connecting to WhatsApp", end="")
    for _ in range(5):
        sys.stdout.write(".")
        sys.stdout.flush()
        time.sleep(0.5)
    print("\n✅ WhatsApp connected")
    print("🔐 Session secured")
    print("🤖 Fake Gambling Bot is online!\n")

whatsapp_connect()

# ============================
# LOAD USERS
# ============================
users = load_users()

name = input("👤 Nume jucător: ")
user = get_user(users, name)

# ============================
# DAILY
# ============================
def daily(user):
    now = int(time.time())
    if now - user["daily"] >= 86400:
        user["balance"] += 500
        user["daily"] = now
        return "🎁 Daily bonus: +500 monede"
    return "⏳ Daily deja luat"

# ============================
# WORK
# ============================
def work(user):
    now = int(time.time())
    if now - user["work"] >= 60:
        earn = random.randint(50, 150)
        user["balance"] += earn
        user["work"] = now
        return f"💼 Ai muncit și ai câștigat {earn} monede"
    return "⏳ Work în cooldown (1 minut)"

# ============================
# INFO MENU
# ============================
def info_menu():
    print("""
📘 === COMENZI BOT ===
.coinflip [sumă] [cap/pajura]
.dice [sumă] [1-6]
.slots [sumă]
.blackjack [sumă]

.daily
.work
.balance
.lb
.info

ADMIN:
.admin give [user] [sumă]
.admin boost [user] [luck%] [moneyX]
.admin reset [user]
.admin list

.exit
""")

# ============================
# ADMIN COMMANDS
# ============================
def admin_command(args):
    if name not in ADMINS:
        print("⛔ Nu
