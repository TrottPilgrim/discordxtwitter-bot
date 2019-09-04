const Discord = require("discord.js");
const puppeteer = require("puppeteer");
const config = require("./config.json");

// Initialize Discord bot
const bot = new Discord.Client();

const grabImages = async function(exURL) {
  try {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    // await page.setRequestInterception(true);
    await page.goto(exURL);
    let img = await page.evaluate(() => {
      //js-original-tweet is a class that, as of September 3rd, 2019, designated that tweet as the tweet associated with a url.
      const primeTweet = document.querySelector(`.js-original-tweet`);
      const imgs = primeTweet.querySelectorAll("img[data-aria-label-part]");
      const imgsList = Array.from(imgs).map(img => img.getAttribute("src"));
      return imgsList;
    });
    await browser.close();
    return img;
  } catch (err) {
    console.error(err);
    return;
  }
};

// Event listener, when bot turns on triggers callback
bot.on("ready", function(evt) {
  let msg = `Connected, Logged in as: ${bot.user.tag} - (${bot.user})`;
  console.log(msg);
});

//Bot listens for messages that are tweets.
// https://stackoverflow.com/a/4138539
const tweetRegex = /^http(s)?:\/\/twitter\.com\/(?:#!\/)?(\w+)\/status(es)?\/(\d+)$/;
bot.on("message", async msg => {
  if (msg.author.bot) return;
  //clean up the message and look for only the *first* tweet posted
  let args = msg.content.trim().split(/ +/g);
  let url = args.filter(e => tweetRegex.test(e))[0] || false;
  if (url) {
    const buffer = await grabImages(url);
    // We want the bot to send a message only if there is more than one image
    buffer[1] &&
      msg.channel.send(
        "Other images in the tweet:\n" + buffer.slice(1).join("\n")
      );
  }
});

bot.login(config.token);

// const prefix = config.prefix;
// Bot listens for a message being sent
// bot.on("message", async msg => {
//   if (!msg.content.startsWith(prefix) || msg.author.bot) return;
//   const args = msg.content
//     .slice(prefix.length)
//     .trim()
//     .split(/ +/g);
//   // pops command arg from array and returns it
//   const cmd = args.shift().toLowerCase();

//   switch (cmd) {
//     case "ping":
//       msg.channel.send("Pong!");
//       break;
//     case "timg":
//       if (args.length < 1) return;
//       let [url] = args;
//       const buffer = await grabImages(url);
//       buffer[1] && msg.channel.send(buffer.slice(1));
//       break;
//   }
// });
