<script lang="ts" setup>
import type { VbenFormProps } from '#/adapter/form';
import { useVbenForm } from '#/adapter/form';
import type { VxeGridProps } from '#/adapter/vxe-table';
import { Button } from 'ant-design-vue';
import { Modal, message } from 'ant-design-vue';
import {
  DeleteOutlined,
  EditOutlined,
  PlusOutlined,
} from '@ant-design/icons-vue';
import { useVbenModal } from '@vben/common-ui';
import { useVbenVxeGrid } from '#/adapter/vxe-table';

interface UserRow {
  id: string;
  userName: string;
  realName: string;
  role: string;
  email: string;
  department: string;
  createTime: string; // YYYY-MM-DD
}
const mockAll: UserRow[] = [
  {
    id: '1',
    userName: 'admin',
    realName: '系统管理员',
    role: '超级管理员',
    email: 'admin@example.com',
    department: '信息技术部',
    createTime: '2024-01-01',
  },
  {
    id: '2',
    userName: 'teacher_wang',
    realName: '王老师',
    role: '教师',
    email: 'wang@example.com',
    department: '石油工程系',
    createTime: '2024-02-15',
  },
  {
    id: '3',
    userName: 'student_zhang',
    realName: '张三',
    role: '学生',
    email: 'zhang@example.com',
    department: '石油工程系',
    createTime: '2024-03-10',
  },
];

const formOptions: VbenFormProps = {
  collapsed: false,
  schema: [
    {
      component: 'Input',
      componentProps: { placeholder: '请输入用户名' },
      defaultValue: '',
      fieldName: 'userName',
      label: '用户名',
    },
    {
      component: 'Input',
      componentProps: { placeholder: '请输入姓名' },
      defaultValue: '',
      fieldName: 'realName',
      label: '姓名',
    },
    {
      component: 'Input',
      componentProps: { placeholder: '请输入邮箱' },
      defaultValue: '',
      fieldName: 'email',
      label: '邮箱',
    },
  ],
  showCollapseButton: false,
  submitButtonOptions: { content: '查询' },
  submitOnChange: false,
  submitOnEnter: false,
};

function contains(a?: string, b?: string) {
  if (!b) return true;
  return (a ?? '').toLowerCase().includes(b.toLowerCase());
}

const gridOptions: VxeGridProps<UserRow> = {
  columns: [
    { field: 'userName', title: '用户名' },
    { field: 'realName', title: '姓名' },
    { field: 'role', title: '角色' },
    { field: 'email', title: '邮箱' },
    { field: 'department', title: '部门' },
    { field: 'createTime', title: '创建时间' },
    {
      title: '操作',
      width: 120,
      fixed: 'right',
      slots: { default: 'action' },
    },
  ],
  keepSource: true,
  pagerConfig: {
    pageSize: 20,
    pageSizes: [20, 50, 100],
  },

  // ✅ 关键：Vben Vxe Table 的 remote 模式默认读取 { items, total }
  proxyConfig: {
    ajax: {
      query: async ({ page }, formValues) => {
        const userName = (formValues?.userName as string | undefined) ?? '';
        const realName = (formValues?.realName as string | undefined) ?? '';
        const email = (formValues?.email as string | undefined) ?? '';

        const filtered = mockAll.filter((u) => {
          return (
            contains(u.userName, userName) &&
            contains(u.realName, realName) &&
            contains(u.email, email)
          );
        });

        const currentPage = page?.currentPage ?? 1;
        const pageSize = page?.pageSize ?? 20;
        const start = (currentPage - 1) * pageSize;
        const end = start + pageSize;

        return {
          items: filtered.slice(start, end),
          total: filtered.length,
        };
      },
    },
  },

  // ✅ 关键：要显示 toolbar，得把 toolbarConfig 配出来（custom/refresh/zoom 随便开一个也行）
  // toolbarConfig: {
  //   custom: true,
  //   refresh: true,
  //   zoom: true,
  //   // @ts-ignore vben 官方文档里就是这样用
  //   search: true,
  // },
};

const [Grid] = useVbenVxeGrid({ formOptions, gridOptions });
const [BaseForm, formApi] = useVbenForm({
  // 所有表单项共用，可单独在表单内覆盖
  commonConfig: {
    // 所有表单项
    componentProps: {
      class: 'w-full',
    },
  },
  // 提交函数
  handleSubmit: onSubmit,
  // 垂直布局，label和input在不同行，值为vertical
  // 水平布局，label和input在同一行
  layout: 'horizontal',
  schema: [
    {
      component: 'Input',
      // 对应组件的参数
      componentProps: {
        placeholder: '请输入用户名',
      },
      // 字段名
      fieldName: 'userName',
      // 界面显示的label
      label: '用户名',
    },
    {
      component: 'Input',
      // 对应组件的参数
      componentProps: {
        placeholder: '请输入姓名',
      },
      // 字段名
      fieldName: 'realName',
      // 界面显示的label
      label: '姓名',
    },
    {
      component: 'Select',
      componentProps: {
        allowClear: true,
        filterOption: true,
        options: [
          {
            label: '学生',
            value: 1,
          },
          {
            label: '教师',
            value: 2,
          },
          {
            label: '超级管理员',
            value: 3,
          },
        ],
        placeholder: '请选择角色',
        showSearch: true,
      },
      fieldName: 'role',
      label: '角色',
    },
    {
      component: 'Input',
      // 对应组件的参数
      componentProps: {
        placeholder: '请输入邮箱',
      },
      // 字段名
      fieldName: 'email',
      // 界面显示的label
      label: '邮箱',
    },
    {
      component: 'Input',
      // 对应组件的参数
      componentProps: {
        placeholder: '请输入部门',
      },
      // 字段名
      fieldName: 'department',
      // 界面显示的label
      label: '部门',
    },
  ],
  showDefaultActions: false,
  wrapperClass: 'grid-cols-1',
});
function onSubmit(values: Record<string, any>) {
  message.success({
    content: `form values: ${JSON.stringify(values)}`,
  });
}
const [AddModal, addModalApi] = useVbenModal({
  title: '添加用户',
  async onConfirm() {
    // 锁住弹窗（确认按钮 loading + 禁止关闭），避免点了就关
    addModalApi.lock(true);

    const { valid } = await formApi.validate(); // vben formApi.validate() 会返回 valid（常用写法）
    if (!valid) {
      addModalApi.unlock();
      return;
    }

    // ✅ 这里拿到表单值
    const values = await formApi.getValues();

    console.log('提交的数据：', values);

    // TODO: 调接口保存...
    // await api.save(values)

    addModalApi.close();
  },
});
function onAddUser() {
  // message.info('点击了添加用户（这里接弹窗/抽屉）');
  addModalApi.open();
}

function onEdit(row: UserRow) {
  const values = {
    userName: row.userName,
    realName: row.realName,
    role: row.role === '学生' ? 1 : row.role === '教师' ? 2 : 3,
    email: row.email,
    department: row.department,
  };
  formApi.setValues(values);
  addModalApi.open();
}

function onDelete(row: UserRow) {
  Modal.confirm({
    title: '确认删除？',
    content: `将删除用户「${row.userName}」`,
    okText: '删除',
    okType: 'danger',
    cancelText: '取消',
    onOk: () => {
      message.success('已删除（这里接真实删除接口即可）');
    },
  });
}
</script>

<template>
  <div class="vp-raw w-full">
    <Grid>
      <template #form-submit-before>
        <span class="add-user-wrap">
          <Button type="primary" @click="onAddUser">
            <template #icon><PlusOutlined /></template>
            添加用户
          </Button>
        </span>
      </template>
      <template #action="{ row }">
        <a-space :size="10">
          <a-button
            type="text"
            @click="onEdit(row)"
            style="padding: 0; color: #155dfc; font-size: 1rem"
          >
            <EditOutlined />
          </a-button>
          <a-button
            type="text"
            @click="onDelete(row)"
            style="padding: 0; color: red; margin-left: 0.5vw; font-size: 1rem"
          >
            <DeleteOutlined />
          </a-button>
        </a-space>
      </template>
    </Grid>
  </div>
  <AddModal class="w-[600px]" title="添加用户">
    <BaseForm />
  </AddModal>
</template>
<style scoped>
.add-user-wrap {
  order: 99;
}
</style>
