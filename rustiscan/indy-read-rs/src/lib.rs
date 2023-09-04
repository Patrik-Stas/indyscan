use std::collections::HashMap;
use std::sync::Arc;

use indy_vdr::config::PoolConfig;
use indy_vdr::pool::ProtocolVersion;

use crate::ledger_read_anoncreds::{IndyVdrLedgerRead, IndyVdrLedgerReadConfig};
use crate::vdr_ledger::{IndyVdrLedgerPool, IndyVdrSubmitter};

#[macro_use]
extern crate log;

mod ledger_read_anoncreds;
mod vdr_ledger;

pub fn build_indy_read(node_weights: HashMap<String, f32>) -> IndyVdrLedgerRead<IndyVdrSubmitter> {
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
        Some(node_weights),
    )
        .expect("Failed to create pool");
    let submitter = IndyVdrSubmitter::new(Arc::new(ledger_pool));
    IndyVdrLedgerRead::new(IndyVdrLedgerReadConfig {
        request_submitter: Arc::new(submitter),
        protocol_version: Default::default(),
    }
    )
}