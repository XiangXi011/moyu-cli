import { cli } from '@jackwener/opencli/registry';
cli({
    site: 'moyu',
    name: 'report-tokens',
    access: 'read',
    description: 'Token consumption report — per-token usage breakdown',
    domain: 'www.moyu.info',
    args: [
        { name: 'limit', type: 'int', default: 20, help: 'Number of records' },
        { name: 'page', type: 'int', default: 1, help: 'Page number' },
    ],
    columns: ['user', 'token_name', 'requests', 'tokens', 'amount'],
    pipeline: [
        { navigate: 'https://www.moyu.info/console/report/personal' },
        { evaluate: `(async () => {
  var user = JSON.parse(localStorage.getItem('user') || '{}');
  var uid = user.id;
  if (!uid) throw new Error('Not logged in');
  var res = await fetch('/api/report/token-summary?p=\${{ args.page - 1 }}&per_page=\${{ args.limit }}', {
    credentials: 'include',
    headers: { 'Accept': 'application/json', 'Moyu-Ai-User': String(uid) }
  });
  var data = await res.json();
  if (!data.success) throw new Error(data.message || 'API error');
  var items = data.data?.items || [];
  return items.map(function(r) {
    return {
      user: r.display_name || '-',
      token_name: r.token_name || '-',
      requests: String(r.request_count || 0),
      tokens: String(r.total_tokens || 0),
      amount: '¥' + (r.amount || 0).toFixed(2),
    };
  });
})()
` },
        { limit: '${{ args.limit }}' },
    ],
});
