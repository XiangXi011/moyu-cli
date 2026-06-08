import { cli } from '@jackwener/opencli/registry';
cli({
    site: 'moyu',
    name: 'groups',
    access: 'read',
    description: 'List available model groups with pricing ratios',
    domain: 'www.moyu.info',
    args: [],
    columns: ['name', 'description', 'ratio'],
    pipeline: [
        { navigate: 'https://www.moyu.info/console' },
        { evaluate: `(async () => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const uid = user.id;
  if (!uid) throw new Error('Not logged in');
  const res = await fetch('/api/user/self/groups', {
    credentials: 'include',
    headers: { 'Accept': 'application/json', 'Moyu-Ai-User': String(uid) }
  });
  const data = await res.json();
  if (!data.success) throw new Error(data.message || 'API error');
  const groups = data.data || {};
  return Object.entries(groups).map(([name, info]) => ({
    name,
    description: info.desc || '-',
    ratio: String(info.ratio ?? '-'),
  }));
})()
` },
    ],
});
