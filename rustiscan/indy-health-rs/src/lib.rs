use std::collections::HashMap;
use std::path::PathBuf;
use std::time::Instant;
use indy_read_rs::build_indy_read;
use indy_read_rs::ledger_read_anoncreds::AnoncredsLedgerRead;

pub fn generate_weights(nodes: Vec<String>) -> Vec<HashMap<String, f32>> {
    nodes.clone().iter().map(|node| {
        let mut weights = HashMap::new();
        for other_node in nodes.iter() {
            weights.insert(other_node.to_string(), if other_node == node { 1.0 } else { 0.0 });
        }
        weights
    }).collect()
}

pub async fn benchmark(genesis_file_path: PathBuf, nodes: Vec<String>) {
    let weights_variants = generate_weights(nodes);
    let mut results = Vec::new();

    for weights in weights_variants {
        let indy_read = build_indy_read(genesis_file_path.clone(), weights.clone());
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

pub async fn fetch_a_schema(genesis_file_path: PathBuf) {
    let indy_read = build_indy_read(genesis_file_path.clone(), HashMap::default());
    let res = indy_read.get_schema("7Q8fLBEL7u6nQKS469zmas:2:Test Ledger Endorser:1.1", None).await.unwrap();
    println!("Result: {res}");
}
