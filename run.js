const { chromium } = require('playwright');

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}


async function handleInnerItem(inner, context) {
  var parent = await inner.$('xpath=..');
  var title = (await parent.innerText()).split("\n")[1];
  await inner.click();
  await sleep(2000);
  var page = context.pages()[context.pages().length - 1];
  await page.click('text="下载音频"');
  await sleep(2000);
  var page_audio = context.pages()[context.pages().length - 1];
  var url = await page_audio.url()
  console.log(title + "|" + url)
  await page_audio.close();
  await page.close();

}

async function handleItem(item, context) {
  var parent = (await item.$('xpath=..'));
  var title = (await parent.innerText()).split("\n")[0];
  await item.click();
  await sleep(2000);
  var pages = context.pages()
  var inner_page = pages[pages.length - 1];

  var items_inner = await inner_page.$$('text="开始学习"');
  var items_inner_c = await inner_page.$$('text="继续学习"');
  for (var i = 0; i < items_inner_c.length; i++) {
    items_inner.push(items_inner_c[i]);
  }
  for (var i = 0; i < items_inner.length; i++) {
    var item_inner = items_inner[i];
    await handleInnerItem(item_inner, context);
  }
  await inner_page.close();

}

(async () => {
  // const browser = await chromium.launch({ headless: false, devtools: true });
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();
  await page.goto('https://www.haixue.com/v5/login');
  await page.fill('input[type="text"]', "18610924838");
  await page.fill('input[type="password"]', "lmj19910523!");
  await page.click("button");

  var sessions = ["会计", "财管", "审计", "税法", "经济法", "战略"];
  // var sessions = ["刑法", "理论法学", "商经法", "民诉", "行政法", "刑诉", "三国法"];
  for (var i = 0; i < sessions.length; i++) {
    await page.click('text="' + sessions[i] + '"');
    await sleep(2000);
    console.log(sessions[i] + ' clicked');
    var years = ["2020考季", "2021考季"]
    for (var k = 0; k < years.length; k++) {
      await page.click('text="' + years[k] + '"');
      await sleep(2000);
      console.log(years[k] + ' clicked');
      var items = await page.$$('text="开始学习"')
      var items_c = await page.$$('text="继续学习"')
      for (var j = 0; j < items_c.length; j++) {
        items.push(items_c[j]);
      }
      console.log(items.length + " items found");
      for (var j = 0; j < items.length; j++) {
        var item = items[j];
        await handleItem(item, context);
      }
    }
  }
  await page.close();
  await browser.close();
})();
