import { cli } from '@jackwener/opencli/registry';
cli({
    site: 'moyu',
    name: 'plans',
    access: 'read',
    description: 'List your purchased token plans / packages',
    domain: 'www.moyu.info',
    args: [],
    columns: ['name', 'models', 'quota_used', 'quota_total', 'status', 'expires'],
    pipeline: [
        { navigate: 'https://www.moyu.info/console/my-plans' },
        { evaluate: `(async () => {
  var user = JSON.parse(localStorage.getItem('user') || '{}');
  var uid = user.id;
  if (!uid) throw new Error('Not logged in');
  var res = await fetch('/api/task/self?p=0&per_page=50', {
    credentials: 'include',
    headers: { 'Accept': 'application/json', 'Moyu-Ai-User': String(uid) }
  });
  var data = await res.json();
  if (!data.success) throw new Error(data.message || 'API error');
  var items = data.data?.items || [];
  if (!items.length) return [];
  return items.map(function(p) {
    return {
      name: p.name || '-',
      models: p.models || p.model_limits || '-',
      quota_used: p.used_quota != null ? ('¥' + (p.used_quota / 1000000).toFixed(2)) : '-',
      quota_total: p.unlimited_quota ? 'Unlimited' : (p.remain_quota != null ? ('¥' + ((p.remain_quota + (p.used_quota || 0)) / 1000000).toFixed(2)) : '-'),
      status: p.status === 1 ? 'Active' : 'Expired',
      expires: p.expired_time && p.expired_time > 0 ? new Date(p.expired_time * 1000).toISOString().slice(0, 10) : 'Never',
    };
  });
})()
` },
    ],
});
