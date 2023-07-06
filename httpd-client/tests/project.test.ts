import { HttpdClient } from "../index";
import {
  aliceMainHead,
  aliceRemote,
  bobRemote,
  cobRid,
  sourceBrowsingRid,
} from "@tests/support/fixtures";
import { authenticate } from "./support/httpd";
import { describe, test, expect } from "vitest";
import { isMatch } from "lodash";

const api = new HttpdClient({
  hostname: "127.0.0.1",
  port: 8080,
  scheme: "http",
});

describe("project", () => {
  test("#getByDelegate(delegateId)", async () => {
    await api.project.getByDelegate(aliceRemote);
  });

  test("#getAll()", async () => {
    await api.project.getAll();
  });

  test("#getById(id)", async () => {
    await api.project.getById(sourceBrowsingRid);
  });

  test("#getActivity(id)", async () => {
    await api.project.getActivity(sourceBrowsingRid);
  });

  test("#getReadme(id, sha)", async () => {
    await api.project.getReadme(sourceBrowsingRid, aliceMainHead);
  });

  test("#getBlob(id, sha, path)", async () => {
    await api.project.getBlob(sourceBrowsingRid, aliceMainHead, "src/true.c");
  });

  test("#getTree(id, sha)", async () => {
    await api.project.getTree(sourceBrowsingRid, aliceMainHead);
  });

  test("#getTree(id, sha, path)", async () => {
    await api.project.getTree(sourceBrowsingRid, aliceMainHead, "src");
  });

  test("#getAllRemotes(id)", async () => {
    await api.project.getAllRemotes(sourceBrowsingRid);
  });

  test("#getRemoteByPeer(id, peer)", async () => {
    await api.project.getRemoteByPeer(
      sourceBrowsingRid,
      aliceRemote.substring(8),
    );
  });

  test("#getAllCommits(id)", async () => {
    await api.project.getAllCommits(sourceBrowsingRid);
  });

  // TODO: test since/until properly.
  test("#getAllCommits(id, {parent, since, until, page, perPage})", async () => {
    await api.project.getAllCommits(sourceBrowsingRid, {
      parent: aliceMainHead,
      since: 1679065819581,
      until: 1679065819590,
      page: 1,
      perPage: 2,
    });
  });

  test("#getCommitBySha(id, sha)", async () => {
    await api.project.getCommitBySha(sourceBrowsingRid, aliceMainHead);
  });

  test("#getDiff(id, revisionBase, revisionOid)", async () => {
    await api.project.getDiff(
      sourceBrowsingRid,
      "90f6d058ece12f75f349bc7bbe88142187fe0379",
      aliceMainHead,
    );
  });

  test("#getIssueById(id, issueId)", async () => {
    await api.project.getIssueById(
      cobRid,
      "4fc727e722d3979fd2073d9b56b2751658a4ae79",
    );
  });

  test("#getAllIssues(id)", async () => {
    await api.project.getAllIssues(cobRid, {
      page: 0,
      perPage: 5,
      state: "open",
    });
  });

  describe("issue", async () => {
    const sessionId = await authenticate(api);

    test("#createIssue(id, { title, description, assignees, tags })", async () => {
      const { id: issueId } = await api.project.createIssue(
        cobRid,
        {
          title: "aaa",
          description: "bbb",
          assignees: [],
          tags: ["bug", "documentation"],
        },
        sessionId,
      );
      await assertIssue(issueId, {
        title: "aaa",
        discussion: [{ body: "bbb" }],
        assignees: [],
        tags: ["bug", "documentation"],
      });
    });

    test("#updateIssue(id, issueId, { type: 'edit' }, authToken)", async () => {
      const issueId = await createIssueToBeModified(api, sessionId);
      await api.project.updateIssue(
        cobRid,
        issueId,
        { type: "edit", title: "ccc" },
        sessionId,
      );
      await assertIssue(issueId, { title: "ccc" });
    });

    test("#updateIssue(id, issueId, { type: 'tag' }, authToken)", async () => {
      const issueId = await createIssueToBeModified(api, sessionId);
      await api.project.updateIssue(
        cobRid,
        issueId,
        { type: "tag", add: ["bug"], remove: [] },
        sessionId,
      );
      await assertIssue(issueId, { tags: ["bug"] });
    });

    test("#updateIssue(id, issueId, { type: 'assign' }, authToken)", async () => {
      const issueId = await createIssueToBeModified(api, sessionId);
      const assignee = bobRemote.replace("did:key:", "");
      await api.project.updateIssue(
        cobRid,
        issueId,
        {
          type: "assign",
          add: [assignee],
          remove: [],
        },
        sessionId,
      );
      await assertIssue(issueId, { assignees: [`did:key:${assignee}`] });
    });

    test("#updateIssue(id, issueId, { type: 'lifecycle' }, authToken)", async () => {
      const issueId = await createIssueToBeModified(api, sessionId);
      await api.project.updateIssue(
        cobRid,
        issueId,
        { type: "lifecycle", state: { status: "closed", reason: "solved" } },
        sessionId,
      );
      await assertIssue(issueId, {
        state: { status: "closed", reason: "solved" },
      });
    });
  });

  test("#getPatchById(id, patchId)", async () => {
    await api.project.getPatchById(
      cobRid,
      "013f8b2734df1840b2e33d52ff5632c8d66b199a",
    );
  });

  test("#getAllPatches(id)", async () => {
    await api.project.getAllPatches(cobRid);
  });

  describe("patch", async () => {
    const sessionId = await authenticate(api);

    test("#createPatch(id, patchCreate, authToken)", async () => {
      const { id: oid } = await api.project.createPatch(
        cobRid,
        {
          title: "ppp",
          description: "qqq",
          target: "d7dd8cecae16b1108234e09dbdb5d64ae394bc25",
          oid: "38c225e2a0b47ba59def211f4e4825c31d9463ec",
          tags: [],
        },
        sessionId,
      );
      await assertPatch(oid, {
        title: "ppp",
        state: { status: "open" },
        target: "delegates",
        tags: [],
        revisions: [
          {
            description: "qqq",
            base: "d7dd8cecae16b1108234e09dbdb5d64ae394bc25",
            oid: "38c225e2a0b47ba59def211f4e4825c31d9463ec",
          },
        ],
      });
    });

    test("#updatePatch(id, patchId, { type: 'edit' }, authToken)", async () => {
      const patchId = await createPatchToBeModified(api, sessionId);
      await api.project.updatePatch(
        cobRid,
        patchId,
        { type: "tag", add: ["bug"], remove: [] },
        sessionId,
      );
      await assertPatch(patchId, {
        tags: ["bug"],
      });
    });
  });
});

async function createIssueToBeModified(api: HttpdClient, sessionId: string) {
  const { id } = await api.project.createIssue(
    cobRid,
    { title: "aaa", description: "bbb", assignees: [], tags: [] },
    sessionId,
  );

  return id;
}

async function createPatchToBeModified(api: HttpdClient, sessionId: string) {
  const { id } = await api.project.createPatch(
    cobRid,
    {
      title: "rrr",
      description: "ttt",
      target: "d7dd8cecae16b1108234e09dbdb5d64ae394bc25",
      oid: "38c225e2a0b47ba59def211f4e4825c31d9463ec",
      tags: [],
    },
    sessionId,
  );

  return id;
}

async function assertIssue(oid: string, change: Record<string, any>) {
  expect(
    //@prettier-ignore looks more readable than what prettier suggests.
    isMatch(await api.project.getIssueById(cobRid, oid), change),
  ).toBe(true);
}

async function assertPatch(oid: string, change: Record<string, any>) {
  expect(
    //@prettier-ignore looks more readable than what prettier suggests.
    isMatch(await api.project.getPatchById(cobRid, oid), change),
  ).toBe(true);
}
