import { cli } from '@jackwener/opencli/registry';
cli({
    site: 'moyu',
    name: 'token-create',
    access: 'write',
    description: 'Create a new API token',
    domain: 'www.moyu.info',
    args: [
        { name: 'name', type: 'string', required: true, help: 'Token name' },
        { name: 'quota', type: 'float', default: 0, help: 'Quota in ¥ (0 = unlimited)' },
        { name: 'group', type: 'string', default: '', help: 'Token group (empty = default)' },
        { name: 'count', type: 'int', default: 1, help: 'Number of tokens to create' },
    ],
    columns: ['id', 'name', 'key', 'balance', 'group', 'status'],
    pipeline: [
        { navigate: 'https://www.moyu.info/console/token' },
        { evaluate: `(async () => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const uid = user.id;
  if (!uid) throw new Error('Not logged in');
  const headers = { 'Accept': 'application/json', 'Content-Type': 'application/json', 'Moyu-Ai-User': String(uid) };
  const unlimited = \${{ args.quota }} === 0;
  const body = {
    name: '\${{ args.name }}',
    remain_quota: unlimited ? 0 : Math.round(\${{ args.quota }} * 1000000),
    unlimited_quota: unlimited,
    group: '\${{ args.group }}',
    tokenCount: \${{ args.count }},
    expired_time: -1,
    model_limits_enabled: false,
    model_limits: '',
    cross_group_retry: false,
    appid: 0,
  };
  const res = await fetch('/api/token/', {
    method: 'POST',
    credentials: 'include',
    headers,
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!data.success) throw new Error(data.message || 'Failed to create token');
  const tokens = Array.isArray(data.data) ? data.data : [data.data];
  return tokens.map(t => ({
    id: String(t.id),
    name: t.name,
    key: t.key,
    balance: t.unlimited_quota ? 'Unlimited' : ('¥' + (t.remain_quota / 1000000).toFixed(2)),
    group: t.group || 'default',
    status: t.status === 1 ? 'Enabled' : 'Disabled',
  }));
})()
` },
    ],
});
