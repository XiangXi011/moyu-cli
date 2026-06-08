import { cli } from '@jackwener/opencli/registry';
cli({
    site: 'moyu',
    name: 'users',
    access: 'read',
    description: 'List managed users with quota and status',
    domain: 'www.moyu.info',
    args: [
        { name: 'limit', type: 'int', default: 20, help: 'Number of users' },
        { name: 'page', type: 'int', default: 1, help: 'Page number' },
    ],
    columns: ['id', 'username', 'email', 'status', 'balance', 'group', 'role', 'created'],
    pipeline: [
        { navigate: 'https://www.moyu.info/console/user' },
        { evaluate: `(async () => {
  var user = JSON.parse(localStorage.getItem('user') || '{}');
  var uid = user.id;
  if (!uid) throw new Error('Not logged in');
  var res = await fetch('/api/user/?p=\${{ args.page - 1 }}&per_page=\${{ args.limit }}', {
    credentials: 'include',
    headers: { 'Accept': 'application/json', 'Moyu-Ai-User': String(uid) }
  });
  var data = await res.json();
  if (!data.success) throw new Error(data.message || 'API error');
  var items = data.data?.items || [];
  return items.map(function(u) {
    return {
      id: String(u.id),
      username: u.display_name || u.username || '-',
      email: u.email || '-',
      status: u.status === 1 ? 'Enabled' : 'Disabled',
      balance: '¥' + ((u.quota || 0) / 1000000).toFixed(2),
      group: u.group || '-',
      role: u.role === 1 ? 'Admin' : 'User',
      created: u.created_at ? new Date(u.created_at * 1000).toISOString().slice(0, 19).replace('T', ' ') : '-',
    };
  });
})()
` },
        { limit: '${{ args.limit }}' },
    ],
});
