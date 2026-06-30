const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  // Set viewport to mobile first since it's the focus
  await page.setViewportSize({ width: 390, height: 844 });

  // Open the local file
  const path = require('path');
  const filePath = `file://${path.resolve('index.html')}`;
  await page.goto(filePath);

  console.log('Page title:', await page.title());

  // Take screenshot of the intro
  await page.screenshot({ path: 'intro-mobile.png' });

  // Click skip intro to see the main content
  const skipBtn = await page.$('#skip-intro');
  if (skipBtn) {
    await skipBtn.click();
    await page.waitForTimeout(1000); // Wait for transition
    await page.screenshot({ path: 'hero-mobile.png' });
  }

  // Scroll to story
  await page.evaluate(() => document.getElementById('story').scrollIntoView());
  await page.waitForTimeout(500);
  await page.screenshot({ path: 'story-mobile.png' });

  // Scroll to timeline
  await page.evaluate(() => document.getElementById('timeline').scrollIntoView());
  await page.waitForTimeout(500);
  await page.screenshot({ path: 'timeline-mobile.png' });

  // Desktop view
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(filePath);
  if (skipBtn) {
    await skipBtn.click();
    await page.waitForTimeout(1000);
  }
  await page.screenshot({ path: 'hero-desktop.png' });

  await browser.close();
})();
