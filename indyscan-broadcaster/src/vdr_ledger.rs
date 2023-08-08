use std::{
    collections::{hash_map::RandomState, HashMap},
    fmt::{Debug, Formatter},
    sync::Arc,
};
use std::fmt::Error;

use async_trait::async_trait;
use indy_vdr::{
    common::error::VdrError,
    pool::{PoolTransactions, RequestResult},
};
use indy_vdr::{
    config::PoolConfig,
    pool::{PoolBuilder, PoolRunner, PreparedRequest},
};
use indy_vdr::common::error::VdrResult;
use tokio::sync::oneshot;

pub struct IndyVdrLedgerPool {
    pub(self) runner: Option<PoolRunner>,
}

impl IndyVdrLedgerPool {
    pub fn new_from_runner(runner: PoolRunner) -> Self {
        IndyVdrLedgerPool { runner: Some(runner) }
    }

    pub fn new(genesis_file_path: String, indy_vdr_config: PoolConfig, node_weights: Option<HashMap<String, f32>>) -> VdrResult<Self> {
        info!("IndyVdrLedgerPool::new >> genesis_file_path: {genesis_file_path}, indy_vdr_config: {indy_vdr_config:?}");
        let txns = PoolTransactions::from_json_file(genesis_file_path)?;
        let runner = PoolBuilder::new(indy_vdr_config, None, node_weights).transactions(txns)?.into_runner()?;

        Ok(IndyVdrLedgerPool { runner: Some(runner) })
    }
}

impl Debug for IndyVdrLedgerPool {
    fn fmt(&self, f: &mut Formatter<'_>) -> std::fmt::Result {
        f.debug_struct("IndyVdrLedgerPool")
            .field("runner", &"PoolRunner")
            .finish()
    }
}

pub struct IndyVdrSubmitter {
    pool: Arc<IndyVdrLedgerPool>,
}

impl IndyVdrSubmitter {
    pub fn new(pool: Arc<IndyVdrLedgerPool>) -> Self {
        Self { pool }
    }
}

#[async_trait]
pub trait RequestSubmitter: Send + Sync {
    async fn submit(&self, request: PreparedRequest) -> VdrResult<String>;
}

#[async_trait]
impl RequestSubmitter for IndyVdrSubmitter {
    async fn submit(&self, request: PreparedRequest) -> VdrResult<String> {
        type VdrSendRequestResult =
            Result<(RequestResult<String>, Option<HashMap<String, f32, RandomState>>), VdrError>;
        let (sender, recv) = oneshot::channel::<VdrSendRequestResult>();
        self.pool
            .runner
            .as_ref()
            .expect("IndyVdrLedgerPool::submit >> PoolRunner not set")
            .send_request(
                request,
                Box::new(move |result| {
                    // unable to handle a failure from `send` here
                    sender.send(result).ok();
                }),
            )?;

        let send_req_result: VdrSendRequestResult = recv
            .await
            .expect("Err result from from request submitter");
            // .map_err(|e| Err(format!("Err result from from request submitter {e:?}")))?;
        let (result, _) = send_req_result?;

        let reply = match result {
            RequestResult::Reply(reply) => Ok(reply),
            RequestResult::Failed(failed) => Err(failed),
        };

        Ok(reply?)
    }
}
