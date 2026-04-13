const CURRENT_VERSION = "0.1.0";
const GITHUB_REPO = "sunnyzhangdev/ytranscripts";

interface UpdateInfo {
  hasUpdate: boolean;
  latestVersion: string;
  downloadUrl: string;
}

export async function checkForUpdate(): Promise<UpdateInfo | null> {
  try {
    const res = await fetch(
      `https://api.github.com/repos/${GITHUB_REPO}/releases/latest`,
      { headers: { Accept: "application/vnd.github.v3+json" } }
    );
    if (!res.ok) return null;

    const data = await res.json();
    const latestTag: string = data.tag_name?.replace(/^v/, "") ?? "";
    if (!latestTag) return null;

    const hasUpdate = compareVersions(latestTag, CURRENT_VERSION) > 0;

    return {
      hasUpdate,
      latestVersion: latestTag,
      downloadUrl: data.html_url ?? `https://github.com/${GITHUB_REPO}/releases/latest`,
    };
  } catch {
    return null;
  }
}

function compareVersions(a: string, b: string): number {
  const pa = a.split(".").map(Number);
  const pb = b.split(".").map(Number);
  for (let i = 0; i < Math.max(pa.length, pb.length); i++) {
    const na = pa[i] ?? 0;
    const nb = pb[i] ?? 0;
    if (na > nb) return 1;
    if (na < nb) return -1;
  }
  return 0;
}
