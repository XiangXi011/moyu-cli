import { cli } from '@jackwener/opencli/registry';
cli({
    site: 'moyu',
    name: 'logs',
    access: 'read',
    description: 'View recent API consumption logs',
    domain: 'www.moyu.info',
    args: [
        { name: 'limit', type: 'int', default: 20, help: 'Number of logs' },
        { name: 'page', type: 'int', default: 1, help: 'Page number' },
    ],
    columns: ['time', 'token_name', 'model', 'prompt_tokens', 'completion_tokens', 'cost', 'status'],
    pipeline: [
        { navigate: 'https://www.moyu.info/console/log' },
        { evaluate: `(async () => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const uid = user.id;
  if (!uid) throw new Error('Not logged in');
  const res = await fetch('/api/log/self/?p=\${{ args.page - 1 }}&per_page=\${{ args.limit }}', {
    credentials: 'include',
    headers: { 'Accept': 'application/json', 'Moyu-Ai-User': String(uid) }
  });
  const data = await res.json();
  if (!data.success) throw new Error(data.message || 'API error');
  const items = data.data?.items || [];
  return items.map(log => ({
    time: log.created_at ? new Date(log.created_at * 1000).toISOString().slice(0, 19).replace('T', ' ') : '-',
    token_name: log.token_name || '-',
    model: log.model_name || '-',
    prompt_tokens: String(log.prompt_tokens || 0),
    completion_tokens: String(log.completion_tokens || 0),
    cost: '¥' + ((log.quota || 0) / 1000000).toFixed(4),
    status: log.type === 2 ? 'OK' : 'Error',
  }));
})()
` },
        { limit: '${{ args.limit }}' },
    ],
});
