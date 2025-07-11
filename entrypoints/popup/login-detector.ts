// 改进后的登录按钮检测
function isLoginButton(element: HTMLElement): boolean {
  const buttonText = (element.textContent || "").toLowerCase().trim();
  const buttonValue = (element.getAttribute("value") || "")
    .toLowerCase()
    .trim();
  const buttonId = (element.id || "").toLowerCase();
  const buttonClass = (element.className || "").toLowerCase();

  // 精确匹配登录相关文本
  const loginKeywords = [
    "login",
    "sign in",
    "log in",
    "登录",
    "登入",
    "登陆",
    "进入",
    "signin",
    "signIn",
    "SignIn",
    "Signin",
    "Sign In",
  ];
  const logoutKeywords = [
    "logout",
    "sign out",
    "log out",
    "退出",
    "登出",
    "signout",
  ];

  // 检查是否是退出按钮
  const isLogout = logoutKeywords.some(
    (keyword) =>
      buttonText.includes(keyword) ||
      buttonValue.includes(keyword) ||
      buttonId.includes(keyword) ||
      buttonClass.includes(keyword)
  );

  if (isLogout) return false;

  // 检查是否是登录按钮
  return loginKeywords.some(
    (keyword) =>
      buttonText.includes(keyword) ||
      buttonValue.includes(keyword) ||
      buttonId.includes(keyword) ||
      buttonClass.includes(keyword)
  );
}

// 更智能的表单按钮检测
function isLoginFormButton(button: HTMLElement): boolean {
  // 检查按钮是否在表单中
  const form = button.closest("form");
  if (!form) return false;

  // 检查表单是否有登录相关属性
  const formId = (form.id || "").toLowerCase();
  const formClass = (form.className || "").toLowerCase();
  const formAction = (form.getAttribute("action") || "").toLowerCase();

  const loginFormIndicators = [
    "login",
    "signin",
    "auth",
    "authenticate",
    "session",
    "account",
    "用户",
    "账户",
  ];

  return loginFormIndicators.some(
    (indicator) =>
      formId.includes(indicator) ||
      formClass.includes(indicator) ||
      formAction.includes(indicator)
  );
}

export function isActualLoginButton(element: HTMLElement): boolean {
  // 首先检查是否是按钮元素
  const tagName = element.tagName.toLowerCase();
  if (!["button", "input", "a", "span", "div"].includes(tagName)) return false;
  // 检查文本和表单属性
  return isLoginButton(element) || isLoginFormButton(element);
}

// 基于标准HTML5自动填充属性的启发式匹配
// 基于常见命名模式的启发式匹配
const heuristicMatch = () => {
  const inputs = document.querySelectorAll("input");
  const candidates = {
    username: [],
    password: [],
  } as any;

  inputs.forEach((input) => {
    const name = (input.name || "").toLowerCase();
    const id = (input.id || "").toLowerCase();

    // 用户名匹配规则
    if (
      /user|name|username|userName|login|email|account|id|phone/.test(name) ||
      /user|name|username|userName|login|email|account|id|phone/.test(id)
    ) {
      candidates.username.push(input);
    }

    // 密码匹配规则
    if (
      /pass|pwd|password|secret/.test(name) ||
      /pass|pwd|password|secret/.test(id)
    ) {
      candidates.password.push(input);
    }
  });

  return candidates;
};
// 基于常见登录表单的视觉特征
const visualRecognition = () => {
  // 查找常见的登录按钮文本
  const loginButtons = [
    ...document.querySelectorAll('button, input[type="submit"]'),
  ].filter((btn) =>
    /login|sign in|log in|enter|continue|next/i.test(
      btn.textContent || btn.getAttribute("value") || ""
    )
  );
  // 在登录按钮附近查找输入框
  return loginButtons
    .map((btn) => {
      const form = btn.closest("form");
      if (form) {
        const inputs = form.querySelectorAll("input");
        return {
          form,
          username: inputs[0],
          password: inputs[1],
        };
      }
      return null;
    })
    .filter(Boolean);
};
export const findAuthFields = () => {
  // 按优先级尝试各种策略
  const strategies = [
    // 1. 标准HTML5自动填充属性
    () => {
      const username = document.querySelector('input[autocomplete="username"]');
      const password = document.querySelector(
        'input[autocomplete="current-password"]'
      );
      if (username && password) return { username, password };
    },

    // 2. 标准输入类型
    () => {
      const username = document.querySelector(
        'input[type="email"], input[type="text"][name*="user"]'
      );
      const password = document.querySelector('input[type="password"]');
      if (username && password) return { username, password };
    },

    // 3. 表单结构分析
    () => {
      const forms = document.querySelectorAll("form");
      // 可能没有表单
      if (forms.length) {
        for (const form of forms) {
          const inputs = [...form.querySelectorAll("input")];
          if (inputs.length >= 2) {
            const password = inputs.find((i) => i.type === "password");
            if (password) {
              const username = inputs.find(
                (i) =>
                  i !== password &&
                  (i.type === "text" || i.type === "email") &&
                  !i.hidden
              );
              if (username) return { username, password };
            }
          }
        }
      } else {
        const inputs = [...document.querySelectorAll("input")];
        if (inputs.length >= 2) {
          const password = inputs.find((i) => i.type === "password");
          if (password) {
            const username = inputs.find(
              (i) =>
                i !== password &&
                (i.type === "text" || i.type === "email") &&
                !i.hidden
            );
            if (username) return { username, password };
          }
        }
      }
    },

    // 4. 启发式匹配
    () => {
      const { username, password } = heuristicMatch();
      if (username.length && password.length) {
        return {
          username: username[0],
          password: password[0],
        };
      }
    },

    // 5. 视觉特征识别
    () => {
      const results = visualRecognition();
      if (results.length) return results[0];
    },
  ];

  // 按顺序尝试策略
  for (const strategy of strategies) {
    const result = strategy();
    if (result) return result;
  }

  return {
    username: null,
    password: null,
  };
};
