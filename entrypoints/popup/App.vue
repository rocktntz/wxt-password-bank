<template>
  <div class="password-bank-container">
    <list
      ref="listRef"
      @handleInfo="handleInfo"
      @inputSearch="inputSearch"
      @autofill="autofill"
      :suggestList="suggestList"
      :passwordBankList="passwordBankList"
    />
    <addPopup
      ref="addPopupRef"
      :windowUrl="windowUrl"
      :windowTitle="windowTitle"
      @saveBtn="saveBtn"
    />
  </div>
</template>

<script lang="ts" setup>
import { ref, computed } from "vue";
import list from "@/components/list.vue";
import addPopup from "@/components/addPopup.vue";
import { extractIpFromUrl } from "./utils";
import { obfuscatePasswordBank, restorePasswordBank } from "./encrypt";
import { ElMessage } from "element-plus";
import { browser } from "wxt/browser";
import { sendMessage } from "webext-bridge/popup";

const addPopupRef = ref();
// 新增或者编辑
const handleInfo = (type: string, item: any) => {
  if (type === "edit" || type === "del") {
    addPopupRef.value.editItem(item, type);
  } else {
    addPopupRef.value.open();
  }
};
// 搜索
const inputSearch = async (value: string) => {
  if (value) {
    passwordBankList.value = passwordBankList.value.filter(
      (item) =>
        item.projectName.includes(value) || item.username.includes(value)
    );
  } else {
    passwordBankList.value = originalPasswordBankList.value;
  }
};

// 密码库
const passwordBankList = ref([] as any[]);
const originalPasswordBankList = ref([] as any[]);

// 自动填充列表
const findEntriesByUrl = (targetUrl: string) => {
  return passwordBankList.value.filter(
    (item) =>
      item.projectName === windowTitle.value ||
      item.autofillUrlList.some((urlObj: any) => urlObj.url.includes(targetUrl))
  );
};
const windowUrl = ref("" as any);
const windowTitle = ref("" as any);
const suggestList = computed(() => {
  if (!windowUrl.value) return [];
  return findEntriesByUrl(extractIpFromUrl(windowUrl.value) || windowUrl.value);
});

const getWindowUrl = async () => {
  browser.tabs.query({ active: true, currentWindow: true }).then((tabs) => {
    windowUrl.value = tabs[0].url;
    windowTitle.value = tabs[0].title;
    console.log("windowUrl", windowUrl.value, tabs[0]);
  });
};

// 自动填充
const autofill = async (item: any) => {
  // 获取当前活动标签页
  //popup 向 content 发送消息
  browser.tabs.query({ active: true, currentWindow: true }).then((tabs) => {
    // browser.tabs.sendMessage(tabs[0].id!, {
    //   type: "autofill",
    //   data: item,
    // });
    sendMessage("auto-fill", item, `content-script@${tabs[0].id}`);
  });
};

// 保存信息
const saveBtn = (item: any, type: string) => {
  const obfuscateItem = obfuscatePasswordBank([item])[0];
  if (["add", "edit", "del", "batchAdd"].includes(type)) {
    browser.storage.local.get("global_password_bank").then((res) => {
      const global_password_bank = res.global_password_bank
        ? JSON.parse(res.global_password_bank)
        : [];
      if (type === "add") {
        global_password_bank.push(obfuscateItem);
      }
      if (type === "batchAdd") {
        console.log(item);
        for (let index = 0; index < item.length; index++) {
          const element = item[index];
          global_password_bank.push(element);
        }
      }
      if (type === "edit" || type === "del") {
        const index = global_password_bank.findIndex(
          (item: any) => item.i === obfuscateItem.i
        );
        if (index !== -1) {
          type === "edit"
            ? (global_password_bank[index] = obfuscateItem)
            : global_password_bank.splice(index, 1);
        }
      }
      // 异步保存更新后的密码库数据
      browser.storage.local.set({
        global_password_bank: JSON.stringify(global_password_bank),
      });
    });
  }
};

const init = async () => {
  getWindowUrl(); // 调用函数获取当前窗口的 URL
  browser.storage.local.get("global_password_bank").then((res) => {
    passwordBankList.value = restorePasswordBank(
      res.global_password_bank ? JSON.parse(res.global_password_bank) : []
    );
    originalPasswordBankList.value = [...passwordBankList.value];
    console.log("passwordBankList", passwordBankList.value);
  });
};

onMounted(() => {
  nextTick(() => {
    init();
    // 监听变化
    browser.storage.onChanged.addListener((changes) => {
      console.log("changes", changes);
      init();
      addPopupRef.value.showAddDialog = false;
      addPopupRef.value.dialogVisible = false;
      ElMessage.success("操作成功！");
    });
  });
});
</script>

<style scoped>
.password-bank-container {
  width: 100%;
  height: 100%;
  position: relative;
}
</style>
