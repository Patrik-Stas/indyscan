use std::fmt::Debug;
use std::sync::Arc;
use async_trait::async_trait;
use indy_vdr::common::error::VdrResult;
use indy_vdr::ledger::identifiers::{CredentialDefinitionId, RevocationRegistryId, SchemaId};
use indy_vdr::ledger::RequestBuilder;
use indy_vdr::pool::ProtocolVersion;
use indy_vdr::utils::did::DidValue;
use indy_vdr::utils::Qualifiable;
use time::OffsetDateTime;
use crate::vdr_ledger::RequestSubmitter;

#[async_trait]
pub trait AnoncredsLedgerRead: Send + Sync {
    async fn get_schema(&self, schema_id: &str, submitter_did: Option<&str>) -> VdrResult<String>;
    async fn get_cred_def(&self, cred_def_id: &str, submitter_did: Option<&str>) -> VdrResult<String>;
    async fn get_rev_reg_def_json(&self, rev_reg_id: &str) -> VdrResult<String>;
    async fn get_rev_reg_delta_json(
        &self,
        rev_reg_id: &str,
        from: Option<u64>,
        to: Option<u64>,
    ) -> VdrResult<String>;
    async fn get_rev_reg(&self, rev_reg_id: &str, timestamp: u64) -> VdrResult<String>;
}

pub struct IndyVdrLedgerRead<T>
    where
        T: RequestSubmitter + Send + Sync,
{
    request_submitter: Arc<T>,
    protocol_version: ProtocolVersion,
}

pub struct IndyVdrLedgerReadConfig<T>
    where
        T: RequestSubmitter + Send + Sync,
{
    pub request_submitter: Arc<T>,
    pub protocol_version: ProtocolVersion,
}


impl<T> IndyVdrLedgerRead<T>
    where
        T: RequestSubmitter + Send + Sync
{
    pub fn new(config: IndyVdrLedgerReadConfig<T>) -> Self {
        Self {
            request_submitter: config.request_submitter,
            protocol_version: config.protocol_version,
        }
    }

    pub fn request_builder(&self) -> RequestBuilder {
        RequestBuilder::new(self.protocol_version)
    }
}


#[async_trait]
impl<T> AnoncredsLedgerRead for IndyVdrLedgerRead<T>
    where
        T: RequestSubmitter + Send + Sync
{
    async fn get_schema(&self, schema_id: &str, _submitter_did: Option<&str>) -> VdrResult<String> {
        debug!("get_schema >> schema_id: {schema_id}");
        let request = self
            .request_builder()
            .build_get_schema_request(None, &SchemaId::from_str(schema_id)?)?;
        let response = self.request_submitter.submit(request).await?;
        debug!("get_schema << response: {response}");
        Ok(response)
    }

    async fn get_cred_def(&self, cred_def_id: &str, submitter_did: Option<&str>) -> VdrResult<String> {
        debug!("get_cred_def >> cred_def_id: {cred_def_id}");
        let identifier = submitter_did.map(DidValue::from_str).transpose()?;
        let id = CredentialDefinitionId::from_str(cred_def_id)?;
        let request = self
            .request_builder()
            .build_get_cred_def_request(identifier.as_ref(), &id)?;
        let response = self.request_submitter.submit(request).await?;
        debug!("get_cred_def << response: {response}");
        Ok(response)
    }

    async fn get_rev_reg_def_json(&self, rev_reg_id: &str) -> VdrResult<String> {
        debug!("get_rev_reg_def_json >> rev_reg_id: {rev_reg_id}");
        let id = RevocationRegistryId::from_str(rev_reg_id)?;
        let request = self.request_builder().build_get_revoc_reg_def_request(None, &id)?;
        let response = self.request_submitter.submit(request).await?;
        debug!("get_rev_reg_def_json << response: {response}");
        Ok(response)
    }

    async fn get_rev_reg_delta_json(
        &self,
        rev_reg_id: &str,
        from: Option<u64>,
        to: Option<u64>,
    ) -> VdrResult<String> {
        debug!("get_rev_reg_delta_json >> rev_reg_id: {rev_reg_id}, from: {from:?}, to: {to:?}");
        let revoc_reg_def_id = RevocationRegistryId::from_str(rev_reg_id)?;

        let from = from.map(|x| x as i64);
        let current_time = OffsetDateTime::now_utc().unix_timestamp() as i64;
        let to = to.map_or(current_time, |x| x as i64);

        let request = self
            .request_builder()
            .build_get_revoc_reg_delta_request(None, &revoc_reg_def_id, from, to)?;
        let response = self.request_submitter.submit(request).await?;
        debug!("get_rev_reg_delta_json << response: {response}");
        Ok(response)
    }

    async fn get_rev_reg(&self, rev_reg_id: &str, timestamp: u64) -> VdrResult<String> {
        debug!("get_rev_reg >> rev_reg_id: {rev_reg_id}, timestamp: {timestamp}");
        let revoc_reg_def_id = RevocationRegistryId::from_str(rev_reg_id)?;

        let request = self.request_builder().build_get_revoc_reg_request(
            None,
            &revoc_reg_def_id,
            timestamp.try_into().unwrap(),
        )?;
        let response = self.request_submitter.submit(request).await?;
        debug!("get_rev_reg << response: {response}");
        Ok(response)
    }
}
