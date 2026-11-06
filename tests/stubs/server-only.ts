// Vitest stand-in for the `server-only` package. In the Next.js build that
// import makes a client-side import of server code fail the build; in a test
// run (plain Node) there is nothing to guard, so it resolves to nothing.
export {};
