import { cli } from '@jackwener/opencli/registry';
cli({
    site: 'moyu',
    name: 'token-delete',
    access: 'write',
    description: 'Delete an API token by ID or name',
    domain: 'www.moyu.info',
    args: [
        { name: 'token', type: 'string', required: true, help: 'Token ID or name to delete' },
    ],
    columns: ['status', 'message'],
    pipeline: [
        { navigate: 'https://www.moyu.info/console/token' },
        { evaluate: `(async () => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const uid = user.id;
  if (!uid) throw new Error('Not logged in');
  const headers = { 'Accept': 'application/json', 'Moyu-Ai-User': String(uid) };
  const target = '\${{ args.token }}';
  // First find the token by name or ID
  const listRes = await fetch('/api/token/search', { credentials: 'include', headers });
  const listData = await listRes.json();
  if (!listData.success) throw new Error(listData.message || 'Failed to list tokens');
  const tokens = listData.data || [];
  const found = tokens.find(t => String(t.id) === target || t.name === target);
  if (!found) throw new Error('Token not found: ' + target);
  const delRes = await fetch('/api/token/' + found.id + '/', {
    method: 'DELETE',
    credentials: 'include',
    headers,
  });
  const delData = await delRes.json();
  if (!delData.success) throw new Error(delData.message || 'Failed to delete token');
  return [{ status: 'Deleted', message: 'Token "' + found.name + '" (ID: ' + found.id + ') deleted successfully' }];
})()
` },
    ],
});
