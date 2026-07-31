use assert_cmd::Command;
use predicates::str::contains;
use std::fs;
use tempfile::tempdir;

fn event_log_json() -> &'static str {
    r#"{
      "attributes": [],
      "traces": [{
        "attributes": [{"key":"concept:name","value":{"type":"String","content":"case-1"},"own_attributes":null}],
        "events": [
          {"attributes":[{"key":"concept:name","value":{"type":"String","content":"A"},"own_attributes":null}]},
          {"attributes":[{"key":"concept:name","value":{"type":"String","content":"B"},"own_attributes":null}]}
        ]
      }],
      "extensions": null,
      "classifiers": null,
      "global_trace_attrs": null,
      "global_event_attrs": null
    }"#
}

fn dfg_json() -> &'static str {
    r#"{
      "nodes": [
        {"activity":"A","frequency":1},
        {"activity":"B","frequency":1}
      ],
      "edges": [{"source":"A","target":"B","frequency":1}],
      "start_activities": ["A"],
      "end_activities": ["B"]
    }"#
}

#[test]
fn discovers_real_dfg_from_json() {
    let directory = tempdir().unwrap();
    let log = directory.path().join("log.json");
    fs::write(&log, event_log_json()).unwrap();

    Command::cargo_bin("wpm")
        .unwrap()
        .args(["mining", "discover", log.to_str().unwrap(), "--algo", "dfg"])
        .assert()
        .success()
        .stdout(contains("Discovered Directly-Follows Graph"))
        .stdout(contains("A"))
        .stdout(contains("B"));
}

#[test]
fn loads_the_supplied_dfg_for_conformance() {
    let directory = tempdir().unwrap();
    let log = directory.path().join("log.json");
    let model = directory.path().join("model.json");
    fs::write(&log, event_log_json()).unwrap();
    fs::write(&model, dfg_json()).unwrap();

    Command::cargo_bin("wpm")
        .unwrap()
        .args(["mining", "conformance", log.to_str().unwrap(), model.to_str().unwrap()])
        .assert()
        .success()
        .stdout(contains("Fitness"));
}

#[test]
fn refuses_empty_models_instead_of_mocking_them() {
    let directory = tempdir().unwrap();
    let log = directory.path().join("log.json");
    let model = directory.path().join("model.json");
    fs::write(&log, event_log_json()).unwrap();
    fs::write(&model, r#"{"nodes":[],"edges":[],"start_activities":[],"end_activities":[]}"#).unwrap();

    Command::cargo_bin("wpm")
        .unwrap()
        .args(["mining", "conformance", log.to_str().unwrap(), model.to_str().unwrap()])
        .assert()
        .failure()
        .stderr(contains("must contain nodes and at least one edge"));
}
