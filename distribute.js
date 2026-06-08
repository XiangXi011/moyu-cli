import { cli } from '@jackwener/opencli/registry';
cli({
    site: 'moyu',
    name: 'distribute',
    access: 'write',
    description: 'Distribute quota to a user',
    domain: 'www.moyu.info',
    args: [
        { name: 'user', type: 'string', required: true, help: 'Target user ID or username' },
        { name: 'amount', type: 'float', required: true, help: 'Amount in ¥ to distribute' },
    ],
    columns: ['status', 'message'],
    pipeline: [
        { navigate: 'https://www.moyu.info/console/user' },
        { evaluate: `(async () => {
  var user = JSON.parse(localStorage.getItem('user') || '{}');
  var uid = user.id;
  if (!uid) throw new Error('Not logged in');
  var headers = { 'Accept': 'application/json', 'Content-Type': 'application/json', 'Moyu-Ai-User': String(uid) };
  var target = '\${{ args.user }}';
  var amount = Math.round(\${{ args.amount }} * 1000000);
  var res = await fetch('/api/user/amount', {
    method: 'POST',
    credentials: 'include',
    headers: headers,
    body: JSON.stringify({ user_id: target, amount: amount }),
  });
  var data = await res.json();
  if (!data.success) throw new Error(data.message || 'Failed to distribute quota');
  return [{ status: 'Success', message: 'Distributed ¥' + (\${{ args.amount }}).toFixed(2) + ' to user ' + target }];
})()
` },
    ],
});
