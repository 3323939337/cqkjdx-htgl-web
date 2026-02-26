import type { RouteRecordRaw } from 'vue-router';

import { $t } from '#/locales';

const routes: RouteRecordRaw[] = [
  {
    name: 'userPermissionManage',
    path: '/userPermissionManage',
    component: () => import('#/views/_core/userPermissionManage/index.vue'),
    meta: {
      icon: 'lucide:user',
      hideInMenu: false,
      title: $t('page.userPermissionManage.userPermissionManage'),
    },
  },
];

export default routes;
