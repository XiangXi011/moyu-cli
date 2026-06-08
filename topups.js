import { cli } from '@jackwener/opencli/registry';
cli({
    site: 'moyu',
    name: 'topups',
    access: 'read',
    description: 'View top-up / recharge history',
    domain: 'www.moyu.info',
    args: [
        { name: 'limit', type: 'int', default: 20, help: 'Number of records' },
        { name: 'page', type: 'int', default: 1, help: 'Page number' },
    ],
    columns: ['time', 'trade_no', 'method', 'amount', 'status', 'invoice'],
    pipeline: [
        { navigate: 'https://www.moyu.info/console/topup' },
        { evaluate: `(async () => {
  var user = JSON.parse(localStorage.getItem('user') || '{}');
  var uid = user.id;
  if (!uid) throw new Error('Not logged in');
  var res = await fetch('/api/user/topup/self?p=\${{ args.page - 1 }}&per_page=\${{ args.limit }}', {
    credentials: 'include',
    headers: { 'Accept': 'application/json', 'Moyu-Ai-User': String(uid) }
  });
  var data = await res.json();
  if (!data.success) throw new Error(data.message || 'API error');
  var items = data.data?.items || [];
  var invoiceMap = { 0: '未开票', 1: '已开票', 2: '开票中' };
  var methodMap = { 'alipay': '支付宝', 'wechat': '微信', 'offline': '线下' };
  return items.map(function(t) {
    return {
      time: t.create_time ? new Date(t.create_time * 1000).toISOString().slice(0, 19).replace('T', ' ') : '-',
      trade_no: t.trade_no || '-',
      method: methodMap[t.payment_method] || t.payment_method || '-',
      amount: '¥' + (t.amount || 0).toFixed(2),
      status: t.status || '-',
      invoice: invoiceMap[t.invoice_status] || '-',
    };
  });
})()
` },
        { limit: '${{ args.limit }}' },
    ],
});
