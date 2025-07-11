<template>
  <div class="password-bank-list">
    <div class="password-bank-title">
      <span class="password-bank-title-text">
        <img src="@/assets/logo.png" />
        密码库
      </span>
      <div class="password-bank-title-right">
        <div class="password-bank-btn" @click="addItem">
          <a href="#">＋新增</a>
        </div>
      </div>
    </div>

    <div class="password-bank-add-content">
      <div style="height: 100%">
        <div style="padding: 12px; height: calc(100% - 24px)">
          <el-input
            v-model="keyword"
            style="width: 100%; margin-bottom: 24px"
            size="large"
            placeholder="请输入"
            :prefix-icon="Search"
            clearable
            @input="changeKeyword"
          />

          <div style="height: calc(100% - 68px)">
            <el-scrollbar>
              <div
                v-for="item in [
                  {
                    title: '自动填充建议',
                    list: suggestList,
                  },
                  {
                    title: '所有项目',
                    list: passwordBankList,
                  },
                ]"
                :key="item.title"
              >
                <div
                  class="card-title1"
                  style="margin-bottom: 6px; font-weight: 700"
                  :style="
                    item.title === '所有项目' ? { marginTop: '16px' } : {}
                  "
                >
                  {{ item.title }}（{{ item.list.length }}）
                </div>
                <el-card
                  shadow="hover"
                  v-for="(i, index) in item.list"
                  :key="index + item.title"
                >
                  <div style="width: 100%; display: flex">
                    <div class="card-right" @click="openUrl(i)">
                      <div class="card-title1 ellipsisOne">
                        {{ i.projectName }}
                      </div>
                      <div class="card-title2 ellipsisOne">
                        {{ i.username }}
                      </div>
                    </div>
                    <div class="card-left">
                      <div class="autofill-btn" @click="autofill(i)">填充</div>

                      <el-popover
                        class="box-item"
                        placement="bottom"
                        width="100"
                      >
                        <template #reference>
                          <div class="autofill-btn">设置</div>
                        </template>
                        <div
                          class="popover-item"
                          @click="copyItem(i, 'username')"
                        >
                          复制用户名
                        </div>
                        <div
                          class="popover-item"
                          @click="copyItem(i, 'password')"
                        >
                          复制密码
                        </div>
                        <div class="popover-item" @click="editItem(i)">
                          编辑
                        </div>
                        <div class="popover-item" @click="delItem(i)">删除</div>
                      </el-popover>
                    </div>
                  </div>
                </el-card>

                <div
                  class="card-title2"
                  v-if="
                    item.title === '自动填充建议' && suggestList.length === 0
                  "
                >
                  为这个站点保存一个登录项目以自动填充
                </div>
              </div>
            </el-scrollbar>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, reactive } from "vue";
import { ElMessage } from "element-plus";
import { Search } from "@element-plus/icons-vue";

const props = defineProps({
  suggestList: {
    type: Array as () => any[],
    default: () => [],
  },
  passwordBankList: {
    type: Array as () => any[],
    default: () => [],
  },
});

const emit = defineEmits(["handleInfo", "inputSearch", "autofill"]);
// 新增按钮
const addItem = () => {
  emit("handleInfo", "add", "");
};
// 搜索框
const keyword = ref("");
const changeKeyword = (val: string) => {
  emit("inputSearch", val);
};
// 自动填充
const autofill = (item: any) => {
  emit("autofill", item);
};
// 复制用户名或密码
const copyItem = (item: any, type: string) => {
  navigator.clipboard.writeText(
    type === "username" ? item.username : item.password
  );
  const msg = type === "username" ? "用户名" : "密码";
  ElMessage.success(msg + "复制成功!");
};
// 编辑项目
const editItem = (item: any) => {
  emit("handleInfo", "edit", item);
};
// 删除项目
const delItem = (item: any) => {
  emit("handleInfo", "del", item);
};

const openUrl = (item: any) => {
  if (item.autofillUrlList.length > 0) {
    const url = item.autofillUrlList[0].url;
    browser.tabs.create({ url });
  }
};
</script>

<style scoped>
.password-bank-list {
  width: 100%;
  height: 100%;
  position: absolute;
  top: 0;
  z-index: 98 !important;
}
.password-bank-title {
  width: calc(100% - 32px);
  height: 48px;
  font-size: 22px;
  font-weight: 700;
  color: #000;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 16px;
  box-shadow: 0 4px 4px rgba(0, 0, 0, 0.1);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.password-bank-title-text {
  display: flex;
  align-items: center;
  cursor: pointer;
}

.password-bank-title-text img {
  display: block;
  width: 32px;
  height: 32px;
  border-radius: 50% 50%;
  margin-right: 4px;
}

.password-bank-title-right {
  font-size: 16px;
  color: #000;
}

.password-bank-btn {
  position: relative;
  top: 0;
  left: 0;
  width: 78px;
  height: 32px;
  margin: 0;
  display: flex;
  justify-content: center;
  align-items: center;
}

.password-bank-btn a {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  background: rgba(255, 255, 255, 0.05);
  box-shadow: 0 15px 15px rgba(0, 0, 0, 0.3);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 30px;
  padding: 10px;
  letter-spacing: 1px;
  text-decoration: none;
  overflow: hidden;
  color: #5e3b3b;
  font-weight: 400px;
  z-index: 1;
  transition: 0.5s;
  backdrop-filter: blur(15px);
  box-sizing: border-box;
}

.password-bank-btn:hover a {
  letter-spacing: 3px;
  color: #fff;
}

.password-bank-btn a::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  width: 50%;
  height: 100%;
  background: linear-gradient(to left, rgba(255, 255, 255, 0.15), transparent);
  transform: skewX(45deg) translate(0);
  transition: 0.5s;
  filter: blur(0px);
}

.password-bank-btn:hover a::before {
  transform: skewX(45deg) translate(200px);
}

.password-bank-btn::before {
  content: "";
  position: absolute;
  left: 50%;
  transform: translatex(-50%);
  bottom: 10px;
  width: 30px;
  height: 10px;
  background: #f00;
  border-radius: 10px;
  transition: 0.5s;
  transition-delay: 0.5;
}
.password-bank-btn:hover::before {
  bottom: 0;
  height: 50%;
  width: 80%;
  border-radius: 30px;
}
.password-bank-btn::after {
  content: "";
  position: absolute;
  left: 50%;
  transform: translatex(-50%);
  top: 10px;
  width: 30px;
  height: 10px;
  background: #f00;
  border-radius: 10px;
  transition: 0.5s;
  transition-delay: 0.5;
}

.password-bank-btn:hover::after {
  top: 0;
  height: 50%;
  width: 80%;
  border-radius: 30px;
}

.password-bank-btn::before,
.password-bank-btn::after {
  background: #2db2ff;
  box-shadow: 0 0 5px #2db2ff, 0 0 15px #2db2ff, 0 0 30px #2db2ff,
    0 0 60px #2db2ff;
}

.password-bank-add-content {
  width: 100%;
  height: calc(100% - 50px);
  background-color: #f2f5f8;
}

.el-scrollbar {
  height: 100%;
}

:deep(.el-card__body) {
  padding: 12px;
}

.card-right {
  width: calc(100% - 120px);
}
.card-left {
  width: 120px;
  display: flex;
  align-items: center;
  justify-content: space-around;
}

.autofill-btn {
  width: 42px;
  height: 26px;
  line-height: 26px;
  text-align: center;
  border: 1px solid #409eff;
  background-color: #d9e1f4;
  font-size: 12px;
  cursor: pointer;
  user-select: none;
  border-radius: 16px 16px;
}

.autofill-btn:hover {
  background-color: #409eff;
  color: #fff;
}

.card-title1 {
  font-size: 16px;
}

.card-title2 {
  color: #767980;
}

.popover-item {
  height: 26px;
  line-height: 26px;
  text-align: center;
  font-size: 12px;
  cursor: pointer;
}
.popover-item:hover {
  background-color: #f5f5f5;
  cursor: pointer;
}
.el-card {
  margin-bottom: 6px;
  cursor: pointer;
}
</style>
