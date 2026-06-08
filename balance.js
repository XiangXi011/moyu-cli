import { cli } from '@jackwener/opencli/registry';
cli({
    site: 'moyu',
    name: 'balance',
    access: 'read',
    description: 'Show account balance and usage statistics',
    domain: 'www.moyu.info',
    args: [],
    columns: ['metric', 'value'],
    pipeline: [
        { navigate: 'https://www.moyu.info/console' },
        { evaluate: `(async () => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const uid = user.id;
  if (!uid) throw new Error('Not logged in');
  const headers = { 'Accept': 'application/json', 'Moyu-Ai-User': String(uid) };
  const [selfRes, statRes] = await Promise.all([
    fetch('/api/user/self', { credentials: 'include', headers }),
    fetch('/api/log/self/stat', { credentials: 'include', headers }),
  ]);
  const self = await selfRes.json();
  const stat = await statRes.json();
  if (!self.success) throw new Error(self.message || 'API error');
  const d = self.data;
  const s = stat.data || {};
  return [
    { metric: 'Username', value: d.display_name },
    { metric: 'Email', value: d.email || '-' },
    { metric: 'Phone', value: d.phone || '-' },
    { metric: 'Group', value: d.group },
    { metric: 'Role', value: d.role === 1 ? 'Admin' : 'User' },
    { metric: 'Balance', value: '¥' + (d.quota / 1000000).toFixed(2) },
    { metric: 'Total Requests', value: String(d.request_count || 0) },
    { metric: 'Total Consumption', value: '¥' + ((s.quota || 0) / 1000000).toFixed(2) },
    { metric: 'Aff Code', value: d.aff_code || '-' },
    { metric: 'Aff Count', value: String(d.aff_count || 0) },
  ];
})()
` },
    ],
});
