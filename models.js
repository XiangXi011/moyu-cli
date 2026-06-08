import { cli } from '@jackwener/opencli/registry';
cli({
    site: 'moyu',
    name: 'models',
    access: 'read',
    description: 'List all available AI models',
    domain: 'www.moyu.info',
    args: [
        { name: 'limit', type: 'int', default: 50, help: 'Max models to show' },
    ],
    columns: ['id', 'group'],
    pipeline: [
        { navigate: 'https://www.moyu.info/console' },
        { evaluate: `(async () => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const uid = user.id;
  if (!uid) throw new Error('Not logged in');
  const res = await fetch('/api/models', {
    credentials: 'include',
    headers: { 'Accept': 'application/json', 'Moyu-Ai-User': String(uid) }
  });
  const data = await res.json();
  if (!data.success) throw new Error(data.message || 'API error');
  const groups = data.data || {};
  const rows = [];
  var keys = Object.keys(groups);
  for (var i = 0; i < keys.length; i++) {
    var groupId = keys[i];
    var models = groups[groupId] || [];
    for (var j = 0; j < models.length; j++) {
      rows.push({ id: models[j], group: groupId });
    }
  }
  return rows.slice(0, \${{ args.limit }});
})()
` },
        { limit: '${{ args.limit }}' },
    ],
});
