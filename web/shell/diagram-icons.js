import sql from "./diagram-icons/sql.svg" with { type: "text" };
import eventHub from "./diagram-icons/eventHub.svg" with { type: "text" };
import functions from "./diagram-icons/functions.svg" with { type: "text" };
import virtualMachine from "./diagram-icons/virtualMachine.svg" with { type: "text" };
import keyVault from "./diagram-icons/keyVault.svg" with { type: "text" };
import policy from "./diagram-icons/policy.svg" with { type: "text" };
import lakehouse from "./diagram-icons/lakehouse.svg" with { type: "text" };
import eventstream from "./diagram-icons/eventstream.svg" with { type: "text" };
import eventhouse from "./diagram-icons/eventhouse.svg" with { type: "text" };
import powerBi from "./diagram-icons/powerBi.svg" with { type: "text" };

import kubernetes from "./diagram-icons/kubernetes.svg" with { type: "text" };
import containerRegistry from "./diagram-icons/containerRegistry.svg" with { type: "text" };
import cosmosDb from "./diagram-icons/cosmosDb.svg" with { type: "text" };
import loadBalancer from "./diagram-icons/loadBalancer.svg" with { type: "text" };
import activeDirectory from "./diagram-icons/activeDirectory.svg" with { type: "text" };
import monitor from "./diagram-icons/monitor.svg" with { type: "text" };
import virtualNetwork from "./diagram-icons/virtualNetwork.svg" with { type: "text" };

const icons = new Map([
  ["azure:sql-database", sql],
  ["azure:kubernetes-service", kubernetes],
  ["azure:container-registry", containerRegistry],
  ["azure:cosmos-db", cosmosDb],
  ["azure:load-balancer", loadBalancer],
  ["azure:active-directory", activeDirectory],
  ["azure:monitor", monitor],
  ["azure:virtual-network", virtualNetwork],
  ["azure:event-hub", eventHub],
  ["azure:functions", functions],
  ["azure:virtual-machine", virtualMachine],
  ["azure:key-vault", keyVault],
  ["azure:policy", policy],
  ["fabric:lakehouse", lakehouse],
  ["fabric:eventstream", eventstream],
  ["fabric:eventhouse", eventhouse],
  ["fabric:power-bi", powerBi],
]);

let nextIconId = 0;

export function resolveDiagramIcon(name) {
  const svg = icons.get(name);
  if (!svg) return undefined;

  // An icon may occur multiple times in one diagram. Keep its gradient IDs local to that copy.
  const prefix = `diagram-icon-${++nextIconId}-`;
  return svg
    .replace(/\bid="([^"]+)"/g, (_, id) => `id="${prefix}${id}"`)
    .replace(/url\(#([^)]+)\)/g, (_, id) => `url(#${prefix}${id})`);
}
