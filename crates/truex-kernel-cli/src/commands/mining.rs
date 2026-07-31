use anyhow::{bail, Context, Result};
use clap::{Args, Subcommand};
use colored::Colorize;
use std::fs;
use std::io::BufReader;
use std::path::{Path, PathBuf};
use truex_kernel_algos::{alpha, conformance, dfg, heuristic};
use truex_kernel_cli::io::{Io, Table};
use truex_kernel_types::import::xes::{import_xes, XESImportOptions};
use truex_kernel_types::{DFG, EventLog};

#[derive(Args, Debug)]
pub struct MiningArgs {
    #[command(subcommand)]
    pub command: MiningCommands,
}

#[derive(Subcommand, Debug)]
pub enum MiningCommands {
    /// Discover a process model from an event log.
    Discover {
        /// Path to the event log file (.xes or .json)
        input: PathBuf,
        /// Algorithm to use (dfg, heuristic, alpha)
        #[arg(short, long, default_value = "heuristic")]
        algo: String,
        /// Activity key to use (e.g. "concept:name")
        #[arg(short, long, default_value = "concept:name")]
        activity_key: String,
    },
    /// Check conformance of an event log against a serialized DFG model.
    Conformance {
        /// Path to the event log file (.xes or .json)
        log: PathBuf,
        /// Path to a JSON DFG model
        model: PathBuf,
        /// Activity key to use
        #[arg(short, long, default_value = "concept:name")]
        activity_key: String,
    },
}

pub fn run(args: &MiningArgs, verbose: bool) -> Result<()> {
    let io = Io::new(verbose);
    match &args.command {
        MiningCommands::Discover {
            input,
            algo,
            activity_key,
        } => {
            io.info(format!("Discovering model from {:?} using {}...", input, algo));
            let log = load_log(input)?;
            if log.is_empty() || log.event_count() == 0 {
                bail!("Event log contains no traces or events");
            }
            match algo.as_str() {
                "dfg" => print_dfg(&dfg::discover_dfg(&log, activity_key).context("DFG discovery failed")?, &io)?,
                "heuristic" => print_dfg(&heuristic::discover_heuristic(&log, activity_key).context("Heuristic discovery failed")?, &io)?,
                "alpha" => {
                    let model = alpha::discover_alpha(&log, activity_key).context("Alpha discovery failed")?;
                    println!("{}", serde_json::to_string_pretty(&model).context("Failed to encode Alpha model")?);
                }
                unsupported => bail!("Unsupported discovery algorithm '{unsupported}'; expected dfg, heuristic, or alpha"),
            }
        }
        MiningCommands::Conformance {
            log,
            model,
            activity_key,
        } => {
            io.info(format!("Checking conformance of {:?} against {:?}...", log, model));
            let log = load_log(log)?;
            if log.is_empty() || log.event_count() == 0 {
                bail!("Event log contains no traces or events");
            }
            let dfg = load_dfg(model)?;
            let result = conformance::check_conformance_token_replay(&log, &dfg, activity_key)
                .context("Token replay conformance check failed")?;

            let mut table = Table::new(vec!["Metric", "Value"]);
            table.add_row(vec!["Fitness".to_string(), format!("{:.4}", result.fitness)]);
            table.add_row(vec![
                "Precision".to_string(),
                result.precision.map(|value| format!("{value:.4}")).unwrap_or_else(|| "N/A".to_string()),
            ]);
            table.print();
        }
    }
    Ok(())
}

fn load_log(path: &Path) -> Result<EventLog> {
    match path.extension().and_then(|value| value.to_str()) {
        Some("json") => {
            let content = fs::read_to_string(path).with_context(|| format!("Failed to read log file: {path:?}"))?;
            serde_json::from_str(&content).context("Failed to parse JSON event log")
        }
        Some("xes") => {
            let file = fs::File::open(path).with_context(|| format!("Failed to read XES event log: {path:?}"))?;
            import_xes(BufReader::new(file), XESImportOptions::default()).context("Failed to parse XES event log")
        }
        extension => bail!("Unsupported event-log extension {:?}; expected .json or .xes", extension),
    }
}

fn load_dfg(path: &Path) -> Result<DFG> {
    let content = fs::read_to_string(path).with_context(|| format!("Failed to read DFG model: {path:?}"))?;
    let model: DFG = serde_json::from_str(&content).context("Failed to parse DFG model JSON")?;
    if model.is_empty() || model.edges.is_empty() {
        bail!("DFG model must contain nodes and at least one edge");
    }
    Ok(model)
}

fn print_dfg(dfg: &DFG, _io: &Io) -> Result<()> {
    let mut table = Table::new(vec!["Source", "Target", "Frequency"]);
    for edge in &dfg.edges {
        table.add_row(vec![edge.source.clone(), edge.target.clone(), edge.frequency.to_string()]);
    }
    println!("\n{}", "Discovered Directly-Follows Graph (DFG)".bold().bright_cyan());
    table.print();
    Ok(())
}
