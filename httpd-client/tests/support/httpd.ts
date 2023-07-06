import type { HttpdClient } from "@httpd-client";

import * as Path from "node:path";
import { execa } from "execa";
import { tmpDir } from "@tests/support/support";

export async function authenticate(api: HttpdClient): Promise<string> {
  const { stdout } = await execa("rad", ["web", "--json"], {
    env: {
      // eslint-disable-next-line @typescript-eslint/naming-convention
      RAD_HOME: Path.join(tmpDir, "peers", "palm", "home"),
    },
  });
  const session: { sessionId: string; signature: string; publicKey: string } =
    JSON.parse(stdout);
  await api.session.update(session.sessionId, {
    sig: session.signature,
    pk: session.publicKey,
  });

  return session.sessionId;
}
