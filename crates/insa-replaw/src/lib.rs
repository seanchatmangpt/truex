#![forbid(unsafe_code)]
#![no_std]

extern crate alloc;
use alloc::string::String;
use alloc::vec::Vec;

/// The 8 Vow Record
#[derive(Debug, Clone, Default)]
pub struct VowRecord {
    pub source_id: String,
    pub pattern_hash: [u8; 32],
    pub field_id: String,
    pub motion_route: String,
    pub receiver_id: String,
    pub fruit_quantity: u64,
    pub receipt_digest: [u8; 32],
    pub replay_seq: u64,
}

/// The 8 Vow State Machine
pub mod states {
    use super::*;

    pub struct Source;
    pub struct Pattern;
    pub struct Field;
    pub struct Motion;
    pub struct Receiver;
    pub struct Fruit;
    pub struct Receipt;
    pub struct Rest;
}

pub struct Vow<State> {
    record: VowRecord,
    _state: core::marker::PhantomData<State>,
}

impl Vow<states::Source> {
    pub fn new(source_id: String) -> Self {
        assert!(!source_id.is_empty(), "source_id must be named");
        Self {
            record: VowRecord {
                source_id,
                ..Default::default()
            },
            _state: core::marker::PhantomData,
        }
    }

    pub fn advance(mut self, pattern_hash: [u8; 32]) -> Vow<states::Pattern> {
        assert!(pattern_hash != [0u8; 32], "pattern_hash is all zeros");
        self.record.pattern_hash = pattern_hash;
        Vow {
            record: self.record,
            _state: core::marker::PhantomData,
        }
    }
}

impl Vow<states::Pattern> {
    pub fn advance(mut self, field_id: String) -> Vow<states::Field> {
        assert!(!field_id.is_empty(), "field_id is empty");
        self.record.field_id = field_id;
        Vow {
            record: self.record,
            _state: core::marker::PhantomData,
        }
    }
}

impl Vow<states::Field> {
    pub fn advance(mut self, motion_route: String) -> Vow<states::Motion> {
        assert!(!motion_route.is_empty(), "motion_route is empty");
        self.record.motion_route = motion_route;
        Vow {
            record: self.record,
            _state: core::marker::PhantomData,
        }
    }
}

impl Vow<states::Motion> {
    pub fn advance(mut self, receiver_id: String) -> Vow<states::Receiver> {
        assert!(!receiver_id.is_empty(), "receiver_id is empty");
        self.record.receiver_id = receiver_id;
        Vow {
            record: self.record,
            _state: core::marker::PhantomData,
        }
    }
}

impl Vow<states::Receiver> {
    pub fn advance(mut self, fruit_quantity: u64) -> Vow<states::Fruit> {
        assert!(fruit_quantity > 0, "fruit_quantity is zero");
        self.record.fruit_quantity = fruit_quantity;
        Vow {
            record: self.record,
            _state: core::marker::PhantomData,
        }
    }
}

impl Vow<states::Fruit> {
    pub fn advance(mut self, receipt_digest: [u8; 32]) -> Vow<states::Receipt> {
        assert!(receipt_digest != [0u8; 32], "receipt_digest is all zeros");
        self.record.receipt_digest = receipt_digest;
        Vow {
            record: self.record,
            _state: core::marker::PhantomData,
        }
    }
}

impl Vow<states::Receipt> {
    pub fn advance(mut self, replay_seq: u64) -> Vow<states::Rest> {
        assert!(replay_seq > 0, "replay_seq is zero");
        self.record.replay_seq = replay_seq;
        Vow {
            record: self.record,
            _state: core::marker::PhantomData,
        }
    }
}

impl Vow<states::Rest> {
    pub fn close(self) -> VowRecord {
        // Aims at God's perfection - terminal state
        self.record
    }
}
