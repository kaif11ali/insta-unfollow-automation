// Instagram Unfollow Automation Script

require('dotenv').config();
const { PuppeteerCrawler, log } = require("crawlee");
const fs = require("fs");
const path = require("path");

// Environment variables
const INSTAGRAM_USERNAME = process.env.INSTAGRAM_USERNAME;
const INSTAGRAM_PASSWORD = process.env.INSTAGRAM_PASSWORD;
const MAX_UNFOLLOW_COUNT = parseInt(process.env.MAX_UNFOLLOW_COUNT) || 100;
const UNFOLLOW_DELAY = parseInt(process.env.UNFOLLOW_DELAY) || 5000;
const SCROLL_DELAY = parseInt(process.env.SCROLL_DELAY) || 3000;

// Validate environment variables
if (!INSTAGRAM_USERNAME || !INSTAGRAM_PASSWORD) {
  log.error("Missing required environment variables: INSTAGRAM_USERNAME and INSTAGRAM_PASSWORD");
  process.exit(1);
}

// URLs
const LOGIN_URL = "https://www.instagram.com/accounts/login/";
const FOLLOWING_URL = `https://www.instagram.com/${INSTAGRAM_USERNAME}/following/`;
const COOKIE_PATH = path.resolve(__dirname, "..", "cookies.json");

// Helper: Load cookies
const loadCookies = async (page) => {
  try {
    if (fs.existsSync(COOKIE_PATH)) {
      const data = fs.readFileSync(COOKIE_PATH, "utf-8");
      if (data.trim()) {
        const cookies = JSON.parse(data);
        await page.setCookie(...cookies);
        log.info("✅ Cookies loaded successfully!");
        return true;
      }
    }
  } catch (err) {
    log.error("Error loading cookies: " + err.message);
  }
  return false;
};

// Helper: Save cookies
const saveCookies = async (page) => {
  const cookies = await page.cookies();
  fs.writeFileSync(COOKIE_PATH, JSON.stringify(cookies, null, 2));
  log.info("✅ Cookies saved successfully!");
};

(async () => {
  const crawler = new PuppeteerCrawler({
    maxConcurrency: 1,
    launchContext: {
      launchOptions: {
        headless: false,
        args: ["--start-maximized"],
      },
    },

    requestHandler: async ({ page, request }) => {
      log.info(`Processing URL: ${request.url}`);

      // ---------------- LOGIN PHASE ----------------
      if (request.userData.label === "LOGIN") {
        const cookiesLoaded = await loadCookies(page);

        if (!cookiesLoaded) {
          log.info("🔐 Logging in manually...");
          await page.goto(LOGIN_URL, { waitUntil: "networkidle2" });

          await page.waitForSelector('input[name="username"]', { visible: true });
          await page.type('input[name="username"]', INSTAGRAM_USERNAME, { delay: 100 });

          await page.waitForSelector('input[name="password"]', { visible: true });
          await page.type('input[name="password"]', INSTAGRAM_PASSWORD, { delay: 100 });

          await page.waitForSelector('button[type="submit"]', { visible: true });
          await page.click('button[type="submit"]');

          await page.waitForNavigation({ waitUntil: "networkidle2" });
          await saveCookies(page);
        } else {
          log.info("✅ Cookies found. Navigating to Following page...");
          await page.goto(FOLLOWING_URL, { waitUntil: "networkidle2" });
        }
      }

      // ---------------- UNFOLLOW PHASE ----------------
      if (request.userData.label === "UNFOLLOW") {
        log.info("🚀 Starting unfollow process...");

        await page.waitForSelector('a[href*="/following"]', { visible: true });
        await page.click('a[href*="/following"]');

        await page.waitForSelector('div[role="dialog"]', { visible: true });

        let unfollowedCount = 0;
        const unfollowedUsers = new Set();

        while (unfollowedCount < MAX_UNFOLLOW_COUNT) {
          try {
            log.info("🔍 Searching for 'Following' buttons...");

            // Instagram uses class-based or dynamic structure for buttons
            await page.waitForSelector('div[role="dialog"] button', { timeout: 20000 });
            const buttons = await page.$$('div[role="dialog"] button');

            log.info(`Found ${buttons.length} buttons.`);

            if (!buttons.length) {
              log.info("⚠️ No more users found to unfollow.");
              break;
            }

            for (const button of buttons) {
              if (unfollowedCount >= MAX_UNFOLLOW_COUNT) break;

              const isButtonAttached = await page.evaluate(el => el.isConnected, button);
              if (!isButtonAttached) {
                log.warn("Button is detached. Skipping...");
                continue;
              }

              const buttonText = await page.evaluate(el => el.textContent.trim(), button);

              if (buttonText !== "Following") continue;

              log.info(`Unfollowing user #${unfollowedCount + 1}`);

              try {
                await button.click(); // Click the “Following” button
                log.info("Clicked unfollow button...");

                // Wait for confirm dialog
                await page.waitForSelector('button._a9--', { visible: true, timeout: 5000 });
                const confirmButtons = await page.$$('button._a9--');
                if (confirmButtons.length > 0) {
                  await confirmButtons[0].click();
                  log.info("✅ Confirmed unfollow.");
                }
              } catch (err) {
                log.error("Error during unfollow action: " + err.message);
                continue;
              }

              unfollowedCount++;
              unfollowedUsers.add(buttonText);
              log.info(`Unfollowed ${unfollowedCount} users.`);

              // Delay before next
              await new Promise(res => setTimeout(res, UNFOLLOW_DELAY));
            }

            log.info("📜 Scrolling to load more users...");
            await page.evaluate(() => {
              const dialog = document.querySelector('div[role="dialog"] ._aano, div[role="dialog"] .isgrP');
              if (dialog) dialog.scrollBy(0, 400);
            });

            await new Promise(res => setTimeout(res, SCROLL_DELAY));
          } catch (error) {
            log.error("❌ Error during unfollow loop: " + error.message);
            break;
          }
        }

        log.info(`✅ Finished! Total unfollowed: ${unfollowedCount}`);
      }
    },

    failedRequestHandler: async ({ request, error }) => {
      log.error(`Request ${request.url} failed: ${error.message}`);
    },
  });

  // Add tasks
  await crawler.addRequests([
    { url: LOGIN_URL, userData: { label: "LOGIN" } },
    { url: FOLLOWING_URL, userData: { label: "UNFOLLOW" } },
  ]);

  await crawler.run();
})();
