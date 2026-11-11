import type { CloudConfig, CloudContainer, CloudKitSdk } from "./types";
const scriptUrl = "https://cdn.apple-cloudkit.com/ck/2/cloudkit.js";
let loading: Promise<CloudKitSdk> | null = null;
let configured: { key: string; container: CloudContainer } | null = null;
declare global {
  interface Window {
    CloudKit?: CloudKitSdk;
  }
}
export function readCloudConfig(
  env: Record<string, unknown> = import.meta.env,
): CloudConfig | null {
  const containerIdentifier = String(
    env.VITE_CLOUDKIT_CONTAINER_ID ?? "",
  ).trim();
  const apiToken = String(env.VITE_CLOUDKIT_API_TOKEN ?? "").trim();
  const environment = env.VITE_CLOUDKIT_ENVIRONMENT || "development";
  if (
    !containerIdentifier ||
    !apiToken ||
    !["development", "production"].includes(String(environment))
  )
    return null;
  return {
    containerIdentifier,
    apiToken,
    environment: environment as CloudConfig["environment"],
  };
}
function loadSdk(): Promise<CloudKitSdk> {
  if (window.CloudKit) return Promise.resolve(window.CloudKit);
  if (loading) return loading;
  loading = new Promise<CloudKitSdk>((resolve, reject) => {
    const script = document.createElement("script");
    script.src = scriptUrl;
    script.async = true;
    const timeout = window.setTimeout(() => fail(), 20_000);
    function fail() {
      window.clearTimeout(timeout);
      script.remove();
      loading = null;
      reject(
        new Error(
          "iCloud konnte nicht geladen werden. Bitte prüfe deine Verbindung.",
        ),
      );
    }
    script.onload = () => {
      window.clearTimeout(timeout);
      if (window.CloudKit) resolve(window.CloudKit);
      else fail();
    };
    script.onerror = fail;
    document.head.append(script);
  });
  return loading;
}
export async function getCloudContainer(
  config: CloudConfig,
): Promise<CloudContainer> {
  const key = JSON.stringify(config);
  if (configured?.key === key) return configured.container;
  const sdk = await loadSdk();
  sdk.configure({
    containers: [
      {
        containerIdentifier: config.containerIdentifier,
        environment: config.environment,
        apiTokenAuth: {
          apiToken: config.apiToken,
          persist: true,
          signInButton: { id: "icloud-sign-in", theme: "medium" },
          signOutButton: { id: "icloud-sign-out", theme: "medium" },
        },
      },
    ],
  });
  const container = sdk.getDefaultContainer();
  configured = { key, container };
  return container;
}
