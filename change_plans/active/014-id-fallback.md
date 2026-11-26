# 014: Id generator that works over plain HTTP

Needs: nothing.

## Goal
The app is a static client-side app, so it can be served from any host, including a plain `http://` address on a local network (for example a laptop sharing the build to a phone). `crypto.randomUUID()` only exists on secure contexts (HTTPS and `localhost`), so creating a game or a participant would throw there.

## What changes
- New `createId()` in `src/utils.ts`:
  1. if `crypto.randomUUID` is a function, use it;
  2. otherwise build a version 4 UUID from `crypto.getRandomValues`, which is available on plain HTTP;
  3. the `Math.random` fallback is not needed, since `getRandomValues` exists everywhere the app runs.
- `createGame` and `createPlayer` call `createId()` instead of `crypto.randomUUID()`. Nothing else in `src` generates ids.
- The ids keep the UUID string format, so stored data and exported files stay compatible.

## Tests
- `utils.test.ts`:
  - with `crypto.randomUUID` present, `createId()` returns its value;
  - with `randomUUID` removed (stub it as `undefined` and restore after), it returns a string matching the UUID v4 pattern (`/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/`);
  - many calls give distinct ids;
  - `createGame` and `createPlayer` still return unique string ids with the fallback.

## Done when
- Serving `build/` over plain HTTP on a LAN address lets you create a game and add participants on a phone.
