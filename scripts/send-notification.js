const webpush = require("web-push");

const sub = JSON.parse(process.env.PUSH_SUBSCRIPTION || "null");
const priv = process.env.VAPID_PRIVATE_KEY;
const pub = process.env.VAPID_PUBLIC_KEY;

if (!sub || !priv || !pub) {
  console.log("Push secrets are not configured; skipping.");
  process.exit(0);
}

const weekday = [
  ["06:00", "Wake up + drink water"],
  ["06:10", "Workout"],
  ["09:00", "University / classes"],
  ["14:00", "Self-study / placement preparation"],
  ["17:30", "Focused study"],
  ["19:30", "Job applications"],
  ["21:00", "Study / projects / interview prep"],
  ["22:30", "Personal time + prepare for tomorrow"]
];

const saturday = [
  ["06:30", "Wake up + drink water"],
  ["06:40", "Workout"],
  ["09:00", "Deep study"],
  ["11:30", "Projects / practical work"],
  ["14:00", "Job applications + interview prep"],
  ["18:00", "Study / revision"]
];

const sunday = [
  ["07:00", "Wake up"],
  ["07:10", "Walk / light workout"],
  ["09:00", "Weekly revision / pending work"],
  ["17:00", "Job applications"],
  ["18:00", "Plan upcoming week"],
  ["22:30", "Prepare for Monday"]
];

const routine = {
  1: sunday,
  2: weekday,
  3: weekday,
  4: weekday,
  5: weekday,
  6: weekday,
  7: saturday
};

const now = new Date();

const formatter = new Intl.DateTimeFormat("en-IN", {
  timeZone: "Asia/Kolkata",
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
  weekday: "long"
});

const parts = formatter.formatToParts(now);

const getPart = (type) => {
  const part = parts.find((p) => p.type === type);
  return part ? part.value : "";
};

const hour = Number(getPart("hour"));
const minute = Number(getPart("minute"));
const weekdayName = getPart("weekday");

const dayMap = {
  Sunday: 1,
  Monday: 2,
  Tuesday: 3,
  Wednesday: 4,
  Thursday: 5,
  Friday: 6,
  Saturday: 7
};

const dow = dayMap[weekdayName];

if (!dow) {
  console.log("Could not determine weekday.");
  process.exit(0);
}

const currentMinutes = hour * 60 + minute;

console.log(
  `Current India time: ${String(hour).padStart(2, "0")}:${String(
    minute
  ).padStart(2, "0")} (${weekdayName})`
);

const item = (routine[dow] || []).find(([time]) => {
  const [hh, mm] = time.split(":").map(Number);
  const taskMinutes = hh * 60 + mm;

  return (
    currentMinutes >= taskMinutes &&
    currentMinutes < taskMinutes + 5
  );
});

if (!item) {
  console.log("No Life OS task is due right now.");
  process.exit(0);
}

console.log(`Task due: ${item[0]} — ${item[1]}`);

webpush.setVapidDetails(
  "mailto:lifeos@example.com",
  pub,
  priv
);

const payload = JSON.stringify({
  title: "Life OS",
  body: `${item[0]} — ${item[1]}`,
  icon: "icon.svg",
  badge: "icon.svg",
  tag: `lifeos-${dow}-${item[0]}`
});

webpush
  .sendNotification(sub, payload)
  .then(() => {
    console.log(
      `Notification sent successfully: ${item[0]} — ${item[1]}`
    );
  })
  .catch((error) => {
    console.error("Notification failed:");

    if (error.body) {
      console.error(error.body);
    } else {
      console.error(error);
    }

    process.exit(1);
  });
