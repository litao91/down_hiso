const { chromium } = require('playwright');
const axios = require('axios');

const { exec } = require("child_process");

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

var fs = require('fs');
const request = require('request')
const download = (url, path, callback) => {
  request.head(url, (err, res, body) => {
    request(url)
      .pipe(fs.createWriteStream(path))
      .on('close', callback)
  })
}



async function handleInnerItem(inner, context, parent_title) {
  var parent = await inner.$('xpath=..');
  var title = (await parent.innerText()).split("\n")[1];
  await inner.click();
  await sleep(5000);
  var page = context.pages()[context.pages().length - 1];
  let url = await page.url();
  page.goto(url);
  var video_json_url = '';
  page.on('request', request => {
    var req_url = request.url();
    if (req_url.indexOf("download?csrf_token") != -1) {
      video_json_url = req_url;
    }
  });
  for (var i = 0; i < 10; i++) {
    await sleep(5000)
    if (video_json_url.indexOf("http")!=-1) {
      await page.goto(video_json_url);
      var pre = await page.$("pre");
      var text = await pre.innerText();
      var parsed = JSON.parse(text);
      var videoUrl = parsed.data.videoUrl
      console.log(title + "|" + videoUrl);
      download(videoUrl, "kuaiji_downloaded/" + parent_title + "-" + title + ".mp4", function() { });
      break;
    }
  }
  page.close()
}

async function handleItem(item, context, parent_title) {
  var parent = (await item.$('xpath=..'));
  var title = (await parent.innerText()).split("\n")[0];
  await item.click();
  await sleep(5000);
  var pages = context.pages()
  var inner_page = pages[pages.length - 1];

  var items_inner = await inner_page.$$('text="开始学习"');
  var items_inner_c = await inner_page.$$('text="继续学习"');
  for (var i = 0; i < items_inner_c.length; i++) {
    items_inner.push(items_inner_c[i]);
  }
  for (var i = 0; i < items_inner.length; i++) {
    var item_inner = items_inner[i];
    await handleInnerItem(item_inner, context, parent_title + "-" + title);
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
        await handleItem(item, context, sessions[i] + "-" + years[k]);
      }
    }
  }
  await page.close();
  await browser.close();
})();
