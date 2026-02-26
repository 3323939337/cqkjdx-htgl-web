import type { RouteRecordRaw } from 'vue-router';

import { $t } from '#/locales';

const routes: RouteRecordRaw[] = [
  // {
  //   meta: {
  //     badgeType: 'dot',
  //     icon: VBEN_LOGO_URL,
  //     order: 9998,
  //     title: $t('demos.vben.title'),
  //   },
  //   name: 'VbenProject',
  //   path: '/vben-admin',
  //   children: [],
  // },
  // {
  //   name: 'VbenAbout',
  //   path: '/vben-admin/about',
  //   component: () => import('#/views/_core/about/index.vue'),
  //   meta: {
  //     icon: 'lucide:copyright',
  //     title: $t('demos.vben.about'),
  //     order: 9999,
  //   },
  // },
  {
    name: 'Profile',
    path: '/profile',
    component: () => import('#/views/_core/profile/index.vue'),
    meta: {
      icon: 'lucide:user',
      hideInMenu: true,
      title: $t('page.auth.profile'),
    },
  },
];

export default routes;
