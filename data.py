import json
import os
import random
import time

USERS_FILE = "users.json"

# Admini
ADMINS = ["admin", "root", "ivan"]

# Încarcă userii din JSON
def load_users():
    if not os.path.exists(USERS_FILE):
        return {}
    with open(USERS_FILE, "r") as f:
        return json.load(f)

# Salvează userii în JSON
def save_users(users):
    with open(USERS_FILE, "w") as f:
        json.dump(users, f, indent=4)

# Creează user dacă nu există
def get_user(users, name):
    if name not in users:
        users[name] = {
            "balance": random.randint(300, 800),
            "xp": 0,
            "level": 1,
            "daily": 0,
            "work": 0,
            "antifaliment": 0,
            "luck_boost": 0,
            "money_boost": 1.0,
            "temp_boost_end": 0,
            "temp_luck_boost": 0,
            "temp_money_boost": 1.0
        }
    return users[name]

# Antifaliment
def antifaliment(user):
    now = int(time.time())
    if user["balance"] <= 0:
        if now - user["antifaliment"] >= 86400:
            user["balance"] += 300
            user["antifaliment"] = now
            return "🛑 Antifaliment activat: +300 monede"
        else:
            return "⏳ Antifaliment deja folosit azi"
    return Nonet
