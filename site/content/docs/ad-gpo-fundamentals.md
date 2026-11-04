---
title: "Incident Triage: AD, GPO, DNS & SQL/VM"
description: "A sub-5-minute incident-response playbook spanning the on-prem identity layer and the VM/SQL Server layer: how to triage a GPO that isn't applying, a hostname resolving to two different IPs, a cross-forest delegation…"
space: "Cloud & operations"
date: "2026-11-04"
draft: false
legacyArticle: "/articles/ad-gpo-fundamentals.html"
---

> A sub-5-minute incident-response playbook spanning the on-prem identity layer and the VM/SQL Server layer: how to triage a GPO that isn't applying, a hostname resolving to two different IPs, a cross-forest delegation failure, a slow or non-failing-over SQL Server, and a Hyper-V host that stops responding — each broken into **Symptom → Fast Checks → Likely Cause (ranked) → Mitigate vs. Fix → Blast Radius**, the shape an SRE on-call rotation actually needs, not just the underlying theory.



- **<5 min** — Target: Mitigation, Not Root Cause

- **2** — GPO Scoping Methods

- **Auth ≠ Delegation** — Forest Trust Gotcha

- **VM Layer ≠ SQL Layer** — Two Failure Domains, One Incident



Symptom→ Fast Checks→ Likely Cause→ Mitigate→ Fix + Blast Radius



## 0. The Sub-5-Minute Triage Loop



Every scenario below uses the same five-step shape, said out loud in an incident channel before diving into deep investigation. The target for the first five minutes is almost always **mitigation** — stopping user-facing impact — not a full root-cause fix. Separating those two explicitly is what keeps an incident bounded instead of turning into an open-ended debugging session.



| Step | Question It Answers | Time Budget |
| --- | --- | --- |
| 1. Symptom | What is the user/system actually seeing? | Immediate — this is the page/alert |
| 2. Fast Checks | What 2–3 cheap checks confirm or rule out the top cause? | ~2 min |
| 3. Likely Cause (ranked) | What's most probable first, with a fallback if check #1 doesn't confirm it? | ~1 min |
| 4. Mitigate vs. Fix | What stops the bleeding now vs. what prevents recurrence later? | ~1–2 min to decide, mitigate immediately |
| 5. Blast Radius | Who else is affected, and how do I roll back if this makes it worse? | Stated before acting, not after |



## 1. Background: Forest Trusts and Transitivity



A forest is the top-level AD boundary — a set of domains sharing a schema, configuration partition, and global catalog. When two separate forests need to interoperate (common after mergers/acquisitions, or splitting a single company into separate security boundaries), you build a **forest trust** between the two forest root domains.



The property that comes up constantly in interviews is **transitivity**:



- **Transitive trust** — trust flows automatically to every domain within the trusting forest. Domain-to-domain trusts inside a single forest (parent/child, tree-root) are transitive by default. A forest trust is also transitive across *all* domains in both forests — but only one level deep (forest A trusts forest B, it does not automatically extend to forest C that B trusts).

- **Non-transitive trust** — trust is scoped to exactly the two domains/forests you connected. Used for external trusts (NT4 domains, or one specific domain in another forest) where you want a tight, explicit boundary instead of exposing an entire forest.




Practical framing for a "how would you link two AD forests" question: *"I'd establish a two-way (or one-way, depending on trust direction needed) forest trust with selective authentication enabled, so users are trusted across the boundary but each resource domain still explicitly grants access rather than inheriting blanket authentication rights. That keeps the trust transitive at the namespace/routing level but access-controlled at the resource level."*



| Trust Type | Transitivity | Typical Use |
| --- | --- | --- |
| Parent-Child (intra-forest) | Transitive | Automatic — created when a child domain is added to a forest |
| Tree-Root (intra-forest) | Transitive | New domain tree joining an existing forest |
| Forest Trust | Transitive across all domains in both forests (one hop) | Two companies/forests need broad cross-resource access (e.g., post-M&A, or split security domains that still share services) |
| External Trust | Non-transitive | Trust one specific domain (often legacy NT4 or a single domain in another forest) without exposing the whole forest |
| Shortcut Trust | Transitive (follows existing path) | Optimize authentication path between two domains deep in a large/complex forest to skip walking the whole trust tree |



## 2. Incident: "A GPO Isn't Applying to Some Machines in an OU"



> **Symptom →** Policy missing on a subset of machines within a linked OU, everyone else fine. **Fast checks (~2 min) →** `gpresult /h report.html` on one affected machine — shows Applied vs. Denied and \*why\* in under 30 seconds. Confirm `gpupdate /force` isn't silently failing. **Likely cause, ranked →** (1) security filtering excludes that machine/user — check the Scope tab ACL first, it's the fastest and most common hit. (2) WMI filter not matching. (3) a higher-precedence Enforced GPO overriding further up the tree. **Mitigate vs. fix →** Mitigate: add the machine/group to the security filter or force a `gpupdate`. Fix: correct the underlying filter/group membership so it isn't a one-off. **Blast radius →** Contained to the filtered group — low risk to touch live.



### Background: Two Ways to Scope a GPO



This is the one that trips people up because "scoping" sounds like one thing but AD gives you two independent scoping mechanisms that stack together.



### A. Scoping by Linking (where the GPO applies structurally)



A GPO is a standalone object in the *Group Policy Objects* container — it does nothing until it's **linked** to a site, domain, or OU. Linking determines the structural scope: which part of the AD hierarchy the policy even has a chance to apply to. Link order and inheritance (with Block Inheritance / Enforced flags) control which GPO wins when multiple GPOs are linked up the tree.



- Link to a **Site** — applies to all computers physically in that AD site, regardless of domain/OU (rare, mostly for site-specific settings like proxy config)

- Link to a **Domain** — applies to every object in the domain (broadest common scope — used for domain-wide baselines like password policy)

- Link to an **OU** — applies to users/computers in that OU and (by default) its child OUs — the most common and most precise link scope




### B. Scoping by Security Filtering / WMI Filtering (who/what it applies to, within the linked scope)



Once a GPO is linked, you narrow *who it actually applies to* without moving objects between OUs:



- **Security filtering** — the GPO has an ACL. By default "Authenticated Users" have Read + Apply Group Policy. Replace that with a specific security group, and only members of that group get the policy applied — even though the GPO is linked to a much broader OU. This is the standard way to do "apply this GPO to just these 40 laptops in a 2,000-object OU" without restructuring OUs.

- **WMI filtering** — attaches a WMI query to the GPO so it only applies to machines matching a hardware/OS condition (e.g., only Windows 11, only laptops with a specific model, only if free disk space > X). Evaluated client-side at boot/logon; adds processing overhead so used sparingly.




> Interview-ready one-liner: *"Linking controls where in the AD tree a GPO can apply; security filtering and WMI filtering control who or what within that linked scope actually receives it. I usually leave the link broad — at the OU level — and use a security group in the security filter so I can add/remove targets without touching OU structure or re-linking anything."*



### Order of Precedence (the classic "LSDOU" + filtering)



```text
Local policy → Site → Domain → OU (parent to child)
  ...then within the resolved link scope:
Security filtering (ACL: Apply Group Policy = Allow) AND WMI filter match
  ...then conflict resolution:
Enforced (No Override) GPOs win over Block Inheritance
Last-applied (closest to the object, i.e. OU-level) wins on setting conflicts
```



## 3. Incident: "One Hostname Resolves to Two Different IPs"



> **Symptom →** Intermittent connection failures/timeouts to a named host; some clients succeed, some don't. **Fast checks (~2 min) →** `nslookup <host>` against 2+ DCs first — cheapest check, rules out simple replication lag (which self-clears). Then check the record's timestamp in DNS Manager: 0 = static (won't self-heal), nonzero = dynamic (should age out). **Likely cause, ranked →** (1) stale dynamic-registration record left behind after a re-IP, with scavenging off or too loose — most common in practice. (2) legitimate multi-homed host or round-robin LB — verify both IPs are actually live before assuming "stale." (3) split-horizon DNS returning different answers by view (expected, not a bug). **Mitigate vs. fix →** Mitigate: delete the stale record or force `ipconfig /registerdns` on the correct host — immediate. Fix: enable DNS scavenging/aging (7-day/7-day default) so it stops recurring without manual cleanup. **Blast radius →** Every client resolving that name risks hitting the dead IP — treat as user-facing until confirmed contained; rollback is trivial if wrong (re-add the record).



### Background: Why This Happens



A single FQDN resolving to two different IP addresses is **not automatically a problem** — it depends on why.



### Legitimate reasons a hostname has multiple A/AAAA records



- **Round-robin DNS load balancing** — intentional, multiple records for the same name spread client connections across several hosts (common for stateless web/app tiers).

- **Multi-homed host** — a single server has two NICs on different subnets (management network + production network) and both got registered.

- **Split-brain / split-horizon DNS** — internal DNS view returns a private IP, external/public DNS view returns a public IP for the same FQDN (normal for anything published through a reverse proxy or firewall NAT).

- **Migration in flight** — a server was moved/rebuilt with a new IP and both old and new records are still present during a cutover window.




### The problem case: stale/duplicate record from dynamic DNS registration



The more common troubleshooting scenario in an AD environment: a domain-joined computer or DC re-IPs (DHCP renewal, NIC change, re-image) and **dynamic DNS registration** (the client self-registering via `ipconfig /registerdns` or the Netlogon service) adds the new A record but the old one never aged out — because scavenging isn't enabled, or the record is static/manually created and won't be touched by scavenging at all.



Result: clients doing a lookup non-deterministically get routed to whichever record comes back first (or round-robin between both), so some connections succeed and some fail/timeout — intermittent, hard-to-reproduce connectivity complaints are the classic symptom.



Operational note: if it's a legitimate multi-homed host or load-balanced pair, leave both records but document it — the "fix" there is operational knowledge, not a DNS change.



## 4. Incident: Cross-Forest Auth Works, But a Downstream Call Fails ("Federated Transitive" Delegation)



> **Symptom →** A user authenticates fine directly, but an app-to-app double-hop (web app impersonating the user to hit SQL/another back-end) fails across a forest trust. **Fast checks (~2 min) →** Reproduce and read the actual error — "target principal name is incorrect" or an SSPI/Kerberos failure specifically at the second hop is the signature. Confirm first-hop auth actually succeeded (rules out a plain trust/connectivity problem) before chasing delegation config. **Likely cause, ranked →** Forest trust transitivity gives you *authentication* across the boundary automatically, one hop deep — it does **not** give you *delegation*. Most likely: constrained/resource-based constrained delegation was never configured on both sides of the trust for that specific service account. **Mitigate vs. fix →** Mitigate: often none available in minutes — be honest that this isn't a fast hot-fix, it's a scoped config change with a maintenance window. Fix: configure constrained/RBCD delegation explicitly for the SPN pair; verify selective authentication on the trust isn't blocking it too. **Blast radius →** Limited to the specific double-hop workflow, not first-hop auth broadly — say this explicitly so the incident doesn't get over-escalated.



### Background: Why Auth Succeeds but Delegation Fails



This is almost certainly pointing at **Kerberos constrained delegation across a forest trust**, and the well-known failure mode when it's misconfigured.



- Within a single domain, **unconstrained** or **constrained delegation** (or the modern **resource-based constrained delegation**) lets a front-end service (e.g., a web app) impersonate a user to a back-end service (e.g., SQL) — the "double-hop" problem.

- Across a **forest trust**, delegation does not just work by default even though the trust is transitive for authentication. Constrained delegation historically could not cross a forest boundary at all; cross-forest delegation requires either selective authentication plus explicit SPN-level configuration, or (on modern Windows Server / Entra-integrated environments) resource-based constrained delegation configured on the resource side, referencing the calling account's SID from the other forest.

- When delegation isn't trusted across the boundary, the client-side symptom is typically an SSPI/Kerberos error surfaced by the app or the OS — most commonly **"the target principal name is incorrect"** or a delegation-not-permitted error, and on the wire a KDC will return **KRB\_AP\_ERR\_BADMATCH** or a **KDC\_ERR\_BADOPTION** style failure when the requested delegation isn't authorized for that account/service pair.




## 5. VM & SQL Server Incidents (What a DBA-Background Manager Will Probe)



A manager who came up through SQL DBA work will test whether an SRE understands the layers underneath "the database is slow" — VM/host resource contention, storage I/O, and SQL Server's own wait-stats model — not just AD/identity. Same triage shape applies.



### Incident: "SQL Server on a VM is suddenly slow"



> **Symptom →** Query timeouts or high latency reported by an app team; SQL Server itself is up, just slow. **Fast checks (~2 min) →** Check **CPU ready time** on the VM (Hyper-V/VMM: `Get-VM | Get-VMProcessor` or Performance Monitor `\Hyper-V Hypervisor Virtual Processor\CPU Wait Time Per Dispatch`) to rule out host-level CPU contention before touching SQL. In parallel, run `sp_whoisactive` or check `sys.dm_exec_requests` for blocking chains and top wait types. **Likely cause, ranked →** (1) VM-level resource contention — CPU ready time high because the host is oversubscribed, or Dynamic Memory ballooning the guest. (2) SQL-side blocking/lock chain from a long-running transaction or missing index causing scans. (3) Storage latency — `PAGEIOLATCH_*` waits pointing at slow disk (check `sys.dm_io_virtual_file_stats` for read/write stall times). **Mitigate vs. fix →** Mitigate: kill the blocking session if safe, or move the VM off an oversubscribed host / disable ballooning temporarily. Fix: right-size CPU/memory reservations, add the missing index, or move the data/log files to faster storage tier. **Blast radius →** Scope to this VM/instance first — check if other guests on the same Hyper-V host are also degraded (shared host contention) before assuming it's isolated to this one SQL instance.



### Incident: "SQL Server / the VM won't fail over" (Always On Availability Group or Failover Cluster)



> **Symptom →** A node or the primary replica goes down and the Availability Group doesn't fail over automatically, or a VM in a Hyper-V/Failover Cluster doesn't live-migrate off a failing host. **Fast checks (~2 min) →** For AGs: `SELECT * FROM sys.dm_hadr_availability_replica_states` to check `synchronization_health` and whether the AG is in automatic vs. manual failover mode. For cluster/VMM: check cluster quorum state (`Get-ClusterQuorum` / Failover Cluster Manager) — a lost quorum blocks failover entirely even if nodes are healthy. **Likely cause, ranked →** (1) Replica/node is configured for **manual** failover, not automatic — common in prod for controlled cutovers, easy to mistake for a broken failover. (2) Quorum lost (not enough voting nodes/witness reachable), so the cluster refuses to act to avoid split-brain. (3) Synchronization is unhealthy (async commit mode, or the secondary is behind), so automatic failover is blocked to avoid data loss. **Mitigate vs. fix →** Mitigate: force a manual failover once you've confirmed data loss risk is acceptable, or restore quorum (bring a witness/node back, or force quorum in a true disaster). Fix: review failover mode and witness configuration so this class of incident doesn't require a manual judgment call under pressure next time. **Blast radius →** A forced failover with unsynced data is a real risk — say explicitly that you'd confirm RPO impact before forcing it, not just restore service blindly.



### Incident: "VM host is unresponsive, SQL guest along with it"



> **Symptom →** A Hyper-V host stops responding to VMM/management; VMs on it (including a SQL Server guest) are unreachable. **Fast checks (~2 min) →** Confirm from a second management path (direct RDP/console to the host, or a different VMM management server) that it's actually the host and not just a VMM service/agent issue — VMM losing contact with a healthy host is a common false alarm. **Likely cause, ranked →** (1) VMM agent or WinRM communication failure on an otherwise-healthy host (most common — host is fine, management plane isn't). (2) Host actually hung/BSOD — cluster should trigger failover of VMs to another node if this is a clustered Hyper-V deployment. (3) Network partition isolating the host from both VMM and cluster heartbeat, which risks a false failover/split-brain if quorum is misconfigured. **Mitigate vs. fix →** Mitigate: if clustered, let/force the cluster move the SQL VM to a healthy node rather than waiting on the unresponsive host. Fix: restart the VMM agent or investigate the underlying host hang; if it's WinRM/agent-only, no VM impact occurred and no failover was needed. **Blast radius →** Every VM on that host is at risk, not just the SQL guest — check the full host inventory before declaring this a single-VM incident.



### Quick-Recall Table: Concepts a SQL-DBA-Background Manager Will Ask About



| Concept | What It Means | Why an SRE Needs It |
| --- | --- | --- |
| CPU Ready Time | Time a vCPU is ready to run but waiting for the physical host scheduler | High ready time = host oversubscription, not a SQL problem — misdiagnosing this wastes the whole 5-minute budget on the wrong layer |
| Dynamic Memory / Ballooning | Hyper-V reclaiming guest memory under host pressure via a balloon driver | Can silently starve SQL Server's buffer pool even though the guest OS still reports "enough" memory — check Hyper-V dynamic memory settings before tuning `max server memory` in SQL |
| PAGEIOLATCH\_\* Waits | SQL Server waiting on a data file page read/write to complete | Points at storage, not query logic — correlate with `sys.dm_io_virtual_file_stats` stall times and the underlying VM's virtual disk/SAN latency |
| Always On Availability Group | SQL-level replication/failover across replicas, independent of the OS cluster's own failover | Two different failover layers (Windows Failover Cluster + AG) can each be healthy or unhealthy independently — check both, not just one |
| Quorum (Failover Clustering) | Voting mechanism deciding whether a cluster has enough surviving nodes/witness to safely act | Lost quorum blocks automatic failover on purpose, to avoid split-brain — explains "why didn't it just fail over" even when nodes look fine |
| RPO / RTO | Recovery Point Objective (how much data loss is acceptable) / Recovery Time Objective (how fast to restore) | Forcing a failover with an out-of-sync secondary trades RTO for RPO — be ready to state that trade-off explicitly, it's exactly the kind of judgment call a DBA-background manager will probe |
| Live Migration / VM Failover | Moving a running VM to another host, either planned (live migration) or reactive (cluster failover after host failure) | SQL guest availability depends on the VM layer succeeding first — an SRE needs both the Hyper-V/cluster view and the SQL/AG view to triage correctly |



## 6. General Incident-Management Loop (Beyond These Scenarios)



The same shape generalizes past AD/DNS/GPO to any on-call incident:



Detect→ Triage→ Mitigate→ Fix→ Review



- **Claim and communicate first.** Acknowledge the incident, establish scope/blast radius, and post a status update early — even "still investigating" beats silence.

- **Runbook-first instinct.** Check for an existing runbook or known-error match before deep investigation. The fastest path to a sub-5-minute mitigation is pattern-matching to something that's happened before, not re-deriving root cause from scratch every time.

- **Escalation discipline.** Set a personal time-box — e.g., "if I don't have a mitigation path in 3 minutes, I loop in a second person" — rather than debugging solo past the point where it's still a fast incident.

- **Blameless review.** After mitigation, feed the fix back into monitoring or the runbook (DNS scavenging alerts, GPO drift detection) so the same class of incident is faster to catch — or doesn't happen — next time.
