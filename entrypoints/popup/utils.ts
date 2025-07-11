/**
 * 提取 URL 中的 IP 地址
 *
 * @param {string} url - URL
 * @returns {string | null} IP 地址，或者 null
 */
export const extractIpFromUrl = (url: string) => {
  try {
    // 使用 URL 对象解析
    const urlObj = new URL(url.startsWith("http") ? url : `http://${url}`);
    const baseUrl = `${urlObj.protocol}//${urlObj.host}`;
    return baseUrl;

    // // 获取主机名（可能包含端口）
    // let hostname = urlObj.hostname;
    // // 如果是 IPv6，去除方括号
    // if (hostname.startsWith("[") && hostname.endsWith("]")) {
    //   hostname = hostname.slice(1, -1);
    // }
    // // 验证是否是IP地址
    // const ipv4Regex = /^(?:\d{1,3}\.){3}\d{1,3}$/;
    // const ipv6Regex =
    //   /^(?:[a-fA-F0-9]{1,4}:){7}[a-fA-F0-9]{1,4}$|^(?:[a-fA-F0-9]{1,4}:){1,7}:|^(?:[a-fA-F0-9]{1,4}:){1,6}:[a-fA-F0-9]{1,4}$|^(?:[a-fA-F0-9]{1,4}:){1,5}(?::[a-fA-F0-9]{1,4}){1,2}$|^(?:[a-fA-F0-9]{1,4}:){1,4}(?::[a-fA-F0-9]{1,4}){1,3}$|^(?:[a-fA-F0-9]{1,4}:){1,3}(?::[a-fA-F0-9]{1,4}){1,4}$|^(?:[a-fA-F0-9]{1,4}:){1,2}(?::[a-fA-F0-9]{1,4}){1,5}$|^[a-fA-F0-9]{1,4}:(?:(?::[a-fA-F0-9]{1,4}){1,6})$|^:(?:(?::[a-fA-F0-9]{1,4}){1,7}|:)$/;

    // if (ipv4Regex.test(hostname) || ipv6Regex.test(hostname)) {
    //   return hostname;
    // }
    // return null;
  } catch (e) {
    return null;
  }
};
