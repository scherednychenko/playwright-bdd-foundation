export interface NavigationTarget {
  key: string;
  path: string;
  title?: RegExp;
  readyText?: RegExp;
}

export const publicNavigationTargets: NavigationTarget[] = [
  {
    key: 'home',
    path: '/',
    title: /.+/,
  },
  {
    key: 'about',
    path: '/about',
    title: /about/i,
    readyText: /about/i,
  },
  {
    key: 'search',
    path: '/search',
    title: /search/i,
    readyText: /search/i,
  },
];

export function getNavigationTarget(key: string): NavigationTarget {
  const target = publicNavigationTargets.find((item) => item.key === key);
  if (!target) {
    const knownKeys = publicNavigationTargets.map((item) => item.key).join(', ');
    throw new Error(`Unknown navigation target "${key}". Known targets: ${knownKeys}`);
  }

  return target;
}
