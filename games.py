import random
from data import check_boost

# ---------------- XP & Level ----------------
def update_boosts(user):
    # boost permanent pe level multiplu de 5
    user["money_boost"] = 1.0 + (user["level"] // 5) * 0.2
    user["luck_boost"] = (user["level"] // 5) * 5

def add_xp(user, amount):
    user["xp"] += amount
    if user["xp"] >= user["level"] * 100:
        user["xp"] = 0
        user["level"] += 1
        update_boosts(user)
        print("🆙 LEVEL UP! Boost permanent actualizat.")

# ---------------- Antifraudă ----------------
def antifrauda(user, bet):
    if bet <= 0:
        return False, "❌ Bet invalid: trebuie să fie >0"
    if bet > user["balance"]:
        return False, "⛔ Fonduri insuficiente"
    return True, None

# ---------------- Coin Flip ----------------
def coinflip(user, bet, choice):
    ok, err = antifrauda(user, bet)
    if not ok: return err
    check_boost(user)
    result = random.choices(
        ["cap","pajura"],
        weights=[50 + user.get("luck_boost",0)//2,50 - user.get("luck_boost",0)//2]
    )[0]
    if choice == result:
        user["balance"] += int(bet * user.get("money_boost",1.0))
        add_xp(user,10)
        return f"✅ A ieșit {result}. Ai câștigat!"
    else:
        user["balance"] -= bet
        return f"❌ A ieșit {result}. Ai pierdut!"

# ---------------- Dice ----------------
def dice(user, bet, number):
    ok, err = antifrauda(user, bet)
    if not ok: return err
    check_boost(user)
    roll = random.choices(
        range(1,7),
        weights=[1 + user.get("luck_boost",0) if n==number else 1 for n in range(1,7)]
    )[0]
    if roll == number:
        user["balance"] += int(bet*5*user.get("money_boost",1.0))
        add_xp(user,25)
        return f"🎲 Zar: {roll}. JACKPOT!"
    else:
        user["balance"] -= bet
        return f"🎲 Zar: {roll}. Ai pierdut."

# ---------------- Slots ----------------
def slots(user, bet):
    ok, err = antifrauda(user, bet)
    if not ok: return err
    check_boost(user)
    symbols = ["🍒","🍋","⭐","💎"]
    spin = random.choices(symbols,k=3)
    if user.get("luck_boost",0) > 0 and random.randint(1,100) <= user["luck_boost"]:
        symbol = random.choice(symbols)
        spin = [symbol]*3
    if spin[0] == spin[1] == spin[2]:
        user["balance"] += int(bet*10*user.get("money_boost",1.0))
        add_xp(user,50)
        return f"{spin} 💎 MEGA WIN!"
    else:
        user["balance"] -= bet
        return f"{spin} ❌ Ai pierdut."

# ---------------- Blackjack ----------------
cards = {"2":2,"3":3,"4":4,"5":5,"6":6,"7":7,"8":8,"9":9,"10":10,"J":10,"Q":10,"K":10,"A":11}
def hand_value(hand):
    value = sum(cards[c] for c in hand)
    aces = hand.count("A")
    while value>21 and aces:
        value -= 10
        aces -=1
    return value

def blackjack(user, bet):
    ok, err = antifrauda(user, bet)
    if not ok: return err
    check_boost(user)
    deck = list(cards.keys())*4
    random.shuffle(deck)
    player = [deck.pop(),deck.pop()]
    dealer = [deck.pop(),deck.pop()]

    while True:
        print(f"🃏 Mâna ta: {player} ({hand_value(player)})")
        print(f"🎩 Dealer: [{dealer[0]}, ?]")
        if hand_value(player)>21:
            user["balance"] -= bet
            return "❌ Bust! Ai pierdut."
        move = input("hit / stand: ").lower()
        if move=="stand": break
        player.append(deck.pop())

    while hand_value(dealer)<17:
        dealer.append(deck.pop())

    pv = hand_value(player)
    dv = hand_value(dealer)

    if dv>21 or pv>dv:
        user["balance"] += int(bet*user.get("money_boost",1.0))
        add_xp(user,40)
        return "✅ Ai câștigat!"
    elif pv==dv:
        return "➖ Egal"
    else:
        user["balance"] -= bet
        return "❌ Dealerul câștigă."
