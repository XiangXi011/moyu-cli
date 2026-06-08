import { cli } from '@jackwener/opencli/registry';
cli({
    site: 'moyu',
    name: 'notify-config',
    access: 'read',
    description: 'Show or update notification settings (quota warning threshold, email)',
    domain: 'www.moyu.info',
    args: [
        { name: 'threshold', type: 'int', help: 'Quota warning threshold (raw value, e.g. 500000 = ¥0.50)' },
        { name: 'email', type: 'string', help: 'Notification email address' },
    ],
    columns: ['setting', 'value'],
    pipeline: [
        { navigate: 'https://www.moyu.info/console/personal' },
        { evaluate: `(async () => {
  var user = JSON.parse(localStorage.getItem('user') || '{}');
  var uid = user.id;
  if (!uid) throw new Error('Not logged in');
  var headers = { 'Accept': 'application/json', 'Content-Type': 'application/json', 'Moyu-Ai-User': String(uid) };
  var threshold = \${{ args.threshold }};
  var email = '\${{ args.email }}';
  if (threshold || email) {
    var body = {};
    if (threshold) body.quota_warning_threshold = threshold;
    if (email) body.notification_email = email;
    var res = await fetch('/api/user/setting', { method: 'PUT', credentials: 'include', headers: headers, body: JSON.stringify(body) });
    var data = await res.json();
    if (!data.success) throw new Error(data.message || 'Failed to update settings');
  }
  var selfRes = await fetch('/api/user/self', { credentials: 'include', headers: { 'Accept': 'application/json', 'Moyu-Ai-User': String(uid) } });
  var selfData = await selfRes.json();
  if (!selfData.success) throw new Error(selfData.message || 'API error');
  var setting = {};
  try { setting = JSON.parse(selfData.data.setting || '{}'); } catch(e) {}
  return [
    { setting: 'Quota Warning Threshold', value: String(setting.quota_warning_threshold || 500000) },
    { setting: 'Threshold (¥)', value: '¥' + ((setting.quota_warning_threshold || 500000) / 1000000).toFixed(2) },
    { setting: 'Notification Email', value: setting.notification_email || selfData.data.email || '-' },
    { setting: 'Notify Type', value: setting.notify_type || 'email' },
  ];
})()
` },
    ],
});
