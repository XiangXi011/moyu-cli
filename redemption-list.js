import { cli } from '@jackwener/opencli/registry';
cli({
    site: 'moyu',
    name: 'redemption-list',
    access: 'read',
    description: 'List redemption codes',
    domain: 'www.moyu.info',
    args: [
        { name: 'page', type: 'int', default: 1, help: 'Page number' },
        { name: 'size', type: 'int', default: 20, help: 'Page size' },
    ],
    columns: ['id', 'name', 'code', 'quota', 'status', 'created'],
    pipeline: [
        { navigate: 'https://www.moyu.info/console/redemption' },
        { evaluate: `(async () => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const uid = user.id;
  if (!uid) throw new Error('Not logged in');
  const res = await fetch('/api/redemption/?p=\${{ args.page - 1 }}&per_page=\${{ args.size }}', {
    credentials: 'include',
    headers: { 'Accept': 'application/json', 'Moyu-Ai-User': String(uid) }
  });
  const data = await res.json();
  if (!data.success) throw new Error(data.message || 'API error');
  const items = data.data?.items || [];
  const statusMap = { 1: 'Unused', 2: 'Used', 3: 'Disabled' };
  return items.map(r => ({
    id: String(r.id),
    name: r.name || '-',
    code: r.key || '-',
    quota: '¥' + ((r.quota || 0) / 1000000).toFixed(2),
    status: statusMap[r.status] || String(r.status),
    created: r.created_time ? new Date(r.created_time * 1000).toISOString().slice(0, 19).replace('T', ' ') : '-',
  }));
})()
` },
        { limit: '${{ args.size }}' },
    ],
});
