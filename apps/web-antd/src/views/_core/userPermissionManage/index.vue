<script lang="ts" setup>
import type { VbenFormProps } from '#/adapter/form';
import type { VxeGridProps } from '#/adapter/vxe-table';

import { message } from 'ant-design-vue';

import { useVbenVxeGrid } from '#/adapter/vxe-table';

interface RowType {
  category: string;
  color: string;
  id: string;
  price: string;
  productName: string;
  releaseDate: string;
}

const formOptions: VbenFormProps = {
  // 默认展开
  collapsed: false,
  schema: [
    {
      component: 'Input',
      componentProps: {
        placeholder: '请输入用户名',
      },
      defaultValue: '',
      fieldName: 'userName',
      label: '用户名',
    },
    {
      component: 'Input',
      componentProps: {
        placeholder: '请输入姓名',
      },
      defaultValue: '',
      fieldName: 'realName',
      label: '姓名',
    },
    {
      component: 'Input',
      componentProps: {
        placeholder: '请输入邮箱',
      },
      defaultValue: '',
      fieldName: 'email',
      label: '邮箱',
    },
  ],
  // 控制表单是否显示折叠按钮
  showCollapseButton: false,
  submitButtonOptions: {
    content: '查询',
  },
  // 是否在字段值改变时提交表单
  submitOnChange: false,
  // 按下回车时是否提交表单
  submitOnEnter: false,
};

const gridOptions: VxeGridProps<RowType> = {
  checkboxConfig: {
    highlight: true,
    labelField: 'name',
  },
  columns: [
    // { align: 'left', title: 'Name', type: 'checkbox', width: 100 },
    { field: 'userName', title: '用户名' },
    { field: 'realName', title: '姓名' },
    { field: 'role', title: '角色' },
    { field: 'email', title: '邮箱' },
    { field: 'department', title: '部门' },
    { field: 'createTime', title: '创建时间' },
    // { field: 'releaseDate', formatter: 'formatDateTime', title: 'Date' },
  ],
  keepSource: true,
  pagerConfig: {},
  proxyConfig: {
    ajax: {
      query: async ({ page }, formValues) => {
        message.success(`Query params: ${JSON.stringify(formValues)}`);
        return [];
      },
    },
  },
  toolbarConfig: {
    // 是否显示搜索表单控制按钮
    // @ts-ignore 正式环境时有完整的类型声明
    search: true,
  },
};

const [Grid] = useVbenVxeGrid({ formOptions, gridOptions });
</script>

<template>
  <div class="vp-raw w-full">
    <Grid />
  </div>
</template>
