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
    var msg = data.message || '';
    if (msg.includes('already') || msg.includes('已签到') || msg.includes('今日')) {
      var statsRes = await fetch('/api/user/checkin', { credentials: 'include', headers: { 'Accept': 'application/json', 'Moyu-Ai-User': String(uid) } });
      var statsData = await statsRes.json();
      var st = statsData.data?.stats || {};
      return [{ status: 'Already', message: 'Already checked in today', quota_awarded: '-', total_checkins: String(st.total_checkins || '-'), total_received: '¥' + ((st.total_quota || 0) / 1000000).toFixed(4) }];
    }
    throw new Error(msg || 'Check-in failed');
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
