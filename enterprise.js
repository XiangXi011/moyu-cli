import { cli } from '@jackwener/opencli/registry';
cli({
    site: 'moyu',
    name: 'enterprise',
    access: 'read',
    description: 'Show enterprise info and members',
    domain: 'www.moyu.info',
    args: [],
    columns: ['field', 'value'],
    pipeline: [
        { navigate: 'https://www.moyu.info/console/enterprise' },
        { evaluate: `(async () => {
  var user = JSON.parse(localStorage.getItem('user') || '{}');
  var uid = user.id;
  if (!uid) throw new Error('Not logged in');
  var headers = { 'Accept': 'application/json', 'Moyu-Ai-User': String(uid) };
  var res = await fetch('/api/enterprise/self', { credentials: 'include', headers: headers });
  var data = await res.json();
  if (!data.success) throw new Error(data.message || 'API error');
  var d = data.data || {};
  return [
    { field: 'ID', value: String(d.id || '-') },
    { field: 'Name', value: d.name || '-' },
    { field: 'Contact', value: d.contact_name || '-' },
    { field: 'Phone', value: d.contact_phone || '-' },
    { field: 'Admin', value: d.admin_username || String(d.admin_user_id || '-') },
    { field: 'Status', value: d.status === 1 ? 'Active' : 'Disabled' },
    { field: 'Created', value: d.created_at ? new Date(d.created_at * 1000).toISOString().slice(0, 19).replace('T', ' ') : '-' },
  ];
})()
` },
    ],
});
