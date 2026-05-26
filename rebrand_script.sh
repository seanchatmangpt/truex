#!/bin/bash
FILES_TO_REBRAND="files_to_rebrand_clean.txt"
while IFS= read -r file; do
  if [ -f "$file" ]; then
    echo "Processing $file"
    # Note: Using perl here for the subagent to run, as it's efficient for this task.
    # The subagent will run this in its own environment.
    perl -i -pe 's/wasm4pm_types/truex_kernel_types/g' "$file"
    perl -i -pe 's/wasm4pm_algos/truex_kernel_algos/g' "$file"
    perl -i -pe 's/wasm4pm_cognition/truex_kernel_cognition/g' "$file"
    perl -i -pe 's/wasm4pm/truex-kernel/g' "$file"
    perl -i -pe 's/\@wasm4pm\//\@truex\//g' "$file"
    # Also fix any double hyphens if wasm4pm was already followed by a hyphen
    perl -i -pe 's/truex-kernel-kernel/truex-kernel/g' "$file"
  fi
done < "$FILES_TO_REBRAND"
