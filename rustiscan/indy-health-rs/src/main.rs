#[macro_use]
extern crate log;

use std::collections::HashMap;
use std::time::Instant;
use indy_read_rs::build_indy_read;


#[tokio::main]
async fn main() {
    let nodes_sovrin_testnet = vec![
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

    env_logger::init();
    test().await;
    benchmark(nodes_sovrin_testnet).await;
}

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

fn generate_weights(nodes: Vec<&str>) -> Vec<HashMap<String, f32>> {
    nodes.clone().into_iter().map(|node| {
        let mut weights = HashMap::new();
        for other_node in nodes {
            weights.insert(other_node.to_string(), if other_node == node { 1.0 } else { 0.0 });
        }
        weights
    }).collect()
}

async fn benchmark(nodes: Vec<&str>) {
    let weights_variants = generate_weights(nodes);
    let mut results = Vec::new();

    for weights in weights_variants {
        let indy_read = build_indy_read(weights.clone());
        let mut total_duration = 0;
        let mut failure_count = 0;

        let label: String = weights.iter()
            .filter(|&(_, &value)| value > 0.0)
            .map(|(node, _)| node.clone())
            .collect::<Vec<String>>()
            .join(", ");


        for _ in 0..5 {
            let start = Instant::now();
            if let Err(_) = indy_read.get_schema("7Q8fLBEL7u6nQKS469zmas:2:Test Ledger Endorser:1.1", None).await {
                total_duration += 99999; // Penalty for failure
                failure_count += 1;
            } else {
                total_duration += start.elapsed().as_millis() as i32; // Actual duration
            }
        }

        println!("Average duration for {}: {} ms ({} failures)", label, total_duration / 5, failure_count);
        results.push((label, total_duration / 5));
    }

    results.sort_by(|a, b| a.1.cmp(&b.1));
    println!("Performance results:");
    for (weights, duration) in results {
        println!("Weights {:?}: {} ms", weights, duration);
    }
}

async fn test() {
    let indy_read = build_indy_read(sample_weights2());
    let res = indy_read.get_schema("7Q8fLBEL7u6nQKS469zmas:2:Test Ledger Endorser:1.1", None).await;
    info!("res: {:?}", res);
}

