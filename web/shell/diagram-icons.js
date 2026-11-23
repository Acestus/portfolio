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
  // Pele's icon slot sets a stroke for outline icons. Give these SVGs their own defaults.
  const artwork = svg.slice(svg.indexOf("<svg"))
    .replace(/^<svg\b[^>]*>/, (tag) => {
      const sized = tag.replace(/\s+(?:width|height)="[^"]*"/g, "");
      return sized.slice(0, -1) + ' width="24" height="24">';
    })
    .replace(/\bid="([^"]+)"/g, (_, id) => `id="${prefix}${id}"`)
    .replace(/url\(#([^)]+)\)/g, (_, id) => `url(#${prefix}${id})`);
  return `<g color="black" stroke="none">${artwork}</g>`;
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
const azureIconBase = `https://stassetsprdscus001.blob.core.windows.net/assets/azure-plantuml/${assetsVersion}/`;

export function loadHostedDiagramIcons(canvas) {
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
    image.setAttribute("href", azureIconBase + path);
    icon.append(image);
  }
}
