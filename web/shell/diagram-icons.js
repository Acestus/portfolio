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
import costManagement from "./diagram-icons/costManagement.svg" with { type: "text" };
import virtualNetwork from "./diagram-icons/virtualNetwork.svg" with { type: "text" };

const icons = new Map([
  ["azure:sql-database", sql],
  ["azure:kubernetes-service", kubernetes],
  ["azure:container-registry", containerRegistry],
  ["azure:cosmos-db", cosmosDb],
  ["azure:load-balancer", loadBalancer],
  ["azure:active-directory", activeDirectory],
  ["azure:monitor", monitor],
  ["azure:cost-management", costManagement],
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

// Azure-PlantUML distribution paths, pinned to the version uploaded to Azure Storage.
const azureIconPaths = new Map([
  ["azure:sql-database", "Databases/AzureSqlDatabase.svg"],
  ["azure:kubernetes-service", "Containers/AzureKubernetesService.svg"],
  ["azure:container-registry", "Containers/AzureContainerRegistry.svg"],
  ["azure:cosmos-db", "Databases/AzureCosmosDb.svg"],
  ["azure:load-balancer", "Networking/AzureLoadBalancer.svg"],
  ["azure:active-directory", "Identity/AzureActiveDirectory.svg"],
  ["azure:monitor", "Management/AzureMonitor.svg"],
  ["azure:cost-management", "Management/AzureCostManagement.svg"],
  ["azure:virtual-network", "Networking/AzureVirtualNetwork.svg"],
  ["azure:event-hub", "Analytics/AzureEventHub.svg"],
  ["azure:functions", "Compute/AzureFunction.svg"],
  ["azure:virtual-machine", "Compute/AzureVirtualMachine.svg"],
  ["azure:key-vault", "Security/AzureKeyVault.svg"],
  ["azure:policy", "Management/AzurePolicy.svg"],
]);

const assetsVersion = "f360835f8794e18bed6520bb2eea56b482816d95";
const siteStorageAccounts = new Map([
  ["orange-tree-06ac39010", "stvideosdevscus001"],
  ["ambitious-field-01ba59010", "stvideosstgscus001"],
  ["nice-river-0bd934610", "stvideosprdscus001"],
]);

function getAzureIconBase(hostname) {
  if (hostname === "acestus.com" || hostname === "www.acestus.com") {
    return `https://stvideosprdscus001.z21.web.core.windows.net/assets/azure-plantuml/${assetsVersion}/`;
  }
  if (!hostname.endsWith(".azurestaticapps.net")) return undefined;
  const site = hostname.split(".")[0];
  for (const [prefix, account] of siteStorageAccounts) {
    if (site === prefix || site.startsWith(`${prefix}-`)) {
      return `https://${account}.z21.web.core.windows.net/assets/azure-plantuml/${assetsVersion}/`;
    }
  }
}

export function loadHostedDiagramIcons(canvas) {
  const base = getAzureIconBase(location.hostname);
  if (!base) return;

  for (const icon of canvas.querySelectorAll("svg.pele-icon[data-icon]")) {
    const path = azureIconPaths.get(icon.getAttribute("data-icon"));
    if (!path) continue;
    const image = document.createElementNS("http://www.w3.org/2000/svg", "image");
    image.setAttribute("width", "24");
    image.setAttribute("height", "24");
    image.addEventListener("load", () => {
      for (const child of [...icon.children]) {
        if (child !== image) child.remove();
      }
    }, { once: true });
    image.addEventListener("error", () => image.remove(), { once: true });
    image.setAttribute("href", base + path);
    icon.append(image);
  }
}
