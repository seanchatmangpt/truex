import { createDeterministicContext } from '../../membrane/src/context.js';
import { AndonSystem } from '../../membrane/src/manufacturing/jidoka.js';
import { StorehouseManager } from '../../storehouse/src/storehouse.js';
import { VowMembrane } from '../../vow/src/index.js';

export interface ZoeLaExampleReceipt {
  readonly fieldId: 'zoe-la-welcome';
  readonly receiverId: 'zoe-la-community';
  readonly provisionAmount: number;
  readonly receiptId: string;
  readonly vowState: 'Rest';
}

export function runZoeLaStewardshipExample(seed = 0x5a_4f_45): ZoeLaExampleReceipt {
  const context = createDeterministicContext(seed);
  const andon = new AndonSystem();
  const storehouse = new StorehouseManager(andon, context);
  const fieldId = 'zoe-la-welcome' as const;
  const receiverId = 'zoe-la-community' as const;
  storehouse.registerField(fieldId);

  const receipt = storehouse.stewardIncrease(
    { amount: 1000, currency: 'USD', timestamp: context.clock() },
    { id: fieldId, name: 'ZOE LA Welcome', owner: 'ZOE Church' },
    { id: receiverId, name: 'ZOE LA Community' },
  );

  const digest = receipt.id.replace(/^receipt-/, '');
  const vow = new VowMembrane('ZOE-LA');
  vow.advance(digest);
  vow.advance(fieldId);
  vow.advance('welcome-provision');
  vow.advance(receiverId);
  vow.advance(receipt.provision.amount);
  vow.advance(digest);
  vow.advance(1);

  if (vow.getState() !== 'Rest') throw new Error('ZOE_LA_REPLAY_REFUSED: Vow did not reach Rest');
  return Object.freeze({
    fieldId,
    receiverId,
    provisionAmount: receipt.provision.amount,
    receiptId: receipt.id,
    vowState: 'Rest',
  });
}
