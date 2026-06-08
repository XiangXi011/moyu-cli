import { cli } from '@jackwener/opencli/registry';
cli({
    site: 'moyu',
    name: 'user',
    access: 'read',
    description: 'Show current user profile and permissions',
    domain: 'www.moyu.info',
    args: [],
    columns: ['field', 'value'],
    pipeline: [
        { navigate: 'https://www.moyu.info/console' },
        { evaluate: `(async () => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const uid = user.id;
  if (!uid) throw new Error('Not logged in');
  const res = await fetch('/api/user/self', {
    credentials: 'include',
    headers: { 'Accept': 'application/json', 'Moyu-Ai-User': String(uid) }
  });
  const data = await res.json();
  if (!data.success) throw new Error(data.message || 'API error');
  const d = data.data;
  const perms = d.permissions || {};
  return [
    { field: 'ID', value: String(d.id) },
    { field: 'Username', value: d.display_name },
    { field: 'Email', value: d.email || '-' },
    { field: 'Phone', value: d.phone || '-' },
    { field: 'Group', value: d.group },
    { field: 'Role', value: d.role === 1 ? 'Admin' : 'User' },
    { field: 'Balance', value: '¥' + (d.quota / 1000000).toFixed(2) },
    { field: 'Requests', value: String(d.request_count || 0) },
    { field: 'Can Manage Users', value: String(perms.can_manage_users || false) },
    { field: 'Aff Code', value: d.aff_code || '-' },
    { field: 'Aff Count', value: String(d.aff_count || 0) },
    { field: 'Inviter ID', value: String(d.inviter_id || '-') },
    { field: 'GitHub', value: d.github_id || '-' },
    { field: 'Discord', value: d.discord_id || '-' },
  ];
})()
` },
    ],
});
