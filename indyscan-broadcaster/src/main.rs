#[macro_use]
extern crate log;

use std::collections::HashMap;
use std::sync::Arc;
use std::time::Instant;
use indy_vdr as vdr;
use indy_vdr::config::PoolConfig;
use indy_vdr::pool::{PoolBuilder, PoolTransactions, ProtocolVersion};
use crate::ledger_read::{AnoncredsLedgerRead, IndyVdrLedgerRead, IndyVdrLedgerReadConfig};
use crate::vdr_ledger::{IndyVdrLedgerPool, IndyVdrSubmitter, RequestSubmitter};
mod vdr_ledger;
mod ledger_read;
// mod mapping_indyvdr;



fn sample_weights() -> HashMap<String, f32> {
    let mut weights: HashMap<String, f32> = HashMap::new();
    weights.insert("DigiCert-Node".to_string(), 0.0);
    weights.insert("NECValidator".to_string(), 0.0);
    weights.insert("regioit01".to_string(), 0.0);
    weights.insert("Condatis01".to_string(), 0.0);
    weights.insert("BLQZnode".to_string(), 0.0);
    weights.insert("australia".to_string(), 0.0);
    weights.insert("ayanworks".to_string(), 0.0);
    weights.insert("Idcrypt".to_string(), 0.0);
    weights.insert("monokee-node0".to_string(), 0.0);
    weights.insert("Entrustient".to_string(), 0.0);
    weights.insert("Absa".to_string(), 1.0);
    weights.insert("anonyome".to_string(), 0.0);
    weights
}

fn sample_weights2() -> HashMap<String, f32> {
    let mut weights: HashMap<String, f32> = HashMap::new();
    weights.insert("Absa".to_string(), 1.0);
    weights
}

fn generate_weights() -> Vec<HashMap<String, f32>> {
    let nodes = vec![
        "DigiCert-Node",
        "NECValidator",
        "regioit01",
        "Condatis01",
        "BLQZnode",
        "australia",
        "ayanworks",
        "Idcrypt",
        "monokee-node0",
        "Entrustient",
        "Absa",
        "anonyome",
    ];

    nodes.into_iter().map(|node| {
        let mut weights = HashMap::new();
        weights.insert(node.to_string(), 1.0);
        weights
    }).collect()
}

fn build_indy_read(node_weights: HashMap<String, f32>) -> IndyVdrLedgerRead<IndyVdrSubmitter> {
    let genesis_file = "../indyscan-daemon/app-configs/genesis/SOVRIN_STAGINGNET.txn";
    let indy_vdr_config = PoolConfig {
        protocol_version: ProtocolVersion::Node1_4,
        freshness_threshold: PoolConfig::default_freshness_threshold(),
        ack_timeout: PoolConfig::default_ack_timeout(),
        reply_timeout: PoolConfig::default_reply_timeout(),
        conn_request_limit: PoolConfig::default_conn_request_limit(),
        conn_active_timeout: PoolConfig::default_conn_active_timeout(),
        request_read_nodes: 1,
        socks_proxy: None,
    };
    let ledger_pool = IndyVdrLedgerPool::new(
        genesis_file.to_string(),
        indy_vdr_config,
        Some(node_weights)
    )
        .expect("Failed to create pool");
    let submitter = IndyVdrSubmitter::new(Arc::new(ledger_pool));
    IndyVdrLedgerRead::new(IndyVdrLedgerReadConfig {
        request_submitter: Arc::new(submitter),
        protocol_version: Default::default() }
    )
}

#[tokio::main]
async fn main() {
    let weights_variants = generate_weights();
    let mut results = Vec::new();

    for weights in weights_variants {
        let indy_read = build_indy_read(weights.clone());
        let mut total_duration = 0;
        let mut failure_count = 0;

        for _ in 0..5 {
            let start = Instant::now();
            if let Err(_) = indy_read.get_schema("7Q8fLBEL7u6nQKS469zmas:2:Test Ledger Endorser:1.1", None).await {
                total_duration += 10000; // Penalty for failure
                failure_count += 1;
            } else {
                total_duration += start.elapsed().as_millis() as i32; // Actual duration
            }
        }

        println!("Average duration for weights {:?}: {} ms ({} failures)", &weights, total_duration / 5, failure_count);
        results.push((weights, total_duration / 5));
    }

    // Optionally, you could sort and print the results in order of performance
    results.sort_by(|a, b| a.1.cmp(&b.1));
    println!("Performance results:");
    for (weights, duration) in results {
        println!("Weights {:?}: {} ms", weights, duration);
    }
}
