import { cli } from '@jackwener/opencli/registry';
cli({
    site: 'moyu',
    name: 'redeem',
    access: 'write',
    description: 'Redeem a code to top up your account',
    domain: 'www.moyu.info',
    args: [
        { name: 'code', type: 'string', required: true, help: 'Redemption code to use' },
    ],
    columns: ['status', 'message', 'quota'],
    pipeline: [
        { navigate: 'https://www.moyu.info/console/topup' },
        { evaluate: `(async () => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const uid = user.id;
  if (!uid) throw new Error('Not logged in');
  const headers = { 'Accept': 'application/json', 'Content-Type': 'application/json', 'Moyu-Ai-User': String(uid) };
  const res = await fetch('/api/user/topup', {
    method: 'POST',
    credentials: 'include',
    headers,
    body: JSON.stringify({ key: '\${{ args.code }}' }),
  });
  const data = await res.json();
  if (!data.success) throw new Error(data.message || 'Failed to redeem code');
  const d = data.data || {};
  return [{
    status: 'Success',
    message: data.message || 'Code redeemed successfully',
    quota: d.quota ? ('¥' + (d.quota / 1000000).toFixed(2)) : '-',
  }];
})()
` },
    ],
});
