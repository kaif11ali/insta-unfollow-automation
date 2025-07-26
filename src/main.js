// Import required modules
import { Actor } from "apify";
import { PuppeteerCrawler } from "crawlee";
import { router } from "./routes.js";

// Initialize the Actor
await Actor.init();

// Input configuration
const input = await Actor.getInput();
const startUrls = input?.startUrls || [
    {
        url: "https://www.instagram.com/animbrozz/",
        label: "LOGIN_PAGE",
    },
];

// Create proxy configuration
const proxyConfiguration = await Actor.createProxyConfiguration();

// Configure PuppeteerCrawler
const crawler = new PuppeteerCrawler({
    proxyConfiguration,
    requestHandler: router,
    launchContext: {
        launchOptions: {
            args: ["--no-sandbox"],
            headless: false,
        },
    },
});

// Run the crawler with start URLs
await crawler.run(startUrls);

// Exit the Actor
await Actor.exit();
