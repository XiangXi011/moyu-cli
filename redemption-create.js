import { cli } from '@jackwener/opencli/registry';
cli({
    site: 'moyu',
    name: 'redemption-create',
    access: 'write',
    description: 'Create a new redemption code',
    domain: 'www.moyu.info',
    args: [
        { name: 'name', type: 'string', required: true, help: 'Redemption code name' },
        { name: 'quota', type: 'float', required: true, help: 'Quota amount in ¥' },
        { name: 'count', type: 'int', default: 1, help: 'Number of codes to generate' },
    ],
    columns: ['id', 'name', 'code', 'quota', 'status'],
    pipeline: [
        { navigate: 'https://www.moyu.info/console/redemption' },
        { evaluate: `(async () => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const uid = user.id;
  if (!uid) throw new Error('Not logged in');
  const headers = { 'Accept': 'application/json', 'Content-Type': 'application/json', 'Moyu-Ai-User': String(uid) };
  const body = {
    name: '\${{ args.name }}',
    quota: Math.round(\${{ args.quota }} * 1000000),
    count: \${{ args.count }},
  };
  const res = await fetch('/api/redemption/', {
    method: 'POST',
    credentials: 'include',
    headers,
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!data.success) throw new Error(data.message || 'Failed to create redemption code');
  const codes = Array.isArray(data.data) ? data.data : [data.data];
  return codes.map(r => ({
    id: String(r.id),
    name: r.name || '-',
    code: r.key || '-',
    quota: '¥' + ((r.quota || 0) / 1000000).toFixed(2),
    status: 'Unused',
  }));
})()
` },
    ],
});
