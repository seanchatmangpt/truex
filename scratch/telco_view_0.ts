Created At: 2026-05-24T16:25:03Z
Completed At: 2026-05-24T16:25:03Z
File Path: `file:///Users/sac/truex/packages/membrane/src/telco.gall.ts`
Total Lines: 446
Total Bytes: 14499
Showing lines 1 to 446
The following code has been modified to include a line number before every line, in the format: <line_number>: <original_line>. Please note that any changes targeting the original code should remove the line number, colon, and leading space.
1: /**
2:  * @module Telco
3:  * @description
4:  * Gall Classification: Gall S13 (Telco Interop Membrane)
5:  * Purpose: Telco is the interop authority. It answers who is speaking, what boundary they cross, 
6:  * what protocol is admissible, and ensures no unreceipted communication becomes authority.
7:  */
8: 
9: import { hash } from "./hash.js";
10: 
11: export interface TelcoChannel {
12:   id: string;
13:   direction: 'inbound' | 'outbound';
14:   protocolFamily: string;
15:   mailboxBinding: string;
16:   refusalPolicy: Record<string, any>;
17:   boundaryStatus: 'admitted' | 'refused';
18: }
19: 
20: export interface TelcoPeer {
21:   id: string;
22:   identityProof: string;
23:   status: 'known' | 'unknown';
24: }
25: 
26: export interface CapabilityBinding {
27:   capabilityId: string;
28:   epoch: number;
29:   allowedActionFamilies: string[];
30: }
31: 
32: export interface TelcoSession {
33:   id: string;
34:   peerId: string;
35:   status: 'pending' | 'handshaking' | 'active' | 'closed' | 'suspended';
36:   capability: CapabilityBinding;
37:   freshnessWindowStart: number;
38:   freshnessWindowEnd: number;
39: }
40: 
41: export interface TelcoPacket {
42:   id: string;
43:   sessionId: string;
44:   canonicalHash: string;
45:   encodedPayload: string;
46: }
47: 
48: export interface RouteDecision {
49:   packetId: string;
50:   channelId: string;
51:   retryPolicy: string;
52:   status: 'admitted' | 'refused';
53: }
54: 
55: export interface TransmissionRecord {
56:   id: string;
57:   routeId: string;
58:   status: 'enqueued' | 'executing' | 'transmitted' | 'failed' | 'timeout';
59:   remoteResponseHash?: string;
60: }
61: 
62: export interface TelcoReceipt {
63:   receiptId: string;
64:   verb: string;
65:   sessionId?: string;
66:   channelId?: string;
67:   packetHash?: string;
68:   parentReceiptHash?: string;
69:   decision: string;
70:   createdAt: string;
71: }
72: 
73: export interface TelcoAccounting {
74:   T1: { attempted: number; established: number; refused: number }; // Sessions
75:   T2: { attempted: number; encoded: number; refused: number };     // Packets
76:   T3: { attempted: number; admitted: number; refused: number };    // Routes
77:   T4: { attempted: number; sent: number; timeout: number; failed: number }; // Transmissions
78:   T5: { attempted: number; verified: number; mismatched: number }; // Verifications
79:   T6: { attempted: number; settled_promotable: number; settled_blocked: number }; // Settlement
80: }
81: 
82: export class TelcoMembrane {
83:   public channels: Map<string, TelcoChannel> = new Map();
84:   public peers: Map<string, TelcoPeer> = new Map();
85:   public sessions: Map<string, TelcoSession> = new Map();
86:   public packets: Map<string, TelcoPacket> = new Map();
87:   public routeDecisions: Map<string, RouteDecision> = new Map();
88:   public transmissions: Map<string, TransmissionRecord> = new Map();
89:   public verifications: Map<string, { recordId: string; isValid: boolean }> = new Map();
90:   public receipts: TelcoReceipt[] = [];
91: 
92:   // Strict Accounting Ledger (T1-T6)
93:   public ledger: TelcoAccounting = {
94:     T1: { attempted: 0, established: 0, refused: 0 },
95:     T2: { attempted: 0, encoded: 0, refused: 0 },
96:     T3: { attempted: 0, admitted: 0, refused: 0 },
97:     T4: { attempted: 0, sent: 0, timeout: 0, failed: 0 },
98:     T5: { attempted: 0, verified: 0, mismatched: 0 },
99:     T6: { attempted: 0, settled_promotable: 0, settled_blocked: 0 },
100:   };
101: 
102:   private parentReceiptHash?: string;
103:   private supportedProtocols: string[] = ['proto/zoe.ocel2.v1', 'proto/grpc.v1'];
104: 
105:   constructor(supportedProtocols?: string[]) {
106:     if (supportedProtocols) {
107:       this.supportedProtocols = supportedProtocols;
108:     }
109:   }
110: 
111:   /**
112:    * Verb 1: listen - Declare and inspect an inbound communication surface and its mailbox.
113:    */
114:   public listen(channel: Omit<TelcoChannel, 'boundaryStatus'>, isAdmitted: boolean): TelcoChannel {
115:     const status = isAdmitted ? 'admitted' : 'refused';
116:     const finalChannel: TelcoChannel = {
117:       ...channel,
118:       boundaryStatus: status
119:     };
120:     this.channels.set(finalChannel.id, finalChannel);
121:     this.emitReceipt('listen', undefined, finalChannel.id, undefined, status);
122:     return finalChannel;
123:   }
124: 
125:   /**
126:    * Verb 2: dial - Attempt outbound communication with a discoverable peer.
127:    */
128:   public dial(peerId: string, peerProof: string, isKnown: boolean): TelcoPeer {
129:     this.ledger.T1.attempted++;
130:     const status = isKnown ? 'known' : 'unknown';
131:     const peer: TelcoPeer = {
132:       id: peerId,
133:       identityProof: peerProof,
134:       status
135:     };
136:     this.peers.set(peerId, peer);
137:     if (!isKnown) {
138:       this.ledger.T1.refused++;
139:       this.emitReceipt('dial', undefined, undefined, undefined, 'refused');
140:     } else {
141:       this.emitReceipt('dial', undefined, undefined, undefined, 'succeeded');
142:     }
143:     return peer;
144:   }
145: 
146:   /**
147:    * Verb 3: handshake - Bind peer, protocol, epoch, capability, and freshness window.
148:    * Drops connections offering unsupported protocol shapes (T-I2).
149:    */
150:   public handshake(
151:     sessionId: string,
152:     peerId: string,
153:     protocolShape: string,
154:     capability: CapabilityBinding,
155:     freshnessStart: number,
156:     freshnessEnd: number
157:   ): TelcoSession {
158:     const peer = this.peers.get(peerId);
159:     
160:     // T-I2: Handshake drops connections offering unsupported protocol shapes.
161:     const isProtoSupported = this.supportedProtocols.includes(protocolShape);
162:     
163:     if (!isProtoSupported || !peer || peer.status === 'unknown' || capability.epoch <= 0) {
164:       if (peer && peer.status === 'known') {
165:         this.ledger.T1.refused++;
166:       }
167:       this.emitReceipt('handshake', sessionId, undefined, undefined, 'refused');
168:       throw new Error(`T-I2 Handshake refused: Unsupported protocol shape, unknown peer, or invalid epoch`);
169:     }
170: 
171:     const session: TelcoSession = {
172:       id: sessionId,
173:       peerId,
174:       status: 'active',
175:       capability,
176:       freshnessWindowStart: freshnessStart,
177:       freshnessWindowEnd: freshnessEnd
178:     };
179: 
180:     this.sessions.set(sessionId, session);
181:     this.ledger.T1.established++;
182:     this.ledger.T6.attempted++;
183:     this.emitReceipt('handshake', sessionId, undefined, undefined, 'active');
184:     return session;
185:   }
186: 
187:   /**
188:    * Verb 4: encode - Project internal objects into canonical boundary packets.
189:    */
190:   public encode(
191:     packetId: string,
192:     sessionId: string,
193:     payload: string
194:   ): TelcoPacket {
195:     this.ledger.T2.attempted++;
196:     const session = this.sessions.get(sessionId);
197: 
198:     if (!session || session.status !== 'active') {
199:       this.ledger.T2.refused++;
200:       this.emitReceipt('encode', sessionId, undefined, undefined, 'refused');
201:       throw new Error(`Encode refused: Session is not active or does not exist`);
202:     }
203: 
204:     // T-I4: Every packet sent/received is hash-linked and deterministic.
205:     const canonicalHash = hash({
206:       packetId,
207:       sessionId,
208:       payload,
209:       epoch: session.capability.epoch,
210:       parentHash: this.parentReceiptHash || ''
211:     });
212: 
213:     const packet: TelcoPacket = {
214:       id: packetId,
215:       sessionId,
216:       canonicalHash,
217:       encodedPayload: payload
218:     };
219: 
220:     this.packets.set(packetId, packet);
221:     this.ledger.T2.encoded++;
222:     this.emitReceipt('encode', sessionId, undefined, canonicalHash, 'succeeded');
223:     return packet;
224:   }
225: 
226:   /**
227:    * Verb 5: route - Select an admissible communication path and retry policy.
228:    */
229:   public route(
230:     packetId: string,
231:     channelId: string,
232:     retryPolicy: string
233:   ): RouteDecision {
234:     this.ledger.T3.attempted++;
235:     const packet = this.packets.get(packetId);
236:     const channel = this.channels.get(channelId);
237: 
238:     if (!packet || !channel || channel.boundaryStatus === 'refused') {
239:       const decision: RouteDecision = {
240:         packetId,
241:         channelId,
242:         retryPolicy,
243:         status: 'refused'
244:       };
245:       this.routeDecisions.set(packetId, decision);
246:       this.ledger.T3.refused++;
247:       this.emitReceipt('route', undefined, channelId, packet?.canonicalHash, 'refused');
248:       return decision;
249:     }
250: 
251:     const decision: RouteDecision = {
252:       packetId,
253:       channelId,
254:       retryPolicy,
255:       status: 'admitted'
256:     };
257:     this.routeDecisions.set(packetId, decision);
258:     this.ledger.T3.admitted++;
259:     this.ledger.T4.attempted++;
260:     this.emitReceipt('route', undefined, channelId, packet.canonicalHash, 'admitted');
261:     return decision;
262:   }
263: 
264:   /**
265:    * Verb 6: transmit - Move the packet across the boundary via durable mailbox discipline.
266:    * Panics (throws) if no valid epoch/capability exists (T-I1).
267:    */
268:   public transmit(
269:     transmissionId: string,
270:     packetId: string,
271:     remoteBehavior: 'success' | 'timeout' | 'fail'
272:   ): TransmissionRecord {
273:     const packet = this.packets.get(packetId);
274:     if (!packet) {
275:       throw new Error(`Transmit error: Packet not found`);
276:     }
277: 
278:     const session = this.sessions.get(packet.sessionId);
279:     // T-I1: Transmit panics if no valid epoch/capability exists.
280:     if (!session || !session.capability || session.capability.epoch <= 0) {
281:       throw new Error(`T-I1 Invariant Breach: Transmit panics if no valid epoch/capability exists.`);
282:     }
283: 
284:     const decision = this.routeDecisions.get(packetId);
285:     if (!decision || decision.status !== 'admitted') {
286:       throw new Error(`Transmit error: No admitted route decision for packet`);
287:     }
288: 
289:     // T-I3: Remote outputs are never treated as local truth until verify and settle.
290:     let status: TransmissionRecord['status'] = 'enqueued';
291:     let remoteResponseHash: string | undefined;
292: 
293:     if (remoteBehavior === 'success') {
294:       status = 'transmitted';
295:       this.ledger.T4.sent++;
296:       remoteResponseHash = hash({ source: 'remote', content: 'ack', packetHash: packet.canonicalHash });
297:     } else if (remoteBehavior === 'timeout') {
298:       status = 'timeout';
299:       this.ledger.T4.timeout++;
300:     } else {
301:       status = 'failed';
302:       this.ledger.T4.failed++;
303:     }
304: 
305:     const record: TransmissionRecord = {
306:       id: transmissionId,
307:       routeId: packetId,
308:       status,
309:       remoteResponseHash
310:     };
311: 
312:     this.transmissions.set(transmissionId, record);
313:     if (status === 'transmitted') {
314:       this.ledger.T5.attempted++;
315:     }
316:     this.emitReceipt('transmit', packet.sessionId, decision.channelId, packet.canonicalHash, status);
317:     return record;
318:   }
319: 
320:   /**
321:    * Verb 7: verify - Verify acknowledgment, remote response, hash, and replay.
322:    */
323:   public verify(
324:     transmissionId: string,
325:     expectedResponseHash: string
326:   ): boolean {
327:     const record = this.transmissions.get(transmissionId);
328:     if (!record) {
329:       throw new Error(`Verification error: Transmission record not found`);
330:     }
331: 
332:     if (record.status !== 'transmitted') {
333:       this.ledger.T5.mismatched++;
334:       this.verifications.set(transmissionId, { recordId: transmissionId, isValid: false });
335:       this.emitReceipt('verify', undefined, undefined, record.remoteResponseHash, 'failed');
336:       return false;
337:     }
338: 
339:     const isValid = record.remoteResponseHash === expectedResponseHash;
340:     if (isValid) {
341:       this.ledger.T5.verified++;
342:     } else {
343:       this.ledger.T5.mismatched++;
344:     }
345: 
346:     this.verifications.set(transmissionId, { recordId: transmissionId, isValid });
347:     this.emitReceipt('verify', undefined, undefined, record.remoteResponseHash, isValid ? 'verified' : 'mismatched');
348:     return isValid;
349:   }
350: 
351:   /**
352:    * Verb 8: settle - Close session, conserve accounting, and declare consequence promotability.
353:    * Proves all T1-T5 conservations sum to zero unhandled packets (T-I5).
354:    */
355:   public settle(sessionId: string): { promotable: boolean; reasons: string[] } {
356:     const session = this.sessions.get(sessionId);
357:     if (!session) {
358:       throw new Error(`Settle error: Session not found`);
359:     }
360: 
361:     // T-I5: Settle must prove all T1-T5 conservations sum to zero unhandled packets.
362:     const t1Holds = this.ledger.T1.attempted === this.ledger.T1.established + this.ledger.T1.refused;
363:     const t2Holds = this.ledger.T2.attempted === this.ledger.T2.encoded + this.ledger.T2.refused;
364:     const t3Holds = this.ledger.T3.attempted === this.ledger.T3.admitted + this.ledger.T3.refused;
365:     const t4Holds = this.ledger.T4.attempted === this.ledger.T4.sent + this.ledger.T4.timeout + this.ledger.T4.failed;
366:     const t5Holds = this.ledger.T5.attempted === this.ledger.T5.verified + this.ledger.T5.mismatched;
367: 
368:     const allConservationHolds = t1Holds && t2Holds && t3Holds && t4Holds && t5Holds;
369: 
370:     if (!allConservationHolds) {
371:       throw new Error(`T-I5 Invariant Breach: Accounting domains must strictly conserve to settle.`);
372:     }
373: 
374:     const sessionPackets = Array.from(this.packets.values()).filter(p => p.sessionId === sessionId);
375:     let promotable = true;
376:     const reasons: string[] = [];
377: 
378:     if (sessionPackets.length === 0) {
379:       promotable = false;
380:       reasons.push("No packets were processed in this session.");
381:     }
382: 
383:     for (const packet of sessionPackets) {
384:       const decision = this.routeDecisions.get(packet.id);
385:       if (!decision || decision.status !== 'admitted') {
386:         promotable = false;
387:         reasons.push(`Packet ${packet.id} had route status: ${decision ? decision.status : 'missing'}`);
388:         continue;
389:       }
390: 
391:       const trans = Array.from(this.transmissions.values()).find(t => t.routeId === packet.id);
392:       if (!trans) {
393:         promotable = false;
394:         reasons.push(`Packet ${packet.id} was not transmitted`);
395:         continue;
396:       }
397: 
398:       if (trans.status !== 'transmitted') {
399:         promotable = false;
400:         reasons.push(`Packet ${packet.id} transmission status was: ${trans.status}`);
401:         continue;
402:       }
403: 
404:       const verifyStatus = this.verifications.get(trans.id);
405:       if (!verifyStatus || !verifyStatus.isValid) {
406:         promotable = false;
407:         reasons.push(`Packet ${packet.id} verification status was: ${verifyStatus ? 'invalid' : 'missing'}`);
408:       }
409:     }
410: 
411:     session.status = 'closed';
412: 
413:     if (promotable) {
414:       this.ledger.T6.settled_promotable++;
415:     } else {
416:       this.ledger.T6.settled_blocked++;
417:     }
418: 
419:     this.emitReceipt('settle', sessionId, undefined, undefined, promotable ? 'promotable' : 'blocked');
420:     return { promotable, reasons };
421:   }
422: 
423:   private emitReceipt(
424:     verb: string,
425:     sessionId?: string,
426:     channelId?: string,
427:     packetHash?: string,
428:     decision: string
429:   ): TelcoReceipt {
430:     const receiptId = `rcpt_${verb}_${hash({ verb, sessionId, channelId, packetHash, decision, index: this.receipts.length }).slice(0, 12)}`;
431:     const receipt: TelcoReceipt = {
432:       receiptId,
433:       verb,
434:       sessionId,
435:       channelId,
436:       packetHash,
437:       parentReceiptHash: this.parentReceiptHash,
438:       decision,
439:       createdAt: new Date().toISOString()
440:     };
441:     this.parentReceiptHash = hash(receipt);
442:     this.receipts.push(receipt);
443:     return receipt;
444:   }
445: }
446: 
The above content shows the entire, complete file contents of the requested file.
