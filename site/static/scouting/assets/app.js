const longDate = new Intl.DateTimeFormat("en-US", { month: "long", day: "numeric", year: "numeric" });

// Activity ideas for leaders to adapt; confirm meeting plans with the den.
const denActivities = {
  "2026-11-16": ["Make a picture of a way to help someone and share it with a buddy.", "Play a teamwork relay, then make a thank-you card for a community helper.", "Plan a small service project and assign each Scout a role."],
  "2026-11-30": ["Look for colors and shapes on a short buddy nature walk.", "Make a nature journal and sketch three observations without collecting them.", "Practice reading a trail map and discuss how to leave the area as you found it."],
  "2026-12-07": ["Make a cardboard car and race it down a gentle ramp.", "Build a marble track from tubes and experiment with its slope.", "Sketch a Pinewood Derby car design and test how ramp changes affect a toy car."]
};

const events = [
  { date: "2026-11-16", title: "Den meeting", details: "6:00 PM · Shady Shores Baptist Church" },
  { date: "2026-11-30", title: "Den meeting", details: "6:00 PM · Shady Shores Baptist Church" },
  { date: "2026-12-07", title: "Den meeting", details: "6:00 PM · Shady Shores Baptist Church" },
  { date: "2026-12-14", title: "Holiday party and pack meeting", details: "5:30–7:00 PM · Check the calendar for location." },
  { date: "2027-01-01", end: "2027-01-03", title: "Cub-O 2027", details: "Sid Richardson Scout Ranch · Orienteering, map reading and strategy, with a Saturday evening Winter Festival featuring hot cocoa, s'mores and a movie. Please try to register as a pack. Bring completed BSA medical forms A and B to your unit leader and a printed team form to check-in.", url: "https://scoutingevent.com/662-cubo27", linkText: "Cub-O pricing and details" },
  { date: "2027-01-04", title: "Pinewood Derby car cutting", details: "6:00–7:00 PM" },
  { date: "2027-02-05", title: "Pinewood Derby car check-in", details: "6:00–7:00 PM · All cars must pass inspection." },
];

// Compare calendar days in the pack's time zone; multi-day events stay upcoming through their last day.
export function packToday(now = new Date()) {
  const parts = new Intl.DateTimeFormat("en-US", { timeZone: "America/Chicago", year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(now);
  const get = (type) => parts.find((part) => part.type === type).value;
  return `${get("year")}-${get("month")}-${get("day")}`;
}

export function partitionDates(items, today) {
  const sorted = [...items].sort((a, b) => a.date.localeCompare(b.date));
  return { upcoming: sorted.filter((item) => (item.end || item.date) >= today), past: sorted.filter((item) => (item.end || item.date) < today).reverse() };
}

const byId = (id) => document.getElementById(id);

function localDate(date) {
  return new Date(`${date}T12:00:00`);
}

function renderEvents() {
  const groups = partitionDates(events, packToday());
  for (const [id, items] of [["upcomingEvents", groups.upcoming], ["pastEvents", groups.past]]) {
    const list = byId(id);
    list.replaceChildren();
    if (!items.length) { list.textContent = id === "upcomingEvents" ? "No more selected dates; check the calendar above." : "No past selected dates yet."; continue; }
    for (const item of items) {
      const card = document.createElement("article");
      card.className = "program-item";
      const date = item.end ? `${longDate.format(localDate(item.date))} – ${longDate.format(localDate(item.end))}` : longDate.format(localDate(item.date));
      card.innerHTML = `<div class="program-date">${date}</div><div><h3>${item.title}</h3><p>${item.details}</p></div>`;
      if (denActivities[item.date]) {
        const activities = document.createElement("div");
        activities.innerHTML = `<h4>Suggested den activities</h4><ul>${["Lions", "Tigers", "Bears"].map((rank, index) => `<li><strong>${rank}:</strong> ${denActivities[item.date][index]}</li>`).join("")}</ul>`;
        card.lastElementChild.append(activities);
      }
      if (item.url) {
        const link = document.createElement("a");
        link.href = item.url;
        link.textContent = item.linkText;
        card.lastElementChild.append(link);
      }
      list.append(card);
    }
  }
}

if (typeof document !== "undefined") {
  byId('printButton').addEventListener('click',()=>window.print());
  renderEvents();
  let renderedDay = packToday();
  function refreshDate() {
    if (packToday() === renderedDay) return;
    renderedDay = packToday();
    renderEvents();
  }
  document.addEventListener('visibilitychange', () => { if (!document.hidden) refreshDate(); });
  setInterval(refreshDate, 60000);
}
