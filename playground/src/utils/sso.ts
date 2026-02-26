import { setToken } from './auth';

export function pickTokenFromUrlAndStore(router: any) {
  const tokenKey = import.meta.env.VITE_SSO_TOKEN_KEY || 'token';

  // 1) 先从 query 拿（常规 history 路由）
  const q = router.currentRoute.value?.query || {};
  const tokenFromQuery = q[tokenKey] as string | undefined;

  // 2) 兼容 hash 场景：/#/xxx?token=...
  const hash = window.location.hash || '';
  const hashQueryIndex = hash.indexOf('?');
  let tokenFromHashQuery: string | undefined;
  if (hashQueryIndex !== -1) {
    const search = hash.slice(hashQueryIndex + 1);
    const usp = new URLSearchParams(search);
    tokenFromHashQuery = usp.get(tokenKey) || undefined;
  }

  const token = tokenFromQuery || tokenFromHashQuery;
  if (!token) return;

  // ✅ 写入本地（vben 的 setToken 一般会落 localStorage/cookie）
  setToken(token);
  if (tokenFromQuery) {
    const newQuery = { ...q };
    const { [tokenKey]: _removed, ...rest } = newQuery;

    router.replace({ query: rest });
    return;
  }

  // 处理 hash query（hash 模式）
  if (tokenFromHashQuery) {
    const base = hash.slice(0, hashQueryIndex);
    window.location.hash = base;
  }
}
