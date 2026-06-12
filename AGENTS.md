# AGENTS.md

## Cursor Cloud specific instructions

### What this repo is
A single self-contained Swift program, `ThreePM.swift`. It has a top-level entry
point (`ThreePM.engrave()`) that prints a fixed inscription to stdout. There is
no `Package.swift`, no package manager, no tests, and no lint configuration.

### Toolchain
- Swift is installed via `swiftly` under `~/.local/share/swiftly` and is put on
  `PATH` by `~/.profile` (sourced by login shells). `swift`/`swiftc` resolve
  through swiftly's proxy in `~/.local/share/swiftly/bin`.
- If `swift` is ever missing (e.g. snapshot lost), reinstall with swiftly:
  download `https://download.swift.org/swiftly/linux/swiftly-$(uname -m).tar.gz`,
  run `./swiftly init --assume-yes --skip-install`, source the env file, then
  `swiftly install latest --assume-yes`. The toolchain also needs the apt
  packages `libncurses-dev` and `libpython3-dev` at runtime.

### Run / build / lint / test
- Run (interpret): `swift ThreePM.swift`
- Build (compile): `swiftc ThreePM.swift -o ThreePM` then `./ThreePM`
- Lint: no repo lint config exists. The toolchain ships `swift format`
  (`swift format lint -s ThreePM.swift`), but it only emits default-style
  indentation suggestions for the current file — do not treat these as failures
  or reformat the file unless asked.
- Test: none (no `Package.swift` / XCTest targets).
