/**
 * Invariant Enforcement System - Usage Examples
 *
 * This example demonstrates how to use the invariant enforcement system
 * to protect state integrity and prevent illegal state transitions.
 */

import { createProxy } from '../src/proxy/create-proxy.js'
import {
  createInvariantContext,
  createInvariantSetInterceptor,
  registerInvariantInterceptors,
  typeInvariant,
  rangeInvariant,
  immutableInvariant,
  dependencyInvariant,
  requiredInvariant,
  patternInvariant,
} from '../src/invariants/invariant-context.js'

// ============================================================================
// Example 1: Basic Invariant Enforcement
// ============================================================================

console.log('=== Example 1: Basic Invariant Enforcement ===\n')

const bankAccount = { balance: 1000 }
const { proxy: accountMembrane, defineSetInterceptor } = createProxy(bankAccount)

// Create invariant context: balance must never be negative
const accountInvCtx = createInvariantContext(bankAccount, {
  positiveBalance: (target, operation) => {
    if (operation.trap === 'set' && operation.property === 'balance') {
      return operation.value >= 0 || 'Balance cannot be negative'
    }
    return true
  }
})

defineSetInterceptor(createInvariantSetInterceptor(accountInvCtx))

accountInvCtx.call(() => {
  console.log('Initial balance:', accountMembrane.balance)

  // Valid withdrawal
  accountMembrane.balance = 500
  console.log('After withdrawal:', accountMembrane.balance)

  try {
    // Invalid withdrawal - would go negative
    accountMembrane.balance = -100
  } catch (refusal) {
    console.log('Refusal prevented:', refusal.message)
  }

  console.log('Final balance:', accountMembrane.balance)
})

console.log()

// ============================================================================
// Example 2: Type Safety with typeInvariant
// ============================================================================

console.log('=== Example 2: Type Safety ===\n')

const user = { name: 'Alice', age: 25, active: true }
const userMembrane = createProxy(user)

const userInvCtx = createInvariantContext(user, {
  nameType: typeInvariant('name', String),
  ageType: typeInvariant('age', Number),
  activeType: typeInvariant('active', Boolean),
})

registerInvariantInterceptors(userMembrane, userInvCtx)

userInvCtx.call(() => {
  console.log('User:', userMembrane.proxy)

  // Valid type
  userMembrane.proxy.age = 26
  console.log('Updated age:', userMembrane.proxy.age)

  try {
    // Invalid type
    userMembrane.proxy.age = 'twenty-seven'
  } catch (refusal) {
    console.log('Type refusal prevented:', refusal.message)
  }
})

console.log()

// ============================================================================
// Example 3: Range Constraints
// ============================================================================

console.log('=== Example 3: Range Constraints ===\n')

const thermostat = { temperature: 20 }
const thermostatMembrane = createProxy(thermostat)

const thermostatInvCtx = createInvariantContext(thermostat, {
  tempRange: rangeInvariant('temperature', -10, 40),
})

registerInvariantInterceptors(thermostatMembrane, thermostatInvCtx)

thermostatInvCtx.call(() => {
  console.log('Initial temperature:', thermostatMembrane.proxy.temperature)

  // Valid temperature
  thermostatMembrane.proxy.temperature = 25
  console.log('Set to 25°C:', thermostatMembrane.proxy.temperature)

  try {
    // Too hot
    thermostatMembrane.proxy.temperature = 50
  } catch (refusal) {
    console.log('Range refusal prevented:', refusal.message)
  }

  try {
    // Too cold
    thermostatMembrane.proxy.temperature = -20
  } catch (refusal) {
    console.log('Range refusal prevented:', refusal.message)
  }
})

console.log()

// ============================================================================
// Example 4: Immutability
// ============================================================================

console.log('=== Example 4: Immutability ===\n')

const entity = { id: 123 }
const entityMembrane = createProxy(entity)

const entityInvCtx = createInvariantContext(entity, {
  immutableId: immutableInvariant(new Set(['id', 'createdAt'])),
})

registerInvariantInterceptors(entityMembrane, entityInvCtx)

entityInvCtx.call(() => {
  // Can set immutable property initially
  entityMembrane.proxy.createdAt = new Date()
  console.log('Entity created:', {
    id: entityMembrane.proxy.id,
    createdAt: entityMembrane.proxy.createdAt,
  })

  try {
    // Cannot modify immutable property
    entityMembrane.proxy.id = 456
  } catch (refusal) {
    console.log('Immutability protected:', refusal.message)
  }

  try {
    // Cannot delete immutable property
    delete entityMembrane.proxy.id
  } catch (refusal) {
    console.log('Deletion prevented:', refusal.message)
  }
})

console.log()

// ============================================================================
// Example 5: Dependency Invariants (Business Rules)
// ============================================================================

console.log('=== Example 5: Dependency Invariants ===\n')

const slider = { min: 0, max: 100, value: 50 }
const sliderMembrane = createProxy(slider)

const sliderInvCtx = createInvariantContext(slider, {
  valueInRange: dependencyInvariant('valueInRange', (obj) => {
    return obj.value >= obj.min && obj.value <= obj.max
  }),
})

registerInvariantInterceptors(sliderMembrane, sliderInvCtx)

sliderInvCtx.call(() => {
  console.log('Slider state:', sliderMembrane.proxy)

  // Valid value change
  sliderMembrane.proxy.value = 75
  console.log('Value updated to:', sliderMembrane.proxy.value)

  // Valid max change (value still in range)
  sliderMembrane.proxy.max = 80
  console.log('Max updated to:', sliderMembrane.proxy.max)

  try {
    // Invalid: would make value > max
    sliderMembrane.proxy.max = 70
  } catch (refusal) {
    console.log('Dependency violation prevented:', refusal.message)
  }

  console.log('Final state:', sliderMembrane.proxy)
})

console.log()

// ============================================================================
// Example 6: Pattern Matching (Email Validation)
// ============================================================================

console.log('=== Example 6: Pattern Matching ===\n')

const contact = { email: 'alice@example.com', phone: '555-123-4567' }
const contactMembrane = createProxy(contact)

const contactInvCtx = createInvariantContext(contact, {
  emailPattern: patternInvariant(
    'email',
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    'Invalid email format'
  ),
  phonePattern: patternInvariant('phone', /^\d{3}-\d{3}-\d{4}$/),
})

registerInvariantInterceptors(contactMembrane, contactInvCtx)

contactInvCtx.call(() => {
  console.log('Contact:', contactMembrane.proxy)

  // Valid email
  contactMembrane.proxy.email = 'bob@example.com'
  console.log('Email updated:', contactMembrane.proxy.email)

  try {
    // Invalid email format
    contactMembrane.proxy.email = 'not-an-email'
  } catch (refusal) {
    console.log('Pattern refusal prevented:', refusal.message)
  }

  try {
    // Invalid phone format
    contactMembrane.proxy.phone = '123456789'
  } catch (refusal) {
    console.log('Pattern refusal prevented:', refusal.message)
  }
})

console.log()

// ============================================================================
// Example 7: Required Fields
// ============================================================================

console.log('=== Example 7: Required Fields ===\n')

const document = { id: 1, title: 'Document', author: 'Alice', draft: true }
const docMembrane = createProxy(document)

const docInvCtx = createInvariantContext(document, {
  requiredFields: requiredInvariant(new Set(['id', 'title', 'author'])),
})

registerInvariantInterceptors(docMembrane, docInvCtx)

docInvCtx.call(() => {
  console.log('Document:', docMembrane.proxy)

  // Can delete optional field
  delete docMembrane.proxy.draft
  console.log('Draft deleted, optional field:', docMembrane.proxy.draft)

  try {
    // Cannot delete required field
    delete docMembrane.proxy.title
  } catch (refusal) {
    console.log('Required field protected:', refusal.message)
  }
})

console.log()

// ============================================================================
// Example 8: Multiple Invariants (All Must Admit)
// ============================================================================

console.log('=== Example 8: Multiple Invariants ===\n')

const person = { age: 30 }
const personMembrane = createProxy(person)

const personInvCtx = createInvariantContext(person, {
  agePositive: (target, op) => {
    if (op.trap === 'set' && op.property === 'age') {
      return op.value >= 0 || 'Age must be positive'
    }
    return true
  },
  ageMaximum: (target, op) => {
    if (op.trap === 'set' && op.property === 'age') {
      return op.value <= 150 || 'Age must be <= 150'
    }
    return true
  },
  ageInteger: (target, op) => {
    if (op.trap === 'set' && op.property === 'age') {
      return Number.isInteger(op.value) || 'Age must be an integer'
    }
    return true
  }
})

registerInvariantInterceptors(personMembrane, personInvCtx)

personInvCtx.call(() => {
  console.log('Initial age:', personMembrane.proxy.age)

  // All invariants admit
  personMembrane.proxy.age = 35
  console.log('Valid age update:', personMembrane.proxy.age)

  try {
    // Refuses first invariant (positive)
    personMembrane.proxy.age = -5
  } catch (refusal) {
    console.log('First invariant refused:', refusal.message)
  }

  try {
    // Refuses second invariant (maximum)
    personMembrane.proxy.age = 200
  } catch (refusal) {
    console.log('Second invariant refused:', refusal.message)
  }

  try {
    // Refuses third invariant (integer)
    personMembrane.proxy.age = 35.5
  } catch (refusal) {
    console.log('Third invariant refused:', refusal.message)
  }
})

console.log()

// ============================================================================
// Example 9: Dynamic Invariant Management
// ============================================================================

console.log('=== Example 9: Dynamic Invariant Management ===\n')

const config = { debugMode: false, maxRetries: 3 }
const configMembrane = createProxy(config)

const configInvCtx = createInvariantContext(config)
registerInvariantInterceptors(configMembrane, configInvCtx)

configInvCtx.call(() => {
  console.log('Initial config:', configMembrane.proxy)

  // No invariants yet - anything goes
  configMembrane.proxy.maxRetries = -100
  console.log('No invariants, allows negative:', configMembrane.proxy.maxRetries)

  // Add invariant dynamically
  configInvCtx.addInvariant('positiveRetries', (target, op) => {
    if (op.trap === 'set' && op.property === 'maxRetries') {
      return op.value >= 0 || 'maxRetries must be positive'
    }
    return true
  })

  console.log('Added invariant')

  try {
    // Now enforced
    configMembrane.proxy.maxRetries = -50
  } catch (refusal) {
    console.log('Now protected:', refusal.message)
  }

  // Valid value
  configMembrane.proxy.maxRetries = 5
  console.log('Valid value works:', configMembrane.proxy.maxRetries)

  // Remove invariant
  configInvCtx.removeInvariant('positiveRetries')
  console.log('Removed invariant')

  // No longer enforced
  configMembrane.proxy.maxRetries = -200
  console.log('No longer enforced:', configMembrane.proxy.maxRetries)
})

console.log()

// ============================================================================
// Example 10: Composition (ACL + Invariants + Transactions)
// ============================================================================

console.log('=== Example 10: Composition with ACL and Transactions ===\n')

import { createCapabilityContext, registerCapabilityInterceptors } from '../src/security/capability-acl.js'
import { createTransactionContext, registerTransactionInterceptors } from '../src/transactions/transaction-context.js'

const secureAccount = { balance: 1000, owner: 'Alice' }
const secureMembrane = createProxy(secureAccount)

// Layer 1: ACL - What can be accessed
const acl = createCapabilityContext(secureAccount, {
  canRead: new Set(['balance', 'owner']), // Can read both
  canWrite: new Set(['balance']), // Can only write to balance, not owner
})

// Layer 2: Invariants - What values are valid
const invariants = createInvariantContext(secureAccount, {
  positiveBalance: rangeInvariant('balance', 0, Infinity),
})

// Layer 3: Transactions - Journaling and rollback
const transaction = createTransactionContext(secureAccount)

// Register in composition order: ACL > Invariants > Transactions
registerCapabilityInterceptors(secureMembrane, acl)
registerInvariantInterceptors(secureMembrane, invariants)
registerTransactionInterceptors(secureMembrane, transaction)

acl.call(() => {
  invariants.call(() => {
    transaction.call(() => {
      console.log('Initial balance:', secureMembrane.proxy.balance)

      // Valid operation: admits ACL and invariant, gets journaled
      secureMembrane.proxy.balance = 500
      console.log('After withdrawal:', secureMembrane.proxy.balance)

      try {
        // Refuses ACL check (cannot write to owner)
        secureMembrane.proxy.owner = 'Bob'
      } catch {
        console.log('ACL denied:', 'Cannot write to owner (ACL check)')
      }

      try {
        // Refuses invariant check (negative balance)
        secureMembrane.proxy.balance = -100
      } catch (refusal) {
        console.log('Invariant denied:', refusal.message)
      }

      // Check transaction journal - only valid operation journaled
      const journal = transaction.getJournal()
      console.log('Transaction journal entries:', journal.length)
      if (journal.length > 0) {
        console.log('Journaled operation:', journal[0].operation, journal[0].property)
      }

      // Rollback transaction
      try {
        transaction.rollback()
        console.log('After rollback:', secureMembrane.proxy.balance)
      } catch (err) {
        console.log('Rollback status:', err.message)
      }
    })
  })
})

console.log()

// ============================================================================
// Example 11: validateState - Dry Run Validation
// ============================================================================

console.log('=== Example 11: Dry Run Validation ===\n')

const product = { price: 100, stock: 50 }

const productInvCtx = createInvariantContext(product, {
  positivePrice: (t, op) => {
    if (op.trap === 'set' && op.property === 'price') {
      return op.value > 0 || 'Price must be positive'
    }
    return true
  },
  validStock: (t, op) => {
    if (op.trap === 'set' && op.property === 'stock') {
      return op.value >= 0 || 'Stock cannot be negative'
    }
    return true
  }
})

// Test operations without applying them
console.log('Current product:', product)

// Valid operation
const result1 = productInvCtx.validateState({
  trap: 'set',
  property: 'price',
  value: 150
})
console.log('Validate price=150:', result1.valid ? 'Valid' : 'Invalid')

// Invalid operation
const result2 = productInvCtx.validateState({
  trap: 'set',
  property: 'price',
  value: -50
})
console.log('Validate price=-50:', result2.valid ? 'Valid' : 'Invalid', result2.errors)

// Product unchanged
console.log('Product unchanged:', product)

console.log()
console.log('=== All Examples Conserve ===')
