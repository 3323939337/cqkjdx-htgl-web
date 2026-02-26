import type { Router } from 'vue-router';

import { preferences } from '@vben/preferences';
import { useAccessStore, useUserStore } from '@vben/stores';
import { startProgress, stopProgress } from '@vben/utils';

import { accessRoutes, coreRouteNames } from '#/router/routes';
import { useAuthStore } from '#/store';

import { generateAccess } from './access';

// ✅ 预留给大屏：没 token 时跳转到这里
// 建议你在 .env.development / .env.production 配一下：VITE_SSO_LOGIN_URL=...
const SSO_LOGIN_URL: string = import.meta.env.VITE_SSO_LOGIN_URL || '';

// ✅ 大屏跳转过来携带 token 的参数名，默认 token
// 可选配置：VITE_SSO_TOKEN_KEY=token
const SSO_TOKEN_KEY: string = import.meta.env.VITE_SSO_TOKEN_KEY || 'token';

function normalizeQueryValue(v: unknown): string {
  if (Array.isArray(v)) return typeof v[0] === 'string' ? v[0] : '';
  return typeof v === 'string' ? v : '';
}

function buildSsoLoginUrl(router: Router, to: any): string {
  if (!SSO_LOGIN_URL) return '';
  const target = `${window.location.origin}${router.resolve(to).href}`;
  const redirect = encodeURIComponent(target);
  return `${SSO_LOGIN_URL}${SSO_LOGIN_URL.includes('?') ? '&' : '?'}redirect=${redirect}`;
}

/**
 * 通用守卫配置
 * @param router
 */
function setupCommonGuard(router: Router) {
  const loadedPaths = new Set<string>();

  router.beforeEach((to) => {
    to.meta.loaded = loadedPaths.has(to.path);

    if (!to.meta.loaded && preferences.transition.progress) {
      startProgress();
    }
    return true;
  });

  router.afterEach((to) => {
    loadedPaths.add(to.path);

    if (preferences.transition.progress) {
      stopProgress();
    }
  });
}

/**
 * 权限访问守卫配置
 * @param router
 */
function setupAccessGuard(router: Router) {
  router.beforeEach(async (to, from) => {
    const accessStore = useAccessStore();
    const userStore = useUserStore();
    const authStore = useAuthStore();

    // 1) ✅ 先接住外部传进来的 token（query 里）
    const tokenFromQuery = normalizeQueryValue((to.query as any)?.[SSO_TOKEN_KEY]);
    if (tokenFromQuery) {
      // 不依赖任何你项目里“可能存在”的 setToken/getToken，直接写 store
      (accessStore as any).accessToken = tokenFromQuery;

      // ✅ 清掉 URL 里的 token，避免泄露（不使用 delete，避免 eslint 报错）
      const q = (to.query || {}) as Record<string, any>;
      const rest = Object.fromEntries(Object.entries(q).filter(([k]) => k !== SSO_TOKEN_KEY));

      return {
        path: to.path,
        query: rest,
        hash: to.hash,
        replace: true,
      };
    }

    // 2) ✅ 没 token：外跳到大屏登录页（后台没有登录页）
    if (!accessStore.accessToken) {
      // 如果你确实有某些页面要公开访问，可以给路由 meta.ignoreAccess = true
      if (to.meta.ignoreAccess) {
        return true;
      }

      const url = buildSsoLoginUrl(router, to);
      if (url) {
        window.location.replace(url);
      } else {
        // 没配登录地址时至少别死循环
        console.warn('[SSO] Missing VITE_SSO_LOGIN_URL, cannot redirect to screen login.');
      }
      return false;
    }

    // 3) 基本路由：通过
    if (coreRouteNames.includes(to.name as string)) {
      return true;
    }

    // 4) 已经生成过动态路由：通过
    if (accessStore.isAccessChecked) {
      return true;
    }

    // 5) 生成菜单和动态路由（保持你原有逻辑）
    try {
      const userInfo = userStore.userInfo || (await authStore.fetchUserInfo());
      const userRoles = userInfo.roles ?? [];

      const { accessibleMenus, accessibleRoutes } = await generateAccess({
        roles: userRoles,
        router,
        routes: accessRoutes,
      });

      accessStore.setAccessMenus(accessibleMenus);
      accessStore.setAccessRoutes(accessibleRoutes);
      accessStore.setIsAccessChecked(true);

      const redirectPath = (from.query.redirect ??
        (to.path === preferences.app.defaultHomePath
          ? userInfo.homePath || preferences.app.defaultHomePath
          : to.fullPath)) as string;

      return {
        ...router.resolve(decodeURIComponent(redirectPath)),
        replace: true,
      };
    } catch (e) {
      // token 无效/过期等：清掉后外跳大屏登录
      (accessStore as any).accessToken = '';
      const url = buildSsoLoginUrl(router, to);
      if (url) window.location.replace(url);
      return false;
    }
  });
}

/**
 * 项目守卫配置
 * @param router
 */
function createRouterGuard(router: Router) {
  setupCommonGuard(router);
  setupAccessGuard(router);
}

export { createRouterGuard };
