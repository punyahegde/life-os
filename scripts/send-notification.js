const webpush = require('web-push');

const sub = JSON.parse(process.env.PUSH_SUBSCRIPTION || 'null');
const priv = process.env.VAPID_PRIVATE_KEY;

if (!sub || !priv) {
  console.log('Push secrets not configured; skipping.');
  process.exit(0);
}

const routine = {
  1: [['07:00','Wake up'],['07:10','Walk / light workout'],['09:00','Weekly revision / pending work'],['17:00','Job applications'],['18:00','Plan upcoming week'],['22:30','Prepare for Monday']],
  2: [['06:00','Wake up + drink water'],['06:10','Workout'],['09:00','University / classes'],['14:00','Self-study / placement preparation'],['17:30','Focused study'],['19:30','Job applications'],['21:00','Study / projects / interview prep'],['22:30','Personal time + prepare for tomorrow']],
  3: [['06:00','Wake up + drink water'],['06:10','Workout'],['09:00','University / classes'],['14:00','Self-study / placement preparation'],['17:30','Focused study'],['19:30','Job applications'],['21:00','Study / projects / interview prep'],['22:30','Personal time + prepare for tomorrow']],
  4: [['06:00','Wake up + drink water'],['06:10','Workout'],['09:00','University / classes'],['14:00','Self-study / placement preparation'],['17:30','Focused study'],['19:30','Job applications'],['21:00','Study / projects / interview prep'],['22:30','Personal time + prepare for tomorrow']],
  5: [['06:00','Wake up + drink water'],['06:10','Workout'],['09:00','University / classes'],['14:00','Self-study / placement preparation'],['17:30','Focused study'],['19:30','Job applications'],['21:00','Study / projects / interview prep'],['22:30','Personal time + prepare for tomorrow']],
  6: [['06:00','Wake up + drink water'],['06:10','Workout'],['09:00','University / classes'],['14:00','Self-study / placement preparation'],['17:30','Focused study'],['19:30','Job applications'],['21:00','Study / projects / interview prep'],['22:30','Personal time + prepare for tomorrow']],
  7: [['06:30','Wake up + drink water'],['06:40','Workout'],['09:00','Deep study'],['11:30','Projects / practical work'],['14:00','Job applications + interview prep'],['18:00','Study / revision']]
};

const now = new Date();

const fmt = new Intl.DateTimeFormat('en-GB', {
  timeZone: 'Asia/Kolkata',
  hour: '2-digit',
  minute: '2-digit'
});

const parts = fmt.formatToParts(now);
const get = t => parts.find(p => p.type === t)?.value;

const hm = `${get('hour')}:${get('minute')}`;
const dow = Number(get('weekday'));

const item = (routine[dow] || []).find(x => x[0] === hm);

if (!item) {
  console.log(`No task due at ${hm} IST.`);
  process.exit(0);
}

webpush.setVapidDetails(
  'mailto:lifeos@example.com',
  process.env.VAPID_PUBLIC_KEY,
  priv
);

webpush.sendNotification(
  sub,
  JSON.stringify({
    title: 'Life OS',
    body: `${item[0]} — ${item[1]}`,
    tag: `lifeos-${dow}-${item[0]}`
  })
)
.then(() => console.log('Sent', item))
.catch(e => {
  console.error(e.body || e);
  process.exit(1);
});
