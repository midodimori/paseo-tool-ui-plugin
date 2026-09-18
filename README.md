# paseo-tool-ui-plugin

Automatically expands Paseo's native **Edit** and **Write** tool cards on desktop
and web, so their existing file details and diffs are visible.

Paseo provides all tool rendering, diffs, paths, and actions. This plugin only
clicks the existing expansion controls; it does not create diffs or read or write
your files. Reads, searches, shell commands, and other tools keep their usual behavior.

Click a header to collapse a card. Streaming updates respect that choice while
the card remains mounted.

## Install

Requires Paseo 0.8.x on both the daemon and client.

Install directly from GitHub:

```sh
paseo plugin add https://github.com/midodimori/paseo-tool-ui-plugin.git
```

Paseo downloads and manages its own copy on the daemon host. No manual clone is needed.

In Paseo's appearance settings, select **Tool call display → Full detail** to
show individual tool cards.

To disable automatic expansion:

```sh
paseo plugin disable paseo-tool-ui-plugin
```

To enable it again:

```sh
paseo plugin enable paseo-tool-ui-plugin
```

## Compatibility

- Works with any coding-agent provider whose native cards are labeled **Edit** or **Write**.
- Applies only to visible cards in desktop/web layouts at least 720px wide.
  Mobile and narrower layouts keep their usual tool-sheet behavior.
- Cards can expand again when Paseo unmounts and remounts them, such as during scrolling.

Paseo 0.8 does not expose a native expansion API. The plugin observes the page
and clicks native tool headers, so changes to Paseo's DOM structure or labels
may require an update. It registers no custom tool renderer or timeline transformer.

## Develop

For development, clone the repository and run from its root directory:

```sh
npm ci
npm run typecheck
npm test
paseo plugin add "$PWD"
paseo plugin reload paseo-tool-ui-plugin
```

Reload after editing an installed local copy. The tests cover Edit/Write
selection, manual collapse, incoming and hidden cards, compact layouts, and cleanup.
There are no runtime dependencies or separate build steps.

## License

[MIT](LICENSE)
