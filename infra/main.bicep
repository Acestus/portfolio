targetScope = 'resourceGroup'

// ---------------------------------------------------------------------------
// Parameters
// ---------------------------------------------------------------------------

@minLength(2)
@maxLength(8)
@description('The project name used in resource naming conventions.')
param projectName string = 'prtflio'

@allowed([
  'dev'
  'stg'
  'prd'
])
@description('The deployment environment.')
param environment string

@minLength(3)
@maxLength(8)
@description('The Azure region code used in resource naming conventions.')
param regionCode string = 'usw2'

@minLength(3)
@maxLength(3)
@description('The instance number used in resource naming conventions.')
param instanceNumber string = '001'

@description('Tags to apply to all resources.')
param tags object = {
  project: 'portfolio'
  environment: environment
  managedBy: 'bicep'
  owner: 'acestus'
}

@description('The Azure region where resources will be deployed.')
param location string = resourceGroup().location

// ---------------------------------------------------------------------------
// Variables
// ---------------------------------------------------------------------------

var staticWebAppName = 'stapp-${projectName}-${environment}-${regionCode}-${instanceNumber}'

// ---------------------------------------------------------------------------
// Azure Static Web App
// ---------------------------------------------------------------------------

resource staticWebApp 'Microsoft.Web/staticSites@2024-04-01' = {
  name: staticWebAppName
  location: location
  tags: tags
  sku: {
    name: 'Free'
    tier: 'Free'
  }
  properties: {
    stagingEnvironmentPolicy: 'Enabled'
    allowConfigFileUpdates: true
    buildProperties: {
      skipGithubActionWorkflowGeneration: true
    }
  }
}

// ---------------------------------------------------------------------------
// Outputs
// ---------------------------------------------------------------------------

@description('The name of the Static Web App.')
output staticWebAppName string = staticWebApp.name

@description('The default hostname of the Static Web App.')
output staticWebAppHostName string = staticWebApp.properties.defaultHostname
