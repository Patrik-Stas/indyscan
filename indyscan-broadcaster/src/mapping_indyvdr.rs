// use indy_vdr::common::error::{VdrError, VdrErrorKind};
// use indy_vdr::utils::ValidationError;
//
// #[derive(Copy, Clone, Eq, PartialEq, Debug, thiserror::Error)]
// pub enum AriesVcxCoreErrorKind {
//     // Common
//     #[error("foo")]
//     IndyVdrError,
// }
//
// #[derive(Debug, thiserror::Error)]
// pub struct AriesVcxCoreError {
//     msg: String,
//     kind: AriesVcxCoreErrorKind,
// }
//
// impl From<VdrError> for AriesVcxCoreError {
//     fn from(err: VdrError) -> Self {
//         match err.kind() {
//             VdrErrorKind::Config => AriesVcxCoreError::from_msg(AriesVcxCoreErrorKind::IndyVdrError, err),
//             VdrErrorKind::Connection => AriesVcxCoreError::from_msg(AriesVcxCoreErrorKind::IndyVdrError, err),
//             // todo: we are losing information about the err
//             VdrErrorKind::FileSystem(_) => AriesVcxCoreError::from_msg(AriesVcxCoreErrorKind::IndyVdrError, err),
//             VdrErrorKind::Input => AriesVcxCoreError::from_msg(AriesVcxCoreErrorKind::IndyVdrError, err),
//             VdrErrorKind::Resource => AriesVcxCoreError::from_msg(AriesVcxCoreErrorKind::IndyVdrError, err),
//             VdrErrorKind::Unavailable => AriesVcxCoreError::from_msg(AriesVcxCoreErrorKind::IndyVdrError, err),
//             VdrErrorKind::Unexpected => AriesVcxCoreError::from_msg(AriesVcxCoreErrorKind::IndyVdrError, err),
//             VdrErrorKind::Incompatible => AriesVcxCoreError::from_msg(AriesVcxCoreErrorKind::IndyVdrError, err),
//             VdrErrorKind::PoolNoConsensus => AriesVcxCoreError::from_msg(AriesVcxCoreErrorKind::IndyVdrError, err),
//             // todo: we are losing information about the err
//             VdrErrorKind::PoolRequestFailed(_) => {
//                 AriesVcxCoreError::from_msg(AriesVcxCoreErrorKind::IndyVdrError, err)
//             }
//             VdrErrorKind::PoolTimeout => AriesVcxCoreError::from_msg(AriesVcxCoreErrorKind::IndyVdrError, err),
//         }
//     }
// }
//
// impl From<ValidationError> for AriesVcxCoreError {
//     fn from(err: ValidationError) -> Self {
//         AriesVcxCoreError::from_msg(AriesVcxCoreErrorKind::InvalidInput, err)
//     }
// }
