Created At: 2026-05-24T17:37:12Z
Completed At: 2026-05-24T17:37:12Z
File Path: `file:///Users/sac/truex/scratch/recovered-telco.gall.ts`
Total Lines: 455
Total Bytes: 15026
Showing lines 1 to 200
The following code has been modified to include a line number before every line, in the format: <line_number>: <original_line>. Please note that any changes targeting the original code should remove the line number, colon, and leading space.
1: Created At: 2026-05-24T16:25:03Z
2: Completed At: 2026-05-24T16:25:03Z
3: File Path: `file:///Users/sac/truex/packages/membrane/src/telco.gall.ts`
4: Total Lines: 446
5: Total Bytes: 14499
6: Showing lines 1 to 446
7: The following code has been modified to include a line number before every line, in the format: <line_number>: <original_line>. Please note that any changes targeting the original code should remove the line number, colon, and leading space.
8: /**
9:  * @module Telco
10:  * @description
11:  * Gall Classification: Gall S13 (Telco Interop Membrane)
12:  * Purpose: Telco is the interop authority. It answers who is speaking, what boundary they cross, 
13:  * what protocol is admissible, and ensures no unreceipted communication becomes authority.
14:  */
15: 
16: import { hash } from "./hash.js";
17: 
18: export interface TelcoChannel {
19:   id: string;
20:   direction: 'inbound' | 'outbound';
21:   protocolFamily: string;
22:   mailboxBinding: string;
23:   refusalPolicy: Record<string, any>;
24:   boundaryStatus: 'admitted' | 'refused';
25: }
26: 
27: export interface TelcoPeer {
28:   id: string;
29:   identityProof: string;
30:   status: 'known' | 'unknown';
31: }
32: 
33: export interface CapabilityBinding {
34:   capabilityId: string;
35:   epoch: number;
36:   allowedActionFamilies: string[];
37: }
38: 
39: export interface TelcoSession {
40:   id: string;
41:   peerId: string;
42:   status: 'pending' | 'handshaking' | 'active' | 'closed' | 'suspended';
43:   capability: CapabilityBinding;
44:   freshnessWindowStart: number;
45:   freshnessWindowEnd: number;
46: }
47: 
48: export interface TelcoPacket {
49:   id: string;
50:   sessionId: string;
51:   canonicalHash: string;
52:   encodedPayload: string;
53: }
54: 
55: export interface RouteDecision {
56:   packetId: string;
57:   channelId: string;
58:   retryPolicy: string;
59:   status: 'admitted' | 'refused';
60: }
61: 
62: export interface TransmissionRecord {
63:   id: string;
64:   routeId: string;
65:   status: 'enqueued' | 'executing' | 'transmitted' | 'failed' | 'timeout';
66:   remoteResponseHash?: string;
67: }
68: 
69: export interface TelcoReceipt {
70:   receiptId: string;
71:   verb: string;
72:   sessionId?: string;
73:   channelId?: string;
74:   packetHash?: string;
75:   parentReceiptHash?: string;
76:   decision: string;
77:   createdAt: string;
78: }
79: 
80: export interface TelcoAccounting {
81:   T1: { attempted: number; established: number; refused: number }; // Sessions
82:   T2: { attempted: number; encoded: number; refused: number };     // Packets
83:   T3: { attempted: number; admitted: number; refused: number };    // Routes
84:   T4: { attempted: number; sent: number; timeout: number; failed: number }; // Transmissions
85:   T5: { attempted: number; verified: number; mismatched: number }; // Verifications
86:   T6: { attempted: number; settled_promotable: number; settled_blocked: number }; // Settlement
87: }
88: 
89: export class TelcoMembrane {
90:   public channels: Map<string, TelcoChannel> = new Map();
91:   public peers: Map<string, TelcoPeer> = new Map();
92:   public sessions: Map<string, TelcoSession> = new Map();
93:   public packets: Map<string, TelcoPacket> = new Map();
94:   public routeDecisions: Map<string, RouteDecision> = new Map();
95:   public transmissions: Map<string, TransmissionRecord> = new Map();
96:   public verifications: Map<string, { recordId: string; isValid: boolean }> = new Map();
97:   public receipts: TelcoReceipt[] = [];
98: 
99:   // Strict Accounting Ledger (T1-T6)
100:   public ledger: TelcoAccounting = {
101:     T1: { attempted: 0, established: 0, refused: 0 },
102:     T2: { attempted: 0, encoded: 0, refused: 0 },
103:     T3: { attempted: 0, admitted: 0, refused: 0 },
104:     T4: { attempted: 0, sent: 0, timeout: 0, failed: 0 },
105:     T5: { attempted: 0, verified: 0, mismatched: 0 },
106:     T6: { attempted: 0, settled_promotable: 0, settled_blocked: 0 },
107:   };
108: 
109:   private parentReceiptHash?: string;
110:   private supportedProtocols: string[] = ['proto/zoe.ocel2.v1', 'proto/grpc.v1'];
111: 
112:   constructor(supportedProtocols?: string[]) {
113:     if (supportedProtocols) {
114:       this.supportedProtocols = supportedProtocols;
115:     }
116:   }
117: 
118:   /**
119:    * Verb 1: listen - Declare and inspect an inbound communication surface and its mailbox.
120:    */
121:   public listen(channel: Omit<TelcoChannel, 'boundaryStatus'>, isAdmitted: boolean): TelcoChannel {
122:     const status = isAdmitted ? 'admitted' : 'refused';
123:     const finalChannel: TelcoChannel = {
124:       ...channel,
125:       boundaryStatus: status
126:     };
127:     this.channels.set(finalChannel.id, finalChannel);
128:     this.emitReceipt('listen', undefined, finalChannel.id, undefined, status);
129:     return finalChannel;
130:   }
131: 
132:   /**
133:    * Verb 2: dial - Attempt outbound communication with a discoverable peer.
134:    */
135:   public dial(peerId: string, peerProof: string, isKnown: boolean): TelcoPeer {
136:     this.ledger.T1.attempted++;
137:     const status = isKnown ? 'known' : 'unknown';
138:     const peer: TelcoPeer = {
139:       id: peerId,
140:       identityProof: peerProof,
141:       status
142:     };
143:     this.peers.set(peerId, peer);
144:     if (!isKnown) {
145:       this.ledger.T1.refused++;
146:       this.emitReceipt('dial', undefined, undefined, undefined, 'refused');
147:     } else {
148:       this.emitReceipt('dial', undefined, undefined, undefined, 'succeeded');
149:     }
150:     return peer;
151:   }
152: 
153:   /**
154:    * Verb 3: handshake - Bind peer, protocol, epoch, capability, and freshness window.
155:    * Drops connections offering unsupported protocol shapes (T-I2).
156:    */
157:   public handshake(
158:     sessionId: string,
159:     peerId: string,
160:     protocolShape: string,
161:     capability: CapabilityBinding,
162:     freshnessStart: number,
163:     freshnessEnd: number
164:   ): TelcoSession {
165:     const peer = this.peers.get(peerId);
166:     
167:     // T-I2: Handshake drops connections offering unsupported protocol shapes.
168:     const isProtoSupported = this.supportedProtocols.includes(protocolShape);
169:     
170:     if (!isProtoSupported || !peer || peer.status === 'unknown' || capability.epoch <= 0) {
171:       if (peer && peer.status === 'known') {
172:         this.ledger.T1.refused++;
173:       }
174:       this.emitReceipt('handshake', sessionId, undefined, undefined, 'refused');
175:       throw new Error(`T-I2 Handshake refused: Unsupported protocol shape, unknown peer, or invalid epoch`);
176:     }
177: 
178:     const session: TelcoSession = {
179:       id: sessionId,
180:       peerId,
181:       status: 'active',
182:       capability,
183:       freshnessWindowStart: freshnessStart,
184:       freshnessWindowEnd: freshnessEnd
185:     };
186: 
187:     this.sessions.set(sessionId, session);
188:     this.ledger.T1.established++;
189:     this.ledger.T6.attempted++;
190:     this.emitReceipt('handshake', sessionId, undefined, undefined, 'active');
191:     return session;
192:   }
193: 
194:   /**
195:    * Verb 4: encode - Project internal objects into canonical boundary packets.
196:    */
197:   public encode(
198:     packetId: string,
199:     sessionId: string,
200:     payload: string
The above content does NOT show the entire file contents. If you need to view any lines of the file which were not shown to complete your task, call this tool again to view those lines.
