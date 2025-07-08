Treasure Hunt Bot
🏴‍☠️ Telegram-da Xəzinə Axtarışı Botu! 5x5, 7x7 və ya 9x9 xəritələrdə xəzinəni tap, ipucları ilə liderlər cədvəlində qalib ol! 🪙
Funksiyalar

Xəritələr: /start small (5x5, 10 cəhd), /start medium (7x7, 15 cəhd), /start large (9x9, 20 cəhd).
İpucları: "Çox isti!", "İsti!", "Soyuq.", "Çox soyuq!" (istiqamətsiz).
Şəbəkə: Səhv (❌), xəzinə (✔️), boş (⬜).
Təbrik: 🪙🎉 Təbrik edirəm! (xəzinə tapıldıqda).
Qrup rejimi: Çox oyunçu dəstəyi.
Vaxt limiti: Hər təxminə 30 saniyə.
Liderlər cədvəli: /leaderboard ilə ən yaxşı 5 nəticə.
Məlumat: /info ilə qaydalar və inline düymələr.

Quraşdırma

Node.js quraşdırın:

nodejs.org-dan LTS versiyasını yükləyin.
Yoxlayın: node --version, npm --version.


Repository-ni klonlayın:
git clone https://github.com/fuad861/Treasure-Hunt-Bot-TG.git
cd Treasure-Hunt-Bot-TG


Asılılıqları quraşdırın:
npm install


Bot tokenini qoyun:

index.js-də YOUR_BOT_TOKEN yerinə BotFather tokeninizi yazın.


Lokal işə salın:
node index.js



İstifadə

Botu Telegram-da işə salın: @YourBotName.
Əmrlər:
/start [small|medium|large]: Oyunu başla.
x y: Koordinat daxil et (məs., 3 4).
/stop: Oyunu dayandır.
/leaderboard: Nəticələri gör.
/info: Qaydaları və düymələri gör.


Bio: 🏴‍☠️ Xəzinəni tap! 5x5, 7x7, 9x9 xəritələrdə oyna. /info öyrən!

Render-də Deploy
7/24 işləmək üçün Render-də Web Service:

render.com-da hesab yaradın.
Web Service seçin, fuad861/Treasure-Hunt-Bot-TG repository-ni bağlayın.
Ayarlar:
Environment: Node.js.
Branch: main.
Build Command: npm install.
Start Command: node index.js.
Instance Type: Free.


Mühit dəyişəni:
Key: BOT_TOKEN, Value: BotFather tokeni.


Deploy edin, logları izləyin.

BotFather Ayarları

Bio:/setdescription
🏴‍☠️ Xəzinəni tap! 5x5, 7x7, 9x9 xəritələrdə oyna. /info öyrən!


Əmrlər:/setcommands
start - Oyunu başla (small, medium, large xəritə seçimi ilə)
guess - Xəzinə üçün koordinat təxmin et
stop - Oyunu dayandır
leaderboard - Ən yaxşı nəticələri gör
info - Oyun qaydaları və xəritə ölçüləri haqqında məlumat



Qeydlər

leaderboard.json üçün Render-də disk əlavə edin:
Mount Path: /opt/render/project/src/leaderboard.json.


Xəta olarsa, node index.js ilə lokal test edin.


@hunt1_bot


