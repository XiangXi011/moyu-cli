import { cli } from '@jackwener/opencli/registry';
cli({
    site: 'moyu',
    name: 'pricing',
    access: 'read',
    description: 'Show model pricing / cost configuration',
    domain: 'www.moyu.info',
    args: [
        { name: 'limit', type: 'int', default: 50, help: 'Max models to show' },
    ],
    columns: ['model', 'input_price', 'output_price', 'group'],
    pipeline: [
        { navigate: 'https://www.moyu.info/console' },
        { evaluate: `(async () => {
  var user = JSON.parse(localStorage.getItem('user') || '{}');
  var uid = user.id;
  if (!uid) throw new Error('Not logged in');
  var res = await fetch('/api/model-cost/?p=0&per_page=\${{ args.limit }}', {
    credentials: 'include',
    headers: { 'Accept': 'application/json', 'Moyu-Ai-User': String(uid) }
  });
  var data = await res.json();
  if (!data.success) throw new Error(data.message || 'API error');
  var items = data.data?.items || data.data || [];
  if (!Array.isArray(items)) {
    var keys = Object.keys(items);
    var rows = [];
    for (var i = 0; i < keys.length && rows.length < \${{ args.limit }}; i++) {
      var m = items[keys[i]];
      rows.push({
        model: m.model_name || keys[i],
        input_price: m.input_price != null ? ('¥' + (m.input_price).toFixed(2) + '/M') : '-',
        output_price: m.output_price != null ? ('¥' + (m.output_price).toFixed(2) + '/M') : '-',
        group: m.channel_name || m.group || '-',
      });
    }
    return rows;
  }
  return items.slice(0, \${{ args.limit }}).map(function(m) {
    return {
      model: m.model_name || m.model || '-',
      input_price: m.input_price != null ? ('¥' + (m.input_price).toFixed(2) + '/M') : '-',
      output_price: m.output_price != null ? ('¥' + (m.output_price).toFixed(2) + '/M') : '-',
      group: m.channel_name || m.group || '-',
    };
  });
})()
` },
        { limit: '${{ args.limit }}' },
    ],
});
