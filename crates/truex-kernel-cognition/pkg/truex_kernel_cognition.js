/* Stub wasm-pack nodejs target — replace by `wasm-pack build --target nodejs --features wasm --out-dir pkg`. */
"use strict";

function notBuilt(name) {
  throw new Error(
    `truex-kernel-cognition/${name}: WASM pkg stub only. Run wasm-pack build --target nodejs --features wasm --out-dir pkg`,
  );
}

exports.cognition_show = function cognition_show() {
  return notBuilt("cognition_show");
};
exports.cognition_run = function cognition_run(_input_json) {
  return notBuilt("cognition_run");
};
exports.cognition_verify = function cognition_verify(_result_json) {
  return notBuilt("cognition_verify");
};
exports.cognition_replay = function cognition_replay(_run_id) {
  return notBuilt("cognition_replay");
};
exports.system_build = function system_build(_intent_json) {
  return notBuilt("system_build");
};
exports.system_verify = function system_verify(_target, _artifacts_json) {
  return notBuilt("system_verify");
};
