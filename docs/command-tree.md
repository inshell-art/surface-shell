# Command Tree

Applications provide a tree of `SurfaceCommandNode` objects. Each node owns its canonical path, optional aliases, optional children, optional help renderer, optional handler, and optional side-effect metadata.

The core matches the longest path in the tree. Handlers receive the unmatched remainder as a raw string. The core does not parse shell quoting or escape sequences.
