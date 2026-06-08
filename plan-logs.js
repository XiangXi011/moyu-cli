import { cli } from '@jackwener/opencli/registry';
cli({
    site: 'moyu',
    name: 'plan-logs',
    access: 'read',
    description: 'View token plan consumption logs',
    domain: 'www.moyu.info',
    args: [
        { name: 'limit', type: 'int', default: 20, help: 'Number of records' },
    ],
    columns: ['time', 'user', 'plan', 'model', 'tokens', 'cost'],
    pipeline: [
        { navigate: 'https://www.moyu.info/console/plan-logs' },
        { evaluate: `(async () => {
  var user = JSON.parse(localStorage.getItem('user') || '{}');
  var uid = user.id;
  if (!uid) throw new Error('Not logged in');
  var res = await fetch('/api/task/self?p=0&per_page=\${{ args.limit }}', {
    credentials: 'include',
    headers: { 'Accept': 'application/json', 'Moyu-Ai-User': String(uid) }
  });
  var data = await res.json();
  if (!data.success) throw new Error(data.message || 'API error');
  var items = data.data?.items || [];
  if (!items.length) return [];
  return items.map(function(r) {
    return {
      time: r.created_at ? new Date(r.created_at * 1000).toISOString().slice(0, 19).replace('T', ' ') : '-',
      user: r.username || '-',
      plan: r.plan_name || r.name || '-',
      model: r.model_name || '-',
      tokens: String(r.total_tokens || r.prompt_tokens + r.completion_tokens || 0),
      cost: '¥' + ((r.quota || 0) / 1000000).toFixed(4),
    };
  });
})()
` },
        { limit: '${{ args.limit }}' },
    ],
});
