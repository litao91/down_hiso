const { chromium } = require('playwright');

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}


async function handleInnerItem(inner, context) {
  var parent = await inner.$('xpath=..');
  var title = (await parent.innerText()).split("\n")[1];
  await inner.click();
  var page = context.pages()[context.pages().length - 1];
  var download_audio = await page.$('text="下载音频"');
  await download_audio.click()
  var page_audio = context.pages()[context.pages().length - 1];
  var url = await page_audio.url()
  console.log(title + "|" + url)
  page.close();
  page_audio.close();

}

async function handleItem(item, context) {
  var parent = (await item.$('xpath=..'));
  var title = (await parent.innerText()).split("\n")[0];
  await item.click();
  var pages = context.pages()
  var inner_page = pages[pages.length - 1];

  var items_inner = await inner_page.$$('text="开始学习"');
  for (var i = 0; i < items_inner.length; i++) {
    var item_inner = items_inner[i];
    await handleInnerItem(item_inner, context);
  }
  inner_page.close();

}

(async () => {
  const browser = await chromium.launch({ headless: false, devtools: true });
  const context = await browser.newContext();
  const page = await context.newPage();
  await page.goto('https://www.haixue.com/v5/login');
  await page.fill('input[type="text"]', "18610924838");
  await page.fill('input[type="password"]', "lmj19910523!");
  await page.click("button");

  var sessions = ["会计", "财管", "审计", "税法", "经济法", "战略"];
  for (var i = 0; i < sessions.length; i++) {
    await page.click('text="' + sessions[i] + '"');
    console.log(sessions[i] + ' clicked');
    sleep(10000);
    var items = await page.$$('text="开始学习"')
    var items_c = await page.$$('text="继续学习"')
    for (var j = 0; j < items_c.length; j++) {
      items.push(items_c[j]);
    }
    console.log(items.length + " items found");
    for (var j = 0; j < items.length; j++) {
      var item = items[j];
      await handleItem(item, context);
      break;
    }
    break;
  }
  page.close();
})();
