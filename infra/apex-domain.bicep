targetScope = 'resourceGroup'
param staticSiteName string = 'swa-portfolio-dev-scus-001'
param apexDomain string = 'acestus.com'
resource site 'Microsoft.Web/staticSites@2023-12-01' existing = {
  name: staticSiteName
}
resource domain 'Microsoft.Web/staticSites/customDomains@2023-12-01' = {
  parent: site
  name: apexDomain
  properties: {
    validationMethod: 'dns-txt-token'
  }
}
output domainStatus string = domain.properties.status
