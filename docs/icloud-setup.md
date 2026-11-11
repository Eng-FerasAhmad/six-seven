# Connect six seeeven to iCloud

The iCloud container `iCloud.com.ferasahmad.sixseeeven`, its `LearningProgress` schema, and separate Development and Production browser tokens have been created. The schema is deployed to Production. Sign-in, saving an exercise, and restoring it after clearing local progress were verified in both environments. The app is published at [six seeeven](https://eng-ferasahmad.github.io/six-seven/).

CloudKit is Apple's database service inside iCloud. A **container** is the private storage space for your app. This setup uses one child’s learning history per signed-in Apple account. Use the same account when signing in on each device; Family Sharing does not automatically combine different accounts’ private databases.

## 1. Create the container

1. Sign in to [Apple Developer](https://developer.apple.com/account/).
2. Open **Certificates, Identifiers & Profiles → Identifiers**.
3. Click **+**, select **iCloud Containers**, and continue. You can also open [Create an iCloud container](https://developer.apple.com/account/resources/identifiers/cloudContainer/add/) directly.
4. Set the description to `six seeeven`.
5. Choose a unique identifier, for example `iCloud.com.ferasahmad.sixseeeven`. Use the exact identifier that Apple registers, including capitalization.
6. Register it. Select the correct developer team if you belong to several teams.

Create an App ID with bundle identifier `com.ferasahmad.sixseeeven`, enable its iCloud capability with CloudKit support, and associate the container with it. Without this association, CloudKit Console may reject database access for the new container.

Apple's container-registration flow is also linked in [Apple’s developer documentation](https://developer.apple.com/help/account/identifiers/enable-app-capabilities).

## 2. Define the database structure

1. Open [CloudKit Console](https://icloud.developer.apple.com/) and choose **CloudKit Database**.
2. Select your new container and the **Development** environment.
3. Under **Schema → Record Types**, create a record type named **LearningProgress**.
4. Add exactly one custom field:

| Field     | Type     |
| --------- | -------- |
| `payload` | `String` |

The app stores the versioned learning history as JSON in that field. It uses the **private** database’s default zone, with record name `reber-progress-v1`. It does not use the public database and does not need a query index or a manually created record. The signed-in owner needs read/write access in their own private database; do not add public or anonymous access to progress.

For more information, see [Managing iCloud Containers](https://developer.apple.com/documentation/cloudkit/managing-icloud-containers-with-cloudkit-database-app).

## 3. Create a browser API token

1. In the container’s **Tokens & Keys** section, choose **New API Token**.
2. Name it `six seeeven local development` for local testing. Create a separate Production token for the published website.
3. Restrict **Allowed Origins** to the website origins you use:
   - `https://127.0.0.1:5173` for the local dev server.
   - `https://localhost:5173` if you use localhost.
   - `https://eng-ferasahmad.github.io` for GitHub Pages. The `/six-seven/` path is not part of an origin.
4. Keep Apple’s standard popup authentication flow; no custom redirect URL is needed by this integration.
5. Save the token and copy the **web API token**.

The browser API token identifies the app and is public in the JavaScript bundle. The user’s Apple authentication grants access to their own private data. Never put an Apple password, `.p8` signing key, or server-to-server key in the app, an environment variable beginning with `VITE_`, or this repository. The app uses Apple’s supplied sign-in and sign-out buttons, not a custom password form.

Apple reference: [CloudKit JS configuration](https://developer.apple.com/documentation/cloudkitjs/cloudkit.containerconfig).

## 4. Configure and test locally

Copy `.env.example` to `.env.local` in the project root. Fill it with your values:

```dotenv
VITE_CLOUDKIT_CONTAINER_ID=iCloud.com.ferasahmad.sixseeeven
VITE_CLOUDKIT_API_TOKEN=your-browser-api-token
VITE_CLOUDKIT_ENVIRONMENT=development
```

`.env.local` is ignored by Git. Restart `npm run dev` after changing it. The Vite dev server uses HTTPS because CloudKit's domain restrictions require an HTTPS origin. The default local certificate is self-signed, so your browser may ask you to trust it. If you have `mkcert`, generate a locally trusted certificate and run Vite with `SIX_SEEEVEN_DEV_CERT` and `SIX_SEEEVEN_DEV_KEY` pointing to its certificate and key files. Keep the private key outside this repository.

1. Download a progress backup before the first real connection.
2. Open **Einstellungen → iCloud**.
3. Click **Mit iCloud verbinden**, then use Apple’s sign-in button.
4. Complete an exercise. Wait for **Dein Fortschritt ist in iCloud gesichert**.
5. In a second browser/device, open the same site and sign in to the **same Apple account**. Use **Jetzt abgleichen** if needed.
6. Check that exercise stars, course history and completed test results appear.
7. Check offline learning: disconnect temporarily, complete an exercise, then reconnect. Verify that it syncs without losing either device’s history.

Real sign-in and save/restore in one browser were verified against your Apple container in Development and Production. A second device has not yet been tested. Automated tests use a simulated CloudKit database.

## 5. Prepare production

Development and production databases are separate. Test data does not automatically move to production.

1. Use **Deploy Schema Changes** in CloudKit Console to deploy `LearningProgress` and its `payload` field to **Production**.
2. In the Production environment, create a separate browser API token restricted to `https://eng-ferasahmad.github.io`.
3. In GitHub, open **Settings → Secrets and variables → Actions → Variables**. Add:

| Repository variable          | Value                                    |
| ---------------------------- | ---------------------------------------- |
| `VITE_CLOUDKIT_CONTAINER_ID` | Your exact container identifier          |
| `VITE_CLOUDKIT_API_TOKEN`    | Your origin-restricted browser API token |
| `VITE_CLOUDKIT_ENVIRONMENT`  | `production`                             |

The deployment workflow reads these variables during the build. Without a container and token, the website continues to use local storage. These values are bundled into the app; they are not server secrets.

The Production build is published and its real sign-in and save/restore flow were verified. When using another device, sign in with the same Apple Account and confirm the learning history appears.

## What syncs

- Completed exercises and learning stars.
- Dated course exercise attempts.
- Finished test results and answers.

Running tests stay on their current device. Preferences such as theme and font size also stay on the device. Sync occurs after changes, on reconnect/focus and about every 30 seconds while the page is visible; this first version uses polling, not push notifications.

The first sync merges existing local progress with iCloud history. Finished attempts are deduplicated by ID. Updates use CloudKit change tags and retry conflicts after fetching the latest record; they do not forcibly overwrite newer cloud data. If a browser was linked to a different Apple account, syncing is blocked to prevent mixing histories. Use the original account or a separate browser profile.

Turning syncing off leaves local and cloud data intact. Sign out using Apple’s button before turning syncing off if you also want to end the Apple session. Offline changes remain locally stored until the next successful sync. Clearing browser data before those changes sync can lose them, so keep the backup option available.

The initial implementation uses one progress record with a conservative payload limit of 700,000 UTF-8 bytes. It reports an error rather than silently dropping history if the limit is reached. Much larger histories would need multiple records or an asset-based storage design.
