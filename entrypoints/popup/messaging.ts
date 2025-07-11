import { defineExtensionMessaging } from "@webext-core/messaging";

interface MessageMap {
  saveInfo(data: any): any;
  autofill(data: any): any;
  // 异步消息示例
  asyncFetchData: {
    request: any;
    response: Promise<any>; // 显式声明返回 Promise
  };
}

export const { sendMessage, onMessage } =
  defineExtensionMessaging<MessageMap>();
