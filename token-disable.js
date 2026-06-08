import { cli } from '@jackwener/opencli/registry';
cli({
    site: 'moyu',
    name: 'token-disable',
    access: 'write',
    description: 'Disable an active API token',
    domain: 'www.moyu.info',
    args: [
        { name: 'token', type: 'string', required: true, help: 'Token ID or name to disable' },
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
    body: JSON.stringify({ id: found.id, status: 2 }),
  });
  const data = await res.json();
  if (!data.success) throw new Error(data.message || 'Failed to disable token');
  return [{ status: 'Disabled', message: 'Token "' + found.name + '" disabled successfully' }];
})()
` },
    ],
});
