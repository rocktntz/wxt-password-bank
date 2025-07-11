<template>
  <div
    class="password-bank-add-container"
    :class="showAddDialog ? 'add-container-show' : ''"
  >
    <div class="password-bank-title">
      <span class="password-bank-title-text" @click="showAddDialog = false">
        ← {{ operationType === "add" ? "新增" : "编辑" }} 登录
      </span>
    </div>

    <div class="password-bank-add-content">
      <div class="password-bank-add-content-container">
        <el-scrollbar>
          <div style="padding: 8px">
            <el-form
              ref="addRuleFormRef"
              style="max-width: 600px"
              :model="addRuleForm"
              :rules="rules"
              label-width="auto"
              label-position="top"
            >
              <el-form-item label="项目名：" prop="projectName">
                <el-input
                  v-model="addRuleForm.projectName"
                  placeholder="请输入"
                />
              </el-form-item>
              <el-form-item label="用户名：" prop="username">
                <el-input v-model="addRuleForm.username" placeholder="请输入" />
              </el-form-item>
              <el-form-item label="密码：" prop="password">
                <el-input
                  v-model="addRuleForm.password"
                  placeholder="请输入"
                  type="password"
                  show-password
                />
              </el-form-item>
              <el-form-item label="自动填充网址：" prop="autofillUrlList">
                <div style="display: flex; flex-direction: column; width: 100%">
                  <div
                    style="
                      display: flex;
                      justify-content: center;
                      align-items: center;
                      margin-bottom: 10px;
                    "
                    v-for="(item, index) in addRuleForm.autofillUrlList"
                  >
                    <el-input
                      placeholder="请输入网址"
                      :key="index"
                      v-model="item.url"
                    />
                    <div
                      style="margin-left: 8px; font-size: 24px; cursor: pointer"
                      @click="addRuleForm.autofillUrlList.splice(index, 1)"
                    >
                      -
                    </div>
                  </div>
                  <div>
                    <el-button type="primary" round @click="addUrl('')"
                      >+ 添加网址</el-button
                    >
                  </div>
                </div>
              </el-form-item>
            </el-form>
          </div>
        </el-scrollbar>
      </div>
      <div class="password-bank-add-content-bottom">
        <el-button type="primary" round @click="submitForm(addRuleFormRef)">{{
          type === "add" ? "保存" : "编辑"
        }}</el-button>
        <el-button round @click="cancel">取消</el-button>
        <el-button type="danger" round @click="del">删除</el-button>
      </div>
    </div>
  </div>
</template>
<script lang="ts" setup>
import { extractIpFromUrl } from "../entrypoints/popup/utils";
const props = defineProps({
  operationType: {
    type: String,
    default: "add",
  },
  windowUrl: {
    type: String,
    default: () => "",
  },
  windowTitle: {
    type: String,
    default: () => "",
  },
});

const showAddDialog = ref(false);
watch(
  () => showAddDialog.value,
  (newVal) => {
    if (newVal) {
      if (addRuleForm.autofillUrlList.length === 0) addUrl(props.windowUrl);
      addRuleForm.projectName = addRuleForm.projectName
        ? addRuleForm.projectName
        : props.windowTitle || "";
    }
  }
);

const rules = reactive({
  name: [
    {
      required: true,
      message: "请输入",
      trigger: "blur",
    },
  ],
  projectName: [
    {
      required: true,
      message: "请输入",
      trigger: "blur",
    },
  ],
  username: [
    {
      required: true,
      message: "请输入",
      trigger: "blur",
    },
  ],
  password: [
    {
      required: true,
      message: "请输入",
      trigger: "blur",
    },
  ],
});
const type = ref("add");
const addRuleFormRef = ref();
const addRuleForm = reactive({
  id: "" as any,
  projectName: "" as any,
  username: "",
  password: "",
  autofillUrlList: [] as any,
});
const restAddRuleForm = reactive({ ...addRuleForm });
const open = () => {
  Object.assign(addRuleForm, restAddRuleForm);
  showAddDialog.value = true;
  type.value = "add";
};
const addUrl = (url?: string) => {
  addRuleForm.autofillUrlList.push({
    url: url || "",
  });
};
const editItem = (item: any, t: string) => {
  type.value = t;
  Object.assign(addRuleForm, item);
  showAddDialog.value = true;
};

defineExpose({
  showAddDialog,
  open,
  editItem,
});

const emit = defineEmits(["saveBtn"]);
// 保存
const submitForm = async (formEl: any) => {
  if (!formEl) return;
  await formEl.validate((valid: any, fields: any) => {
    if (valid) {
      addRuleForm.autofillUrlList = addRuleForm.autofillUrlList.filter(
        (item: any) => item.url
      );
      addRuleForm.projectName = addRuleForm.projectName
        ? addRuleForm.projectName
        : extractIpFromUrl(props.windowUrl || "");

      addRuleForm.id = addRuleForm.id || Date.now();
      emit("saveBtn", addRuleForm, type.value);
    } else {
      console.log("error submit!", fields);
    }
  });
};

// 取消
const cancel = () => {
  Object.assign(addRuleForm, restAddRuleForm);
  showAddDialog.value = false;
};

const del = () => {
  emit("saveBtn", addRuleForm, type.value);
};
</script>
<style scoped>
.password-bank-add-container {
  background: #fff;
  width: 100%;
  height: 100%;
  position: absolute;
  top: 0;
  right: -380px;
  transition: right 0.5s ease-in-out;
  z-index: 99 !important;
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

.add-container-show {
  right: 0;
}

.password-bank-add-content {
  width: 100%;
  height: calc(100% - 50px);
  background-color: #f2f5f8;
}

.password-bank-add-content-container {
  width: 100%;
  background: #f7f8f9;
  height: calc(100% - 50px);
}

.password-bank-add-content-container .el-form-item {
  background-color: #fff;
  padding: 20px 12px;
  border-radius: 8px;
  box-shadow: 0px 0px 12px rgba(0, 0, 0, 0.12);
}

.password-bank-add-content-bottom {
  width: 100%;
  height: 50px;
  border-top: 1px solid #ededed;
  box-sizing: border-box;
  padding-left: 16px;
  display: flex;
  align-items: center;
  background-color: #fff;
}

.el-scrollbar {
  height: 100%;
}

.autofill-url-list {
  width: 100%;
  /* display: flex; */
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

.autofill-bnt {
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

.autofill-bnt:hover {
  background-color: #409eff;
  color: #fff;
}
</style>
