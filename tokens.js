import { cli } from '@jackwener/opencli/registry';
cli({
    site: 'moyu',
    name: 'tokens',
    access: 'read',
    description: 'List all API tokens with balance and status',
    domain: 'www.moyu.info',
    args: [
        { name: 'page', type: 'int', default: 1, help: 'Page number' },
        { name: 'size', type: 'int', default: 20, help: 'Page size' },
    ],
    columns: ['name', 'status', 'balance', 'used', 'group', 'key_preview', 'created', 'last_used'],
    pipeline: [
        { navigate: 'https://www.moyu.info/console/token' },
        { evaluate: `(async () => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const uid = user.id;
  if (!uid) throw new Error('Not logged in');
  const res = await fetch('/api/token/?p=\${{ args.page - 1 }}&per_page=\${{ args.size }}', {
    credentials: 'include',
    headers: { 'Accept': 'application/json', 'Moyu-Ai-User': String(uid) }
  });
  const data = await res.json();
  if (!data.success) throw new Error(data.message || 'API error');
  const items = data.data?.items || [];
  return items.map(t => ({
    name: t.name,
    status: t.status === 1 ? 'Enabled' : 'Disabled',
    balance: t.unlimited_quota ? 'Unlimited' : ('¥' + (t.remain_quota / 1000000).toFixed(2)),
    used: '¥' + (t.used_quota / 1000000).toFixed(2),
    group: t.group || 'default',
    key_preview: t.key ? t.key.substring(0, 8) + '...' : '-',
    created: t.created_time ? new Date(t.created_time * 1000).toISOString().slice(0, 19).replace('T', ' ') : '-',
    last_used: t.accessed_time ? new Date(t.accessed_time * 1000).toISOString().slice(0, 19).replace('T', ' ') : 'Never',
  }));
})()
` },
        { limit: '${{ args.size }}' },
    ],
});
