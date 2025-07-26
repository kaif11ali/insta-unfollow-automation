import { createPuppeteerRouter } from "crawlee";

// Create a router instance
export const router = createPuppeteerRouter();

// Handler for logging into Instagram
router.addHandler("LOGIN_PAGE", async ({ page, log }) => {
    log.info("Navigating to Instagram login page...");

    try {
        // Click the login button or navigate to login directly
        await page.waitForSelector('[class="x1n2onr6"] a', { visible: true });
        await page.click('[class="x1n2onr6"] a');
        await page.waitForTimeout(2000);

        // Navigate through the menu
        await page.waitForSelector(
            'section[class="xc3tme8 x1xdureb x18wylqe x13vxnyz xvxrpd7"] ul li:nth-of-type(3)',
            { visible: true },
        );
        await page.click(
            'section[class="xc3tme8 x1xdureb x18wylqe x13vxnyz xvxrpd7"] ul li:nth-of-type(3)',
        );
        await page.waitForTimeout(2000);

        // Click a button to confirm
        await page.waitForSelector('button[type="button"]', { visible: true });
        await page.click('button[type="button"]');
        await page.waitForTimeout(2000);

        // Confirm the unfollow action
        await page.waitForSelector('button[class="_a9-- _ap36 _a9-_"]', {
            visible: true,
        });
        await page.click('button[class="_a9-- _ap36 _a9-_"]');
        await page.waitForTimeout(2000);

        log.info("Unfollowing action completed.");
    } catch (error) {
        log.error(
            "An error occurred during the login/unfollow process:",
            error,
        );
    }
});

// Default handler for unrecognized routes
router.addDefaultHandler(async ({ request, log }) => {
    log.warning(`No handler found for URL: ${request.url}`);
});
