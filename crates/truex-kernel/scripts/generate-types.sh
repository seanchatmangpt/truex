#!/bin/bash
set -e
echo "Generating TypeScript types from Rust..."
cargo test -p truex-kernel ts_rs_export --features bcinr
# Assuming ts-rs output is captured in a known location
# cp target/ts-rs/*.tstruex-kernel/truex-kernel/src/
echo "Type definitions updated."
