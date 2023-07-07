import * as FsSync from "node:fs";
import * as Path from "node:path";
import { createPeerManager } from "@tests/support/peerManager";
import { gitOptions } from "@tests/support/fixtures";
import { test } from "vitest";
import { tmpDir } from "@tests/support/support";
import { HttpdClient } from "@httpd-client";

export const testFixture = test.extend({
  api: async ({ task }, use) => {
    const peerManager = await createPeerManager({
      dataDir: Path.resolve(Path.join(tmpDir, "peers")),
      outputLog: FsSync.createWriteStream(
        Path.join(tmpDir, "peerManager.log"),
      ).setMaxListeners(16),
    });
    const peer = await peerManager.startPeer({
      name: "vitest",
      gitOptions: gitOptions["alice"],
    });
    await peer.startHttpd();
    const api = new HttpdClient(peer.httpdBaseUrl);
    await use(api);
  },
});
