# Sample data in Azure Storage

The environment mapping is in [`config/sample-storage.json`](../config/sample-storage.json). Development uses storage account `stvideosdevscus001` in `rg-videos-dev`. Staging uses storage account `stvideosstgscus001` in `rg-videos-stg`. Production uses storage account `stvideosprdscus001` in `rg-videos-prd`. The development account is provisioned in South Central US. The mapping contains resource names, not credentials. These video resources are separate from the Portfolio Static Web App resources.

The staging and production accounts were created separately in Azure; this repository does not provision accounts or upload files during deployment. The infrastructure deployment source is `Acestus/infra`; coordinate infrastructure changes there. The same site artifact is promoted between environments, so do not embed environment-specific credentials or private data in the static site.

Keep playback test videos in the development and staging accounts only. The private `videos` containers in both accounts now contain the Particle Storm AV1/WebM and H.264/MP4 files. Do not publish the playback sample to production. Production account `stvideosprdscus001` serves the AV1/WebM encode at `$web/videos/particle-storm-av1.webm` and the H.264/MP4 encode at `$web/videos/particle-storm-h264.mp4`. The files are about 16.6 MB and 9.5 MB. Files in `$web` are public; the `videos` containers in development, staging, and production remain private.

The videos page lists AV1 before H.264. Browsers that support the declared AV1 codec select it; browsers that cannot play it can use the H.264 source. The production page should point to the two production encodes, while development and staging retain the test videos. Keep stage-specific video inventory in storage rather than placing the test clips in the shared production site artifact.

## Upload approved video files

Use an existing private blob container and a local directory containing only data approved for that environment. Confirm the target subscription, account, resource group and container before uploading. The operator needs Azure CLI authentication and an appropriate blob data-plane role (such as Storage Blob Data Contributor) on the target container or account. Management-plane access alone does not grant blob access. Network restrictions may also require an approved network path.

For development, after `az login` and selecting the correct subscription:

```sh
az storage account show --resource-group rg-videos-dev --name stvideosdevscus001 --query '{name:name,resourceGroup:resourceGroup}' -o json
az storage blob upload-batch --account-name stvideosdevscus001 --auth-mode login \
  --destination '<existing-container>' --source '<local-sample-directory>'
```

For staging, use `stvideosstgscus001` and `rg-videos-stg` in the same commands. For production, use `stvideosprdscus001` and `rg-videos-prd`, and upload only data approved for production. Uploads can overwrite matching blob names; review the destination and CLI behavior before running them. Do not commit account keys, connection strings, SAS tokens, or sensitive sample files. Verify uploaded blob names with `az storage blob list --account-name <account> --container-name <container> --auth-mode login -o table` using the same identity.
