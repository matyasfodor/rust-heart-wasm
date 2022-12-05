# Rust ❤️ WASM

This repo is meant to be a collection of Rust and Webassembly experiments, npm libraries and demo projects. All of this is not considered production ready by any means.

The project uses NPM workspaces to share library code with the demos, wasmpack for compiling Rust to WASM and Vite for wiring together the frontends.

## Packages

### Wasm forceatlas 2

Based on the Rust forceatlas implementation ([forceatlas2](https://crates.io/crates/forceatlas2)), this is a binding between js and the Rust implementation. The long term plan is to create a faithful implementation of the [Graphology - forceatlas2](https://graphology.github.io/standard-library/layout-forceatlas2.html) npm library to serve as a drop-in replacement of the pure JavaScript implementation with a better performance.