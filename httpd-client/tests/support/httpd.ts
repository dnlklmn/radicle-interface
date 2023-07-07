import type { HttpdClient } from "@httpd-client";
import type { RadiclePeer } from "@tests/support/peerManager";

import { sessionPayloadSchema } from "@httpd-client/lib/session";

export async function authenticate(
  api: HttpdClient,
  peer: RadiclePeer,
): Promise<string> {
  const { stdout } = await peer.rad(["web", "--json"]);
  const session = sessionPayloadSchema.safeParse(JSON.parse(stdout));

  if (!session.success) {
    throw new Error("Failed to parse session payload");
  }

  const { sessionId, signature, publicKey } = session.data;
  await api.session.update(sessionId, {
    sig: signature,
    pk: publicKey,
  });

  return sessionId;
}
