#[macro_use]
extern crate log;

use std::path::PathBuf;
use indy_health_rs::{benchmark, fetch_a_schema};


pub fn ledger_sovrin_testnet() -> (PathBuf, Vec<String>) {
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

    let mut genesis_file = PathBuf::new();
    genesis_file.push("../indy-genesis-rs/genesis/sovrin_testnet.ndjson");
    (genesis_file, nodes.iter().map(|&s| s.to_string()).collect())
}

pub fn ledger_sovrin_mainnet() -> (PathBuf, Vec<String>) {
    let nodes = vec![
        "findentity",
        "esatus_AG",
        "iRespond",
        "DustStorm",
        "icenode",
        "royal_sovrin",
        "atbsovrin",
        "zaValidator",
        "pcValidator01",
        "sovrin.sicpa.com",
        "danube",
        "OASFCU",
        "VeridiumIDC",
        "ev1",
        "Stuard"
    ];
    let mut genesis_file = PathBuf::new();
    genesis_file.push("../indy-genesis-rs/genesis/sovrin_mainnet.ndjson");
    (genesis_file, nodes.iter().map(|&s| s.to_string()).collect())
}

#[tokio::main]
async fn main() {
    env_logger::init();
    // let (genesis_path, nodes) = ledger_sovrin_testnet();
    let (genesis_path, nodes) = ledger_sovrin_mainnet();

    benchmark(genesis_path, nodes).await;
    // fetch_a_schema(genesis_path).await;
}

mod test {
    use std::collections::HashMap;

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
        weights.insert("NECValidator".to_string(), 0.0);
        weights.insert("Entrustient".to_string(), 0.0);
        weights
    }

// async fn test() {
//     let indy_read = build_indy_read(genesis_sovrin_testnet(), sample_weights2());
//     let res = indy_read.get_schema("7Q8fLBEL7u6nQKS469zmas:2:Test Ledger Endorser:1.1", None).await;
//     info!("res: {:?}", res);
// }

}


