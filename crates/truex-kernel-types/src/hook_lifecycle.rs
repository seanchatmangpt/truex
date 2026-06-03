use serde::{Deserialize, Serialize};

/// The outcome of a hook evaluation — governs the consequence lifecycle
/// as defined by the Sheep Gate proof gate.
///
/// A hook fires when a process event matches a trigger condition.
/// Its outcome determines whether the downstream consequence is:
/// - admitted (lawful, receipt issued),
/// - refused (non-conforming, receipt issued as evidence of refusal), or
/// - partial (incomplete evidence, receipt deferred until sufficient evidence is available).
///
/// No direct action may bypass hook judgment. All outcomes must produce a
/// BLAKE3-verified receipt for audit replay.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash, Serialize, Deserialize)]
pub enum HookOutcome {
    /// The hook passed all gate criteria. A BLAKE3-verified receipt has been issued.
    /// Downstream consequences are authorized to execute.
    Admit,
    /// The hook failed one or more gate criteria. A BLAKE3-verified refusal receipt
    /// has been issued. Downstream consequences are blocked.
    Refuse,
    /// The hook has insufficient evidence to reach a definitive verdict.
    /// A partial receipt is staged. Evaluation must resume when additional
    /// evidence arrives.
    Partial,
}

impl HookOutcome {
    /// Returns the canonical string identifier for this outcome.
    pub fn as_str(&self) -> &'static str {
        match self {
            Self::Admit => "ADMIT",
            Self::Refuse => "REFUSE",
            Self::Partial => "PARTIAL",
        }
    }

    /// Returns true if the outcome authorizes downstream consequences.
    pub fn is_admitted(&self) -> bool {
        matches!(self, Self::Admit)
    }

    /// Returns true if the outcome blocks downstream consequences.
    pub fn is_refused(&self) -> bool {
        matches!(self, Self::Refuse)
    }

    /// Returns true if the outcome is pending additional evidence.
    pub fn is_partial(&self) -> bool {
        matches!(self, Self::Partial)
    }

    /// Attempt a state transition: from Refuse or Partial to Admit.
    /// Returns Ok(Admit) if the transition is lawful (evidence now sufficient),
    /// or Err with the current state if the transition is not allowed.
    pub fn try_admit(self) -> Result<Self, String> {
        match self {
            Self::Refuse | Self::Partial => Ok(Self::Admit),
            Self::Admit => Err("Already in Admit state — no transition needed".to_string()),
        }
    }
}

impl std::fmt::Display for HookOutcome {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        write!(f, "{}", self.as_str())
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_hook_outcome_variants_exist() {
        let admit = HookOutcome::Admit;
        let refuse = HookOutcome::Refuse;
        let partial = HookOutcome::Partial;

        assert!(admit.is_admitted());
        assert!(!admit.is_refused());
        assert!(!admit.is_partial());

        assert!(refuse.is_refused());
        assert!(!refuse.is_admitted());
        assert!(!refuse.is_partial());

        assert!(partial.is_partial());
        assert!(!partial.is_admitted());
        assert!(!partial.is_refused());
    }

    #[test]
    fn test_hook_outcome_as_str() {
        assert_eq!(HookOutcome::Admit.as_str(), "ADMIT");
        assert_eq!(HookOutcome::Refuse.as_str(), "REFUSE");
        assert_eq!(HookOutcome::Partial.as_str(), "PARTIAL");
    }

    #[test]
    fn test_refuse_to_admit_transition() {
        let refused = HookOutcome::Refuse;
        let admitted = refused.try_admit();
        assert!(admitted.is_ok());
        assert_eq!(admitted.unwrap(), HookOutcome::Admit);
    }

    #[test]
    fn test_partial_to_admit_transition() {
        let partial = HookOutcome::Partial;
        let admitted = partial.try_admit();
        assert!(admitted.is_ok());
        assert_eq!(admitted.unwrap(), HookOutcome::Admit);
    }

    #[test]
    fn test_admit_to_admit_transition_is_error() {
        let admitted = HookOutcome::Admit;
        let result = admitted.try_admit();
        assert!(result.is_err());
    }

    #[test]
    fn test_serde_roundtrip() {
        let outcomes = [HookOutcome::Admit, HookOutcome::Refuse, HookOutcome::Partial];
        for outcome in &outcomes {
            let json = serde_json::to_string(outcome).expect("serialize failed");
            let deserialized: HookOutcome =
                serde_json::from_str(&json).expect("deserialize failed");
            assert_eq!(outcome, &deserialized);
        }
    }

    #[test]
    fn test_display() {
        assert_eq!(format!("{}", HookOutcome::Admit), "ADMIT");
        assert_eq!(format!("{}", HookOutcome::Refuse), "REFUSE");
        assert_eq!(format!("{}", HookOutcome::Partial), "PARTIAL");
    }
}
