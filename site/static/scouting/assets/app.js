const program = [
  ["2026-08-24", "Kickoff, Bobcat Adventure, Fitness", "Red Light-Green Light; introductions", "First meeting, Scout Oath/Law, goal-setting, relay/fitness challenge"],
  ["2026-09-14", "Faith and Values", "Common Ground; Guess Who", "Family faith activity, craft, teamwork"],
  ["2026-09-21", "Citizenship", "Citizenship Bingo", "Community service talk, Pack project plan"],
  ["2026-09-28", "Pack Meeting #1: Team Building & Service", "Popcorn Pop; Steal the Bacon; Paper Plate Relay", "Group games, awards, service and teamwork activities", "pack"],
  ["2026-10-05", "Outdoors", "Critter Dash; Crows & Cranes", "Hike, nature skills, outdoor skills"],
  ["2026-10-19", "Safety", "Sleeping Steve; Kim's Game", "First aid, emergency routine"],
  ["2026-10-26", "Pack Meeting #2: Fall Campout", "Crab Relay; Pass the Hoop", "First campout, camping skills, flag ceremony", "pack campout"],
  ["2026-11-02", "Let's Camp / Leave No Trace / Build It", "Modeling Magic; Rock Paper Scissors Hop", "Camping basics, gear demo, nature hike"],
  ["2026-11-09", "STEM: Super Science / Baloo the Builder", "Three Pin Bowling; Balloon Pop Relay", "STEM fun, building challenge"],
  ["2026-11-23", "Service Project", "Floating Treasure; Back to Back Get Up", "Food drive, community help, gratitude"],
  ["2026-12-07", "Creative: Race Time / Marble Madness", "Race car relay; Blanket Ball", "Pinewood car prep, marble games"],
  ["2026-12-21", "Pack Meeting #3: Pinewood Derby & Holiday Awards", "Popcorn Pop; Duck Duck Goose; Derby Car Relay", "Pinewood Derby race and awards night", "pack"],
  ["2027-01-11", "Critter Care / Germs Alive!", "Guess Who; Hot and Cold", "Animal care, hygiene science"],
  ["2027-01-18", "Sportsmanship", "Over & Under Relay; Five Hundred", "Sportsmanship and games focus"],
  ["2027-01-25", "Wheels", "Bike obstacle; Pass the Hoop", "Bike rodeo, safety, winter riding tips"],
  ["2027-02-01", "Winter Nature Hike / Eco", "Kim's Game; Number Call-Out", "Nature walk, wildlife observation"],
  ["2027-02-08", "Advancement & Progress Review", "Modeling Magic; Find the Leader", "Badge paperwork and next-adventure planning"],
  ["2027-02-22", "Pack Meeting #4: Winter Campout", "Bucket Brigade Relay; Forehead Squeeze Relay", "Winter skills, night hike, Pack fire, awards", "pack campout"],
  ["2027-03-01", "Forensics / Digging in the Past", "Detective game; Cups and Downs", "Detectives, fossils, hands-on learning"],
  ["2027-03-15", "Community Visit / Field Trip", "Ring Call Ball; Juggler Toss", "Guest speaker, fire/police visit, or field trip"],
  ["2027-03-22", "Clean Up or Community Project", "Paper Plate Relay; Owls & Crows", "Park or school clean-up, citizenship reflection"],
  ["2027-04-05", "Champions for Nature / Wolf Adventure", "Crab Relay; Blanket Ball", "Earth stewardship event"],
  ["2027-04-19", "Skits, Songs, and Showcase", "Blanket Ball; Barnyard Babble", "Prepare for spring finale and teamwork"],
  ["2027-04-26", "Pack Meeting #5: Liberty in Action", "Crab Relay; Citizenship Bingo", "Flag ceremony, voting, civics, adventure-based Pack theme", "pack"],
  ["2027-05-03", "Bridging Prep / Advancement Review", "Common Ground; Cootie", "Celebration planning, gratitude, end-of-year reflection"],
  ["2027-05-10", "Pack Meeting #6: Bridging / Final Awards & Swim", "In the Pool; Gum Glove Relay", "Bridging, swim safety, final awards, parent thank-yous", "pack"]
].map(([date, focus, activity, notes, type = "den"]) => ({ date, focus, activity, notes, type }));

const dateFormat = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", weekday: "short" });
const longDate = new Intl.DateTimeFormat("en-US", { month: "long", day: "numeric", year: "numeric" });

const byId = (id) => document.getElementById(id);

function localDate(date) {
  return new Date(`${date}T12:00:00`);
}

function renderProgram(filter = "all") {
  const list = byId("programList");
  list.innerHTML = "";
  program
    .filter((item) => filter === "all" || item.date.startsWith(filter) || item.type.includes(filter))
    .forEach((item) => {
      const card = document.createElement("article");
      card.className = `program-item ${item.type}`;
      card.innerHTML = `
        <div class="program-date">${dateFormat.format(localDate(item.date))}</div>
        <div>
          <h3>${item.focus}</h3>
          <p>${item.notes}</p>
          <div class="meta">
            <span class="pill">${item.activity}</span>
            <span class="pill">${item.type.includes("pack") ? "Pack meeting" : "Den meeting"}</span>
          </div>
        </div>`;
      list.append(card);
    });
}

function renderPackCards() {
  const cards = byId("packCards");
  cards.innerHTML = "";
  program
    .filter((item) => item.type.includes("pack"))
    .forEach((item, index) => {
      const card = document.createElement("article");
      card.className = "pack-card";
      card.innerHTML = `
        <p class="eyebrow">Pack Meeting ${index + 1}</p>
        <h3>${item.focus.replace(/^Pack Meeting #\\d: /, "")}</h3>
        <p>${longDate.format(localDate(item.date))}</p>
        <div class="meta"><span class="pill">${item.activity}</span></div>`;
      cards.append(card);
    });
}


document.querySelectorAll('[data-filter]').forEach(button=>button.addEventListener('click',()=>{document.querySelectorAll('[data-filter]').forEach(item=>item.classList.remove('active'));button.classList.add('active');renderProgram(button.dataset.filter);}));document.getElementById('printButton').addEventListener('click',()=>window.print());renderProgram();renderPackCards();
