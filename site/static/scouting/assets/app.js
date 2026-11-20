const longDate = new Intl.DateTimeFormat("en-US", { month: "long", day: "numeric", year: "numeric" });

// Shared themes are suggestions, not a record of completed requirements.
export const denActivities = {
  "2026-11-16": {
    "theme": "nature",
    "ideas": [
      "Sort pictures into natural and human-made items.",
      "Sort examples into renewable and nonrenewable resources.",
      "Sort examples into renewable and nonrenewable resources.",
      "Find everyday items made from natural resources."
    ]
  },
  "2026-11-30": {
    "theme": "nature",
    "ideas": [
      "Sort clean sample items by material and discuss recycling.",
      "Play a reduce, reuse, recycle sorting game.",
      "Play the same sorting game and discuss the three Rs.",
      "Discuss ways to conserve resources at home and in the community."
    ]
  },
  "2026-12-07": {
    "theme": "race",
    "ideas": [
      "With an adult partner, plan and decorate a Derby car; adults cut and assemble it.",
      "With an adult partner, plan and decorate a Derby car.",
      "With an adult, plan a Derby car and identify a way to increase its speed.",
      "With an adult, plan a Derby car and identify a way to increase its speed."
    ]
  },
  "2027-01-25": {
    "theme": "bike",
    "ideas": [
      "With an adult partner, learn safety gear and riding rules.",
      "With an adult partner, check air, brakes, and chain, then review safety gear.",
      "Fit a helmet and practice bicycle hand signals.",
      "Fit a helmet, practice signals, and check the brakes."
    ]
  },
  "2027-02-01": {
    "theme": "nature",
    "ideas": [
      "Learn where local recyclables go with a guest or an age-appropriate demonstration.",
      "Trace what happens to local garbage with a simple skit.",
      "Trace what happens to local recyclables using a diagram or guest speaker.",
      "Explore how everyday choices affect natural resources."
    ]
  },
  "2027-02-08": {
    "theme": "race",
    "ideas": [
      "With an adult partner, learn the race rules and practice good sportsmanship.",
      "With an adult partner, learn the race rules and practice good sportsmanship.",
      "Review race rules, discuss speed, and practice good sportsmanship.",
      "Review race rules, discuss speed, and practice good sportsmanship."
    ]
  },
  "2027-02-22": {
    "theme": "bike",
    "ideas": [
      "Practice bicycle safety rules with an adult partner in a closed area.",
      "Practice hand signals with an adult partner in a closed area.",
      "Practice signals and safe stopping in a closed area.",
      "Practice signals and stopping; demonstrate how to operate brakes."
    ]
  },
  "2027-03-22": {
    "theme": "nature",
    "ideas": [
      "Join a planned conservation project with an adult partner.",
      "Join the same conservation project with an adult partner.",
      "Join the same conservation project and discuss its purpose.",
      "Join the same conservation project and help explain its purpose."
    ]
  },
  "2027-03-29": {
    "theme": "race",
    "ideas": [
      "With an adult partner, sand or decorate a Derby car; adults handle cutting and assembly.",
      "With an adult partner, assemble and decorate a Derby car.",
      "With an adult, build a Derby car and discuss ways to improve its speed.",
      "With an adult, build a Derby car and discuss ways to improve its speed."
    ]
  },
  "2027-04-05": {
    "theme": "nature",
    "ideas": [
      "Sort natural and human-made items and talk about recycling.",
      "Compare renewable and nonrenewable resources and the three Rs.",
      "Compare renewable and nonrenewable resources and the three Rs.",
      "Identify local natural resources and ways to conserve them."
    ]
  },
  "2027-04-12": {
    "theme": "bike",
    "ideas": [
      "With an adult partner, review riding gear and safety rules.",
      "With an adult partner, review bike checks and hand signals.",
      "Review helmet fit and signals before riding.",
      "Show helmet fit and signals; practice checking tires and brakes."
    ]
  },
  "2027-04-19": {
    "theme": "race",
    "ideas": [
      "Role-play good sportsmanship with an adult partner before a Derby.",
      "Role-play good sportsmanship with an adult partner before a Derby.",
      "Discuss ways to be a good sport and how a car could go faster.",
      "Discuss ways to be a good sport and how a car could go faster."
    ]
  },
  "2027-05-03": {
    "theme": "bike",
    "ideas": [
      "With an adult partner or family, ride with safety gear and follow the rules.",
      "With an adult partner or family, ride or begin learning to ride.",
      "With the den or family, take the ride described in your rank requirements.",
      "With the den or family, use the buddy system on a 30-minute ride."
    ]
  }
};

const electiveThemes = {
  nature: { title: "Champions for Nature", links: ["champions-for-nature-lion", "champions-for-nature-tiger", "champions-for-nature-wolf", "champions-for-nature-bear"], names: ["Champions for Nature Lion", "Champions for Nature Tiger", "Champions for Nature Wolf", "Champions for Nature Bear"] },
  race: { title: "Race Time", links: ["race-time-lion", "race-time-tiger", "race-time-wolf", "race-time-bear"], names: ["Race Time Lion", "Race Time Tiger", "Race Time Wolf", "Race Time Bear"] },
  bike: { title: "Bike skills", links: ["on-a-roll", "rolling-tigers", "pedal-with-the-pack", "bears-on-bikes"], names: ["On a Roll", "Rolling Tigers", "Pedal With the Pack", "Bears on Bikes"] }
};

export const events = [
  { date: "2026-11-16", title: "Den meeting", details: "6:00 PM · Shady Shores Baptist Church" },
  { date: "2026-11-30", title: "Den meeting", details: "6:00 PM · Shady Shores Baptist Church" },
  { date: "2026-12-07", title: "Den meeting", details: "6:00 PM · Shady Shores Baptist Church" },
  { date: "2026-12-14", title: "Holiday party and pack meeting", details: "5:30–7:00 PM · Check the calendar for location." },
  { date: "2027-01-01", end: "2027-01-03", title: "Cub-O 2027", details: "Sid Richardson Scout Ranch · Orienteering, map reading and strategy, with a Saturday evening Winter Festival featuring hot cocoa, s'mores and a movie. Please try to register as a pack. Bring completed BSA medical forms A and B to your unit leader and a printed team form to check-in.", url: "https://scoutingevent.com/662-cubo27", linkText: "Cub-O pricing and details" },
  { date: "2027-01-04", title: "Pinewood Derby car cutting", details: "6:00–7:00 PM" },
  { date: "2027-02-05", title: "Pinewood Derby car check-in", details: "6:00–7:00 PM · All cars must pass inspection." },
  ...["2027-01-25", "2027-02-01", "2027-02-08", "2027-02-22", "2027-03-22", "2027-03-29", "2027-04-05", "2027-04-12", "2027-04-19", "2027-05-03"].map(date => ({ date, title: "Den meeting", details: "6:00 PM · Check the calendar for location and changes." })),
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
    if (!items.length) { list.textContent = id === "upcomingEvents" ? "No more selected dates; check the private calendar." : "No past selected dates yet."; continue; }
    for (const item of items) {
      const card = document.createElement("article");
      card.className = "program-item";
      const date = item.end ? `${longDate.format(localDate(item.date))} – ${longDate.format(localDate(item.end))}` : longDate.format(localDate(item.date));
      card.innerHTML = `<div class="program-date">${date}</div><div><h3>${item.title}</h3><p>${item.details}</p></div>`;
      if (denActivities[item.date]) {
        const activities = document.createElement("div");
        const plan = denActivities[item.date];
        const theme = electiveThemes[plan.theme];
        activities.innerHTML = `<h4>Shared elective: ${theme.title}</h4><ul>${["Lions", "Tigers", "Wolves", "Bears"].map((rank, index) => `<li><strong>${rank}:</strong> <a href="https://www.scouting.org/cub-scout-adventures/${theme.links[index]}/">${theme.names[index]}</a> — ${plan.ideas[index]}</li>`).join("")}</ul>`;
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
