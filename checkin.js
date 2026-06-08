import { cli } from '@jackwener/opencli/registry';
cli({
    site: 'moyu',
    name: 'checkin',
    access: 'write',
    description: 'Daily check-in for free quota rewards',
    domain: 'www.moyu.info',
    args: [],
    columns: ['status', 'message', 'quota_awarded', 'total_checkins', 'total_received'],
    pipeline: [
        { navigate: 'https://www.moyu.info/console/personal' },
        { evaluate: `(async () => {
  var user = JSON.parse(localStorage.getItem('user') || '{}');
  var uid = user.id;
  if (!uid) throw new Error('Not logged in');
  var headers = { 'Accept': 'application/json', 'Content-Type': 'application/json', 'Moyu-Ai-User': String(uid) };
  var res = await fetch('/api/user/checkin', { method: 'POST', credentials: 'include', headers: headers });
  var data = await res.json();
  if (!data.success) {
    if (data.message && data.message.includes('already')) {
      return [{ status: 'Already', message: 'Already checked in today', quota_awarded: '-', total_checkins: '-', total_received: '-' }];
    }
    throw new Error(data.message || 'Check-in failed');
  }
  var d = data.data || {};
  var stats = d.stats || {};
  var lastRecord = (stats.records || [])[0];
  return [{
    status: 'Success',
    message: 'Check-in successful!',
    quota_awarded: lastRecord ? ('¥' + (lastRecord.quota_awarded / 1000000).toFixed(4)) : '-',
    total_checkins: String(stats.total_checkins || 0),
    total_received: '¥' + ((stats.total_quota || 0) / 1000000).toFixed(4),
  }];
})()
` },
    ],
});
