import test from "ava";

import Aria2 from "../lib/Aria2.js";
import promiseEvent from "../lib/promiseEvent.js";

test("#call", (t) => {
  t.plan(1);
  const aria2 = new Aria2({ secret: "foobar" });
  aria2._send = (m) => {
    t.deepEqual(m, {
      method: "aria2.foo",
      params: ["token:foobar", "bar"],
      id: 0,
      "json-rpc": "2.0",
    });
  };
  aria2.call("foo", "bar");
});

test("#multicall", (t) => {
  t.plan(1);
  const aria2 = new Aria2({ secret: "foobar" });
  aria2._send = (m) => {
    t.deepEqual(m, {
      method: "system.multicall",
      params: [
        [
          { methodName: "aria2.a", params: ["token:foobar", "1", "2"] },
          { methodName: "aria2.b", params: ["token:foobar", "1", "2"] },
        ],
      ],
      id: 0,
      "json-rpc": "2.0",
    });
  };
  aria2.multicall([
    ["a", "1", "2"],
    ["b", "1", "2"],
  ]);
});

test("#batch", (t) => {
  t.plan(1);
  const aria2 = new Aria2({ secret: "foobar" });
  aria2._send = (m) => {
    t.deepEqual(m, [
      {
        method: "aria2.a",
        params: ["token:foobar", "1", "2"],
        id: 0,
        "json-rpc": "2.0",
      },
      {
        method: "aria2.b",
        params: ["token:foobar", "1", "2"],
        id: 1,
        "json-rpc": "2.0",
      },
    ]);
  };
  aria2.batch([
    ["a", "1", "2"],
    ["b", "1", "2"],
  ]);
});

test("#listNotifications", async (t) => {
  t.plan(2);
  const aria2 = new Aria2({ secret: "foobar" });
  aria2._send = (m) => {
    t.deepEqual(m, {
      method: "system.listNotifications",
      params: ["token:foobar"],
      id: 0,
      "json-rpc": "2.0",
    });
  };

  setTimeout(() => {
    aria2._handleResponse({
      id: 0,
      result: ["aria2.foo", "bar", "system.foo"],
    });
  });

  const notifications = await aria2.listNotifications();
  t.deepEqual(notifications, ["foo", "bar", "system.foo"]);
});

test("#listMethods", async (t) => {
  t.plan(2);
  const aria2 = new Aria2({ secret: "foobar" });
  aria2._send = (m) => {
    t.deepEqual(m, {
      method: "system.listMethods",
      params: ["token:foobar"],
      id: 0,
      "json-rpc": "2.0",
    });
  };

  setTimeout(() => {
    aria2._handleResponse({
      id: 0,
      result: ["aria2.foo", "bar", "system.foo"],
    });
  });

  const methods = await aria2.listMethods();
  t.deepEqual(methods, ["foo", "bar", "system.foo"]);
});

test.cb("#_handleNotification", (t) => {
  t.plan(2);

  const aria2 = new Aria2({ secret: "foobar" });
  const params = ["foo", "bar"];

  aria2.onnotification = (method, p) => {
    t.is(method, "onDownloadStart");
    t.is(p, params);

    t.end();
  };
  aria2._handleNotification({ method: "aria2.onDownloadStart", params });
});
