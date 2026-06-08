import { cli } from '@jackwener/opencli/registry';
cli({
    site: 'moyu',
    name: 'token-key',
    access: 'read',
    description: 'Show full API key for a token (for copying)',
    domain: 'www.moyu.info',
    args: [
        { name: 'token', type: 'string', required: true, help: 'Token ID or name' },
    ],
    columns: ['name', 'key', 'balance', 'status'],
    pipeline: [
        { navigate: 'https://www.moyu.info/console/token' },
        { evaluate: `(async () => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const uid = user.id;
  if (!uid) throw new Error('Not logged in');
  const headers = { 'Accept': 'application/json', 'Moyu-Ai-User': String(uid) };
  const target = '\${{ args.token }}';
  const listRes = await fetch('/api/token/search', { credentials: 'include', headers });
  const listData = await listRes.json();
  if (!listData.success) throw new Error(listData.message || 'Failed to list tokens');
  const tokens = listData.data || [];
  const found = tokens.find(t => String(t.id) === target || t.name === target);
  if (!found) throw new Error('Token not found: ' + target);
  return [{
    name: found.name,
    key: found.key,
    balance: found.unlimited_quota ? 'Unlimited' : ('¥' + (found.remain_quota / 1000000).toFixed(2)),
    status: found.status === 1 ? 'Enabled' : 'Disabled',
  }];
})()
` },
    ],
});
