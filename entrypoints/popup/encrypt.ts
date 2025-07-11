/**
 * 加密和解密数据
 */
import CryptoJS from "crypto-js";
import { ClientJS } from "clientjs";

export const SECRET_KEY = "your-secret-key-123"; // 实际项目中应该更复杂且安全存储
// 加密函数
export const encryptData = (data: any) => {
  return CryptoJS.AES.encrypt(JSON.stringify(data), SECRET_KEY).toString();
};

// 解密函数
export const decryptData = (ciphertext: any) => {
  const bytes = CryptoJS.AES.decrypt(ciphertext, SECRET_KEY);
  return JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
};

// 混淆字段名的映射表
export const FIELD_MAP = {
  id: "i",
  projectName: "p",
  username: "u",
  password: "pw",
  autofillUrlList: "a",
  url: "l",
};
// 混淆对象键名
export const obfuscateKeys = (obj: any) => {
  if (Array.isArray(obj)) {
    return obj.map(obfuscateKeys as any);
  } else if (obj !== null && typeof obj === "object") {
    const newObj = {} as any;
    for (const key in obj) {
      const newKey = FIELD_MAP[key as keyof typeof FIELD_MAP] || key;
      newObj[newKey] = obfuscateKeys(obj[key]);
    }
    return newObj;
  }
  return obj;
};

// 还原对象键名
export const restoreKeys = (obj: any) => {
  if (Array.isArray(obj)) {
    return obj.map(restoreKeys as any);
  } else if (obj !== null && typeof obj === "object") {
    const newObj = {} as any;
    for (const key in obj) {
      // 反转映射
      const originalKey =
        Object.keys(FIELD_MAP).find(
          (k) => FIELD_MAP[k as keyof typeof FIELD_MAP] === key
        ) || key;
      newObj[originalKey] = restoreKeys(obj[key]);
    }
    return newObj;
  }
  return obj;
};

// 完整混淆过程
export const obfuscatePasswordBank = (list: any[]) => {
  return list.map((item) => {
    // 加密密码字段
    const encryptedItem = {
      ...item,
      password: encryptData(item.password),
    };
    // 混淆键名
    return obfuscateKeys(encryptedItem);
  });
};

// 完整还原过程
export const restorePasswordBank = (obfuscatedList: any[]) => {
  return obfuscatedList.map((item) => {
    // 还原键名
    const restoredItem = restoreKeys(item);
    // 解密密码字段
    return {
      ...restoredItem,
      password: decryptData(restoredItem.password),
    };
  });
};
