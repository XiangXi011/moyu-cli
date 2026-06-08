import { cli } from '@jackwener/opencli/registry';
cli({
    site: 'moyu',
    name: 'token-enable',
    access: 'write',
    description: 'Enable a disabled API token',
    domain: 'www.moyu.info',
    args: [
        { name: 'token', type: 'string', required: true, help: 'Token ID or name to enable' },
    ],
    columns: ['status', 'message'],
    pipeline: [
        { navigate: 'https://www.moyu.info/console/token' },
        { evaluate: `(async () => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const uid = user.id;
  if (!uid) throw new Error('Not logged in');
  const headers = { 'Accept': 'application/json', 'Content-Type': 'application/json', 'Moyu-Ai-User': String(uid) };
  const target = '\${{ args.token }}';
  const listRes = await fetch('/api/token/search', { credentials: 'include', headers });
  const listData = await listRes.json();
  if (!listData.success) throw new Error(listData.message || 'Failed to list tokens');
  const tokens = listData.data || [];
  const found = tokens.find(t => String(t.id) === target || t.name === target);
  if (!found) throw new Error('Token not found: ' + target);
  const res = await fetch('/api/token/?status_only=true', {
    method: 'PUT',
    credentials: 'include',
    headers,
    body: JSON.stringify({ id: found.id, status: 1 }),
  });
  const data = await res.json();
  if (!data.success) throw new Error(data.message || 'Failed to enable token');
  return [{ status: 'Enabled', message: 'Token "' + found.name + '" enabled successfully' }];
})()
` },
    ],
});
