<template>
  <div id="password-bank-container">
    <div class="password-bank-notification" v-if="showNotification">
      <span
        class="password-bank-notification-close"
        @click="showNotification = false"
        >x</span
      >
      <div class="password-bank-notification-content">
        <img src="@/assets/logo.png" alt="" />
        <div>{{ infoTxt }}</div>
      </div>
      <div>
        <div
          class="password-bank-notification-btn"
          @click="save"
          v-if="infoTxt === '是否保存登录信息？'"
        >
          保存
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { sendMessage, onMessage } from "webext-bridge/content-script";
import {
  isActualLoginButton,
  findAuthFields,
} from "../entrypoints/popup/login-detector";
import { extractIpFromUrl } from "../entrypoints/popup/utils";
import { obfuscatePasswordBank } from "../entrypoints/popup/encrypt";

const infoTxt = ref("是否保存登录信息？");
const showNotification = ref(false);
const save = () => {
  infoTxt.value = "保存中...";
  const obfuscateItem = obfuscatePasswordBank([loginData])[0];
  const type = "add";
  browser.storage.local.get("global_password_bank").then((res) => {
    const global_password_bank = res.global_password_bank
      ? JSON.parse(res.global_password_bank)
      : [];
    if (type === "add") {
      if (
        global_password_bank.some(
          (item: any) =>
            item.p === obfuscateItem.p && item.u === obfuscateItem.u
        )
      ) {
        infoTxt.value = "已存在该登录信息！";
      } else {
        global_password_bank.push(obfuscateItem);
        // 异步保存更新后的密码库数据
        browser.storage.local
          .set({
            global_password_bank: JSON.stringify(global_password_bank),
          })
          .then(() => {
            infoTxt.value = "保存成功！";
          });
      }
    }
  });
};
const loginData = reactive({
  id: "" as any,
  projectName: "" as any,
  username: "",
  password: "",
  autofillUrlList: [] as any,
});
// chrome.runtime加载完成
onMounted(() => {
  // 监听所有按钮点击事件
  document.addEventListener("click", (event) => {
    const target = event.target as HTMLElement;
    if (isActualLoginButton(target)) {
      const { username, password } = findAuthFields();
      if (username && password) {
        loginData.id = Date.now();
        loginData.projectName = document.title as any;
        loginData.username = username?.value;
        loginData.password = password?.value;
        loginData.autofillUrlList[0] = {
          url: window.location.href,
        };
        sendMessage(
          "login-button-clicked",
          {
            currentUrl: window.location.href,
          },
          "background"
        );
      }
    }
  });

  onMessage("show-remember-notification", (data) => {
    browser.storage.local.get("global_password_bank").then((res) => {
      const global_password_bank = res.global_password_bank
        ? JSON.parse(res.global_password_bank)
        : [];
      const obfuscateItem = obfuscatePasswordBank([loginData])[0];
      if (
        global_password_bank.some((item: any) => item.p === obfuscateItem.p)
      ) {
        return;
      } else {
        infoTxt.value = "是否保存登录信息？";
        showNotification.value = true;
        setTimeout(() => {
          showNotification.value = false;
        }, 5000);
      }
    });
  });

  onMessage("auto-fill", (data) => {
    autofill(data.data);
  });
});

const autofill = (data: any) => {
  const { username, password } = findAuthFields();
  // 定义一个通用函数来处理输入框的操作
  const handleInput = (input: HTMLInputElement | null, value: string) => {
    if (input) {
      input.value = value;
      // 触发输入事件（模拟用户输入）
      const inputEvent = new Event("input", { bubbles: true });
      input.dispatchEvent(inputEvent);
      // 触发 change 事件
      const changeEvent = new Event("change", { bubbles: true });
      input.dispatchEvent(changeEvent);
      // 添加类型实现特效
      input.classList.add("password-bank-shake-text");
      setTimeout(() => {
        input.classList.remove("password-bank-shake-text");
      }, 600);
    }
  };
  // 调用通用函数处理用户名和密码输入框
  handleInput(username, data.username);
  handleInput(password, data.password);
};
</script>

<style>
/* #password-bank-container {
} */
.password-bank-shake-text {
  animation: shake 0.6s;
}

@keyframes shake {
  0%,
  100% {
    transform: translate(0, 0);
  }
  10%,
  30%,
  50%,
  70%,
  90% {
    transform: translate(-4px, 0);
  }
  20%,
  40%,
  60%,
  80% {
    transform: translate(4px, 0);
  }
}

.password-bank-notification {
  width: 260px;
  height: 100px;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  padding: 20px;
  text-align: center;
  z-index: 9999;
  animation: shake 0.6s;
  animation-fill-mode: both;
  animation-delay: 0.5s;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  color: #333;
  font-size: 16px;
  font-weight: 500;
  /* transition: all 0.3s ease-in-out;
  opacity: 0;
  visibility: hidden;
  transform: translateY(-20px);
  animation-name: fadeIn;
  animation-duration: 0.5s;
  animation-fill-mode: forwards;
  animation-timing-function: ease-in-out;
  animation-delay: 0.5s;
  animation-iteration-count: 1;
  animation-direction: normal;
  animation-play-state: running;
  animation-fill-mode: both; */
  position: fixed;
  top: 20px;
  right: 20px;
}

.password-bank-notification img {
  width: 24px;
  height: 24px;
  margin-right: 5px;
}

.password-bank-notification .password-bank-notification-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.password-bank-notification .password-bank-notification-close {
  position: absolute;
  top: 0px;
  right: 16px;
  cursor: pointer;
  font-size: 20px;
  color: #333;
}

.password-bank-notification-btn {
  padding: 2px 16px;
  border-radius: 20px;
  cursor: pointer;
  background: #409eff;
  color: #fff;
  margin-top: 8px;
}
</style>
