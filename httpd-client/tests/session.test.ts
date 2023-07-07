import * as Path from "node:path";
import * as FsSync from "node:fs";
import { tmpDir } from "@tests/support/support";
import { HttpdClient } from "../index";
import { describe, test } from "vitest";
import { authenticate } from "./support/httpd";
import { createPeerManager } from "@tests/support/peerManager";
import { gitOptions } from "@tests/support/fixtures";

describe("session", async () => {
  const peerManager = await createPeerManager({
    dataDir: Path.resolve(Path.join(tmpDir, "peers")),
    outputLog: FsSync.createWriteStream(
      Path.join(tmpDir, "peerManager.log"),
    ).setMaxListeners(16),
  });
  const peer = await peerManager.startPeer({
    name: "session",
    gitOptions: gitOptions["alice"],
  });
  await peer.startHttpd();
  const api = new HttpdClient(peer.httpdBaseUrl);

  test("#getById(id)", async () => {
    const id = await authenticate(api, peer);
    await api.session.getById(id);
  });

  // TODO: We have the endpoint ready, but we need to figure out how to sign the session payload.
  test.todo("#update(id, {sig, pk})");

  test("#delete(id)", async () => {
    const id = await authenticate(api, peer);
    await api.session.delete(id);
  });
});
