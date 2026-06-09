# Command Tree

Applications provide a tree of `SurfaceCommandNode` objects. Each node owns its canonical path, optional aliases, optional children, optional help renderer, optional handler, and optional side-effect metadata.

The core matches the longest path in the tree. Handlers receive the unmatched remainder as a raw string. The core does not parse shell quoting or escape sequences.

Branch nodes should be useful by themselves. A user who types `config` should see the local `config` map rather than a syntax error.

Aliases are compatibility tools. Default help should teach canonical commands.
