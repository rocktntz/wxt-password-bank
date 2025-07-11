import { extractIpFromUrl } from "./popup/utils";
import { onMessage, sendMessage } from "webext-bridge/background";

// 存储正在登录的标签页
const loggingInTabs = new Set<number>();
let currentUrl = "";
let newUrl = "" as any;

export default defineBackground(() => {
  // browser.runtime.onInstalled.addListener(async (details) => {
  //   if (details.reason === "install") {
  //   }
  // });
  // 监听来自 content-script 的点击消息
  onMessage("login-button-clicked", (data) => {
    currentUrl = (data.data as any)?.currentUrl;
    const tabId = data.sender.tabId;
    loggingInTabs.add(tabId);
    console.log(`检测到登录按钮点击，标签页ID: ${tabId}`, data);
    return {
      response: `Hi there from background! Your id is ${browser.runtime.id}`,
    };
  });

  // 监听URL变化
  browser.tabs.onUpdated.addListener((tabId, changeInfo) => {
    console.log("URL变化:", tabId, changeInfo);

    if (loggingInTabs.has(tabId)) {
      if (changeInfo.url) {
        newUrl = new URL(changeInfo.url);
        // 简单的登录成功判断逻辑 - 可根据实际需求调整
        if (currentUrl !== newUrl) {
          loggingInTabs.delete(tabId);
          sendMessage(
            "show-remember-notification",
            {
              message: "Hello from background!",
              data: {
                id: browser.runtime.id,
              },
            },
            `content-script@${tabId}`
          );
        }
      }
    }
  });

  // Chrome/Edge 或使用 WXT 的跨浏览器 API
  browser.tabs.onActivated.addListener((activeInfo) => {
    browser.tabs.get(activeInfo.tabId).then((tab) => {
      // console.log("当前活动标签页网址:", tab.url);
      browser.storage.local.get("global_password_bank").then((res) => {
        const global_password_bank = res.global_password_bank
          ? JSON.parse(res.global_password_bank)
          : [];
        console.log("当前密码库:", global_password_bank);
        const count =
          global_password_bank.filter(
            (item: any) =>
              item.p === tab.title ||
              item.a.some((urlObj: any) =>
                urlObj.l?.includes(extractIpFromUrl(tab.url as any) || tab.url)
              )
          )?.length || 0;
        browser.action.setBadgeText({
          text: count > 99 ? "99+" : count === 0 ? "" : count.toString(), // 要显示的数字（字符串形式）
          // text: "1",
        });
        // 设置徽章背景颜色
        browser.action.setBadgeBackgroundColor({
          color: "#FF0000", // 红色背景
        });
        // 文字颜色
        browser.action.setBadgeTextColor({
          color: "#FFFFFF", // 白色文字
        });
      });
    });
  });
});
