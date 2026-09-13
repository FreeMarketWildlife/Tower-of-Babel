# Tower of Babel

Stack a tower to the heavens and declare war on God.

A pixel-art physics building game: mine resources, recruit workers, craft industrial buildings, and raise a tower toward heaven. The heavenly war is the game's direction; the current playable game focuses on mining, crafting, and tower construction.

## Play locally

From the repository root, run:

```sh
python3 -m http.server 8765 --bind 127.0.0.1
```

Open http://localhost:8765/. The game lives in `tower-of-babel/`; the old `sky-stack/` entry redirects there.

## Development

No build step is required. Serve the files over HTTP so the JavaScript loader can fetch its modules. Matter.js loads from a CDN, so an internet connection is required.

See [development and regression checks](tower-of-babel/tests/README.md) and [art direction](AGENTS.md).

## Migration

Formerly Sky Stack in the Snake-Game-Test repository. This repository preserves the game's Git history and Tower of Babel's initial commit. The old Snake game remains in Git history; the root entry now opens Tower of Babel.

Existing `skyStack` local-storage keys and debug APIs are retained for compatibility. Browser saves carry over when using the same origin (scheme, host, and port). Moving to a different hosting origin does not automatically transfer browser storage.
