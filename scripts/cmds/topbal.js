module.exports = {
  config: {
    name: "baltop",
    aliases: ["tp"],
    version: "1.8",
    author: "T A N J I L",
    role: 0,
    shortDescription: {
      en: "Show top 15 richest users"
    },
    longDescription: {
      en: "Displays the top 15 users with the highest balance, including bold name and money"
    },
    category: "group",
    guide: {
      en: "{pn}"
    }
  },

  onStart: async function ({ message, usersData }) {
    function formatMoney(amount) {
      if (amount === "unlimited" || amount === "Unlimited" || amount === Infinity) {
        return `∞ (Unlimited) 💵`;
      }
      const num = typeof amount === "string" && !isNaN(Number(amount)) ? Number(amount) : amount;
      if (typeof num === "number") {
        if (num >= 1e9) return `${(num / 1e9).toFixed(2)} B 💵`;
        if (num >= 1e6) return `${(num / 1e6).toFixed(2)} M 💵`;
        if (num >= 1e3) return `${(num / 1e3).toFixed(2)} K 💵`;
        return `${num} 💵`;
      }
      return `0 💵`;
    }

    function boldText(text) {
      const boldUpper = ['𝗔','𝗕','𝗖','𝗗','𝗘','𝗙','𝗚','𝗛','𝗜','𝗝','𝗞','𝗟','𝗠','𝗡','𝗢','𝗣','𝗤','𝗥','𝗦','𝗧','𝗨','𝗩','𝗪','𝗫','𝗬','𝗭'];
      const boldLower = ['𝗮','𝗯','𝗰','𝗱','𝗲','𝗳','𝗴','𝗵','𝗶','𝗷','𝗸','𝗹','𝗺','𝗻','𝗼','𝗽','𝗾','𝗿','𝘀','𝘁','𝘂','𝘃','𝘄','𝘅','𝘆','𝘇'];
      return text.split('').map(c => {
        const code = c.charCodeAt(0);
        if (c >= 'A' && c <= 'Z') return boldUpper[code - 65];
        if (c >= 'a' && c <= 'z') return boldLower[code - 97];
        return c; // fallback: accented chars 그대로 রাখবে
      }).join('');
    }

    const medals = ["🥇", "🥈", "🥉"];

    // Forced top users with UID for unique check
    const FORCED_TOP = [ 
      { uid: "100066867630344", name: "Mâybê Nx", money: Infinity }  // #1
    ];

    const allUsersRaw = (await usersData.getAll()) || [];

    // Normalize users
    const allUsers = allUsersRaw.map(u => ({
      uid: String(u.userID ?? u.id ?? u.uid ?? ""),
      name: u.name ?? u.userName ?? "Unknown",
      money: (typeof u.money === "number" && !isNaN(u.money)) ? u.money
             : (typeof u.money === "string" && (u.money.toLowerCase() === "unlimited")) ? "unlimited"
             : 0
    }));

    // Remove any users with same UID as forced top to avoid duplicates
    const forcedUIDs = new Set(FORCED_TOP.map(t => t.uid));
    const filtered = allUsers.filter(u => !forcedUIDs.has(u.uid));

    // Sort remaining by money descending
    const sortedRemaining = filtered.sort((a, b) => {
      const ma = (typeof a.money === "number") ? a.money : 0;
      const mb = (typeof b.money === "number") ? b.money : 0;
      return mb - ma;
    });

    // Combine forced tops with remaining
    const combined = [...FORCED_TOP, ...sortedRemaining];

    // Take top 15
    const topUsers = combined.slice(0, 15);

    const topList = topUsers.map((user, index) => {
      const rankEmoji = medals[index] || `#${index + 1}`;
      const displayName = boldText(user.name ?? "Unknown");
      const displayMoney = formatMoney(user.money);
      return `${rankEmoji} | 👤 ${displayName}\n   💰 ${displayMoney}`;
    });

    const finalMessage = `🏆 𝗧𝗢𝗣 15 𝗥𝗜𝗖𝗛𝗘𝗦𝗧 𝗨𝗦𝗘𝗥𝗦 🏆\n\n${topList.join('\n\n')}\n\n🚀 Keep earning and climb the leaderboard!`;

    message.reply(finalMessage);
  }
};
