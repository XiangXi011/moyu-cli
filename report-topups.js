import { cli } from '@jackwener/opencli/registry';
cli({
    site: 'moyu',
    name: 'report-topups',
    access: 'read',
    description: 'Top-up summary report — per-user recharge breakdown',
    domain: 'www.moyu.info',
    args: [
        { name: 'limit', type: 'int', default: 20, help: 'Number of records' },
        { name: 'page', type: 'int', default: 1, help: 'Page number' },
    ],
    columns: ['user', 'date', 'method', 'amount'],
    pipeline: [
        { navigate: 'https://www.moyu.info/console/report/personal' },
        { evaluate: `(async () => {
  var user = JSON.parse(localStorage.getItem('user') || '{}');
  var uid = user.id;
  if (!uid) throw new Error('Not logged in');
  var res = await fetch('/api/report/topup-summary?p=\${{ args.page - 1 }}&per_page=\${{ args.limit }}', {
    credentials: 'include',
    headers: { 'Accept': 'application/json', 'Moyu-Ai-User': String(uid) }
  });
  var data = await res.json();
  if (!data.success) throw new Error(data.message || 'API error');
  var items = data.data?.items || [];
  return items.map(function(r) {
    return {
      user: r.display_name || '-',
      date: r.date || '-',
      method: r.payment_method || '-',
      amount: '¥' + (r.amount || 0).toFixed(2),
    };
  });
})()
` },
        { limit: '${{ args.limit }}' },
    ],
});
