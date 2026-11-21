(eval):5: parse error near `end'
(eval):5: parse error near `end'
# Runbook: Bicep, GitHub Actions, and trunk-based delivery

Open this file in Neovim with:

~~~sh
nvim docs/runbooks/bicep-github-actions-trunk.md
~~~

This runbook contains two distinct exercises:

1. A small Azure Storage static website managed by Bicep. GitHub Actions compiles Bicep on pull requests and deploys from main with OIDC federation.
2. The Acestus site change in this PR: add this guide, remove the playback sample, auto-merge, watch the production workflow, and check the public result with curl.

The Acestus release workflow does not deploy the Azure lab. The lab uses its own repository, resource group, and identity.

## 1. Prerequisites and names

Install Azure CLI, GitHub CLI, Git, curl, and Neovim. This exercise creates a public static website; publish only the synthetic page shown below. Choose a globally unique storage account name (3–24 lowercase letters/numbers).

~~~sh
export AZURE_SUBSCRIPTION_ID="00000000-0000-0000-0000-000000000000"
export AZURE_TENANT_ID="00000000-0000-0000-0000-000000000000"
export AZURE_LOCATION="centralus"
export AZURE_RESOURCE_GROUP="rg-bicep-trunk-lab"
export AZURE_STORAGE_ACCOUNT="stbiceptrunk12345"
export GH_REPO="YOUR-GITHUB-OWNER/bicep-trunk-lab"
export DEMO_APP_NAME="gh-bicep-trunk-lab"

az login --tenant "$AZURE_TENANT_ID"
az account set --subscription "$AZURE_SUBSCRIPTION_ID"
az account show --query '{name:name, id:id, tenantId:tenantId}' --output table
gh auth status
~~~

## 2. Create the demo repo and its initial files

Start on main. The first deployment is the baseline marker v1. Later, use one short-lived branch to change both the template and page to v2.

~~~sh
mkdir bicep-trunk-lab
cd bicep-trunk-lab
git init --initial-branch=main
mkdir -p infra site .github/workflows
nvim infra/main.bicep site/index.html .github/workflows/iac.yml
~~~

Paste into infra/main.bicep:

~~~bicep
targetScope = 'resourceGroup'

@minLength(3)
@maxLength(24)
@description('Globally unique lowercase storage account name.')
param storageAccountName string

@description('Azure region for the demo resource.')
param location string = resourceGroup().location

@description('Visible marker used by the curl acceptance test.')
param changeMarker string = 'v1'

resource storageAccount 'Microsoft.Storage/storageAccounts@2023-05-01' = {
  name: storageAccountName
  location: location
  kind: 'StorageV2'
  sku: {
    name: 'Standard_LRS'
  }
  tags: {
    purpose: 'bicep-trunk-lab'
    changeMarker: changeMarker
  }
  properties: {
    accessTier: 'Hot'
    allowBlobPublicAccess: false
    minimumTlsVersion: 'TLS1_2'
    supportsHttpsTrafficOnly: true
  }
}

resource blobService 'Microsoft.Storage/storageAccounts/blobServices@2025-08-01' = {
  name: '${storageAccount.name}/default'
  properties: {
    staticWebsite: {
      enabled: true
      indexDocument: 'index.html'
      errorDocument404Path: '404.html'
    }
  }
}

output storageAccountId string = storageAccount.id
output staticWebsiteUrl string = storageAccount.properties.primaryEndpoints.web
~~~

Paste into site/index.html:

~~~html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Bicep trunk lab</title>
  </head>
  <body>
    <main>
      <h1>Bicep trunk lab</h1>
      <p>change-marker: v1</p>
    </main>
  </body>
</html>
~~~

Paste into .github/workflows/iac.yml:

~~~yaml
name: Bicep trunk lab

on:
  pull_request:
    branches: [main]
    paths: ['infra/**', 'site/**', '.github/workflows/iac.yml']
  push:
    branches: [main]
    paths: ['infra/**', 'site/**', '.github/workflows/iac.yml']

permissions:
  contents: read

jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Install Bicep
        run: az bicep install
      - name: Compile Bicep
        run: az bicep build --file infra/main.bicep --stdout > /dev/null
      - name: Check page input
        run: test -s site/index.html

  deploy:
    if: github.event_name == 'push' && github.ref == 'refs/heads/main'
    needs: validate
    runs-on: ubuntu-latest
    environment: demo
    permissions:
      contents: read
      id-token: write
    env:
      AZURE_CLIENT_ID: ${{ vars.AZURE_CLIENT_ID }}
      AZURE_TENANT_ID: ${{ vars.AZURE_TENANT_ID }}
      AZURE_SUBSCRIPTION_ID: ${{ vars.AZURE_SUBSCRIPTION_ID }}
      AZURE_RESOURCE_GROUP: ${{ vars.AZURE_RESOURCE_GROUP }}
      AZURE_STORAGE_ACCOUNT: ${{ vars.AZURE_STORAGE_ACCOUNT }}
      AZURE_LOCATION: ${{ vars.AZURE_LOCATION }}
      BICEP_DEMO_MARKER: ${{ vars.BICEP_DEMO_MARKER }}
    steps:
      - uses: actions/checkout@v4
      - name: Sign in with GitHub OIDC
        uses: azure/login@v2
        with:
          client-id: ${{ vars.AZURE_CLIENT_ID }}
          tenant-id: ${{ vars.AZURE_TENANT_ID }}
          subscription-id: ${{ vars.AZURE_SUBSCRIPTION_ID }}
          audience: api://AzureADTokenExchange
      - name: Preview Azure changes
        run: |
          az deployment group what-if \
            --name "lab-$GITHUB_RUN_ID" \
            --resource-group "$AZURE_RESOURCE_GROUP" \
            --template-file infra/main.bicep \
            --parameters storageAccountName="$AZURE_STORAGE_ACCOUNT" \
                         location="$AZURE_LOCATION" \
                         changeMarker="$BICEP_DEMO_MARKER"
      - name: Apply Bicep
        run: |
          az deployment group create \
            --name "lab-$GITHUB_RUN_ID" \
            --resource-group "$AZURE_RESOURCE_GROUP" \
            --template-file infra/main.bicep \
            --parameters storageAccountName="$AZURE_STORAGE_ACCOUNT" \
                         location="$AZURE_LOCATION" \
                         changeMarker="$BICEP_DEMO_MARKER" \
            --query properties.provisioningState --output tsv
      - name: Upload the public demo page
        run: |
          az storage blob upload-batch \
            --account-name "$AZURE_STORAGE_ACCOUNT" \
            --auth-mode login \
            --destination '$web' \
            --source site \
            --overwrite
      - name: Check the live marker with curl
        run: |
          SITE_URL=$(az storage account show \
            --name "$AZURE_STORAGE_ACCOUNT" \
            --resource-group "$AZURE_RESOURCE_GROUP" \
            --query primaryEndpoints.web --output tsv)
          curl --fail --silent --show-error --location \
            --header 'Cache-Control: no-cache' "$SITE_URL" |
            grep --fixed-strings --quiet "change-marker: $BICEP_DEMO_MARKER"
~~~

PRs compile the template without Azure credentials. Only a push to main enters the demo environment and requests an OIDC token. That token is accepted only when its federated subject matches the configured repository/environment and the Azure identity has the required role assignments.

Commit these initial files and create the empty remote now, before configuring the federated credential. The first push waits until Azure and GitHub are ready.

~~~sh
git add infra/main.bicep site/index.html .github/workflows/iac.yml
git commit -m "feat: add Bicep static website lab"
gh repo create "$GH_REPO" --private --source . --remote origin
~~~

## 3. Configure an isolated Azure target and OIDC

Create a resource group and identity using your local Azure CLI login. The workflow identity gets Contributor only at this resource group and Storage Blob Data Contributor at the storage account. It receives no subscription-wide deployment role.

~~~sh
az group create --name "$AZURE_RESOURCE_GROUP" --location "$AZURE_LOCATION"

AZURE_CLIENT_ID=$(az ad app create \
  --display-name "$DEMO_APP_NAME" --query appId --output tsv)
SERVICE_PRINCIPAL_ID=$(az ad sp create \
  --id "$AZURE_CLIENT_ID" --query id --output tsv)
RESOURCE_GROUP_ID=$(az group show \
  --name "$AZURE_RESOURCE_GROUP" --query id --output tsv)

az role assignment create \
  --assignee-object-id "$SERVICE_PRINCIPAL_ID" \
  --assignee-principal-type ServicePrincipal \
  --role Contributor --scope "$RESOURCE_GROUP_ID"
~~~

For repositories created after July 15, 2026, GitHub's default OIDC subject includes immutable owner and repository IDs. Build that exact subject for the new repo and scope it to the demo environment:

~~~sh
OWNER=$(gh api "repos/$GH_REPO" --jq .owner.login)
REPO=$(gh api "repos/$GH_REPO" --jq .name)
OWNER_ID=$(gh api "users/$OWNER" --jq .id 2>/dev/null || gh api "orgs/$OWNER" --jq .id)
REPO_ID=$(gh api "repos/$GH_REPO" --jq .id)
OIDC_SUBJECT="repo:$OWNER@$OWNER_ID/$REPO@$REPO_ID:environment:demo"

az ad app federated-credential create \
  --id "$AZURE_CLIENT_ID" \
  --parameters "{\"name\":\"github-demo\",\"issuer\":\"https://token.actions.githubusercontent.com\",\"subject\":\"$OIDC_SUBJECT\",\"audiences\":[\"api://AzureADTokenExchange\"]}"
~~~

Create a GitHub environment named demo in repository Settings → Environments and restrict its deployments to main. Then set these non-secret identifiers:

~~~sh
gh variable set AZURE_CLIENT_ID --repo "$GH_REPO" --env demo --body "$AZURE_CLIENT_ID"
gh variable set AZURE_TENANT_ID --repo "$GH_REPO" --env demo --body "$AZURE_TENANT_ID"
gh variable set AZURE_SUBSCRIPTION_ID --repo "$GH_REPO" --env demo --body "$AZURE_SUBSCRIPTION_ID"
gh variable set AZURE_RESOURCE_GROUP --repo "$GH_REPO" --env demo --body "$AZURE_RESOURCE_GROUP"
gh variable set AZURE_LOCATION --repo "$GH_REPO" --env demo --body "$AZURE_LOCATION"
gh variable set AZURE_STORAGE_ACCOUNT --repo "$GH_REPO" --env demo --body "$AZURE_STORAGE_ACCOUNT"
gh variable set BICEP_DEMO_MARKER --repo "$GH_REPO" --env demo --body v1
~~~

Bootstrap the storage account and data-plane role once using your local Azure identity. The workflow identity cannot grant itself roles. Then upload the v1 page:

~~~sh
az deployment group create \
  --name lab-bootstrap \
  --resource-group "$AZURE_RESOURCE_GROUP" \
  --template-file infra/main.bicep \
  --parameters storageAccountName="$AZURE_STORAGE_ACCOUNT" \
               location="$AZURE_LOCATION" changeMarker=v1

STORAGE_ID=$(az storage account show \
  --name "$AZURE_STORAGE_ACCOUNT" \
  --resource-group "$AZURE_RESOURCE_GROUP" --query id --output tsv)

az role assignment create \
  --assignee-object-id "$SERVICE_PRINCIPAL_ID" \
  --assignee-principal-type ServicePrincipal \
  --role 'Storage Blob Data Contributor' --scope "$STORAGE_ID"

az storage blob upload-batch \
  --account-name "$AZURE_STORAGE_ACCOUNT" --auth-mode login \
  --destination '$web' --source site --overwrite

SITE_URL=$(az storage account show \
  --name "$AZURE_STORAGE_ACCOUNT" --resource-group "$AZURE_RESOURCE_GROUP" \
  --query primaryEndpoints.web --output tsv)
printf 'Demo endpoint: %s\n' "$SITE_URL"
~~~

The static website endpoint is public by design. Use synthetic content only. The storage account's ordinary blob endpoint still has anonymous blob access disabled.

## 4. Push the v1 baseline and watch it deploy

Create the private GitHub repo, then push the first commit to main:

~~~sh
git push --set-upstream origin main
~~~

Watch the main workflow and open its run in GitHub:

~~~sh
gh run list --repo "$GH_REPO" --workflow iac.yml --branch main --limit 5
RUN_ID=$(gh run list --repo "$GH_REPO" --workflow iac.yml --branch main \
  --json databaseId --jq '.[0].databaseId')
gh run watch "$RUN_ID" --repo "$GH_REPO" --exit-status
gh run view "$RUN_ID" --repo "$GH_REPO" --web
~~~

Confirm the baseline:

~~~sh
curl --fail --silent --show-error --location \
  --header 'Cache-Control: no-cache' "$SITE_URL" |
  grep --fixed-strings 'change-marker: v1'
~~~

## 5. Red/green change on a short-lived branch

Before changing anything, prove v2 is not live. This is the red step; the assertion must fail:

~~~sh
if curl --fail --silent --show-error --location \
  --header 'Cache-Control: no-cache' "$SITE_URL" |
  grep --fixed-strings --quiet 'change-marker: v2'; then
  echo 'Unexpected: v2 is already live' >&2
  exit 1
else
  echo 'Expected red: v2 is not deployed yet'
fi
~~~

Now change the Bicep default marker and HTML marker from v1 to v2. Create a short-lived feature branch from main:

~~~sh
git switch main
git pull --ff-only
git switch -c feat/marker-v2
nvim infra/main.bicep site/index.html
az bicep build --file infra/main.bicep --stdout > /dev/null
git diff --check
git diff
git add infra/main.bicep site/index.html
git commit -m "feat: publish marker v2"
git push --set-upstream origin feat/marker-v2
gh pr create --base main --head feat/marker-v2 \
  --title "Publish marker v2" \
  --body "Change the Bicep tag and static page marker together; validate on the PR and deploy from main."
~~~

Review the change, wait for PR validation, then enable squash auto-merge. The Azure deployment runs after merge to main:

~~~sh
gh pr checks --repo "$GH_REPO" --watch
gh pr merge --repo "$GH_REPO" --auto --squash
~~~

## 6. Watch deployment and run the green curl check

After merge, watch the main push run. It includes the Bicep compile, OIDC sign-in, what-if, apply, upload, and live curl check:

~~~sh
gh pr view --repo "$GH_REPO" --web
gh run list --repo "$GH_REPO" --workflow iac.yml --branch main --limit 5
RUN_ID=$(gh run list --repo "$GH_REPO" --workflow iac.yml --branch main \
  --json databaseId --jq '.[0].databaseId')
gh run watch "$RUN_ID" --repo "$GH_REPO" --exit-status
gh run view "$RUN_ID" --repo "$GH_REPO" --web
~~~

Run the same green assertion locally. It should find v2 and reject v1:

~~~sh
curl --fail --silent --show-error --location \
  --header 'Cache-Control: no-cache' "$SITE_URL" |
  grep --fixed-strings --quiet 'change-marker: v2'

if curl --fail --silent --show-error --location \
  --header 'Cache-Control: no-cache' "$SITE_URL" |
  grep --fixed-strings --quiet 'change-marker: v1'; then
  echo 'Unexpected: old marker is still live' >&2
  exit 1
else
  echo 'Expected green: v2 is live and v1 is gone'
fi
~~~

## 7. Acestus before/after acceptance test

This PR removes the sample video page and its two media files, and adds the public guide at /docs/bicep-github-actions-trunk/. Before the Acestus PR deploys, expect the sample URL to return 200 and the guide URL to return 404:

~~~sh
OLD_VIDEO_URL="https://acestus.com/videos/playback-sample/"
GUIDE_URL="https://acestus.com/docs/bicep-github-actions-trunk/"

test "$(curl --silent --show-error --output /dev/null \
  --write-out '%{http_code}' "$OLD_VIDEO_URL")" = 200
test "$(curl --silent --show-error --output /dev/null \
  --write-out '%{http_code}' "$GUIDE_URL")" = 404
echo 'Baseline verified: sample exists; guide is not deployed'
~~~

After the PR merges and the Acestus Publish-Development run succeeds, invert the expected statuses and check the unique marker:

~~~sh
test "$(curl --silent --show-error --output /dev/null \
  --write-out '%{http_code}' "$OLD_VIDEO_URL")" = 404
test "$(curl --silent --show-error --output /dev/null \
  --write-out '%{http_code}' "$GUIDE_URL")" = 200
curl --fail --silent --show-error --location \
  --header 'Cache-Control: no-cache' "$GUIDE_URL" |
  grep --fixed-strings --quiet 'ACCEPTANCE-ID: BICEP-TRUNK-2026-11'
echo 'Green: sample video is gone and the new guide is live'
~~~

The Acestus post-deployment job will also verify the exact guide bytes and require real 404s for the deleted page and media files.

## 8. Clean up

When finished, permanently delete the Azure demo resource group:

~~~sh
az group delete --name "$AZURE_RESOURCE_GROUP" --yes --no-wait
~~~

If this identity was created only for the lab, remove its Entra app registration and service principal too. After the feature branch is merged:

~~~sh
git switch main
git branch -d feat/marker-v2
~~~

## References

- [Deploy Bicep with GitHub Actions](https://learn.microsoft.com/azure/azure-resource-manager/bicep/deploy-github-actions)
- [Authenticate to Azure from GitHub Actions with OIDC](https://learn.microsoft.com/azure/developer/github/connect-from-azure-openid-connect)
- [GitHub: Configure OIDC in Azure](https://docs.github.com/en/actions/how-tos/secure-your-work/security-harden-deployments/oidc-in-azure)
- [GitHub OIDC immutable subjects](https://docs.github.com/en/actions/reference/security/oidc#immutable-subject-claims)
- [Azure Storage static website hosting](https://learn.microsoft.com/azure/storage/blobs/storage-blob-static-website)
