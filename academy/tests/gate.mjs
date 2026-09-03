// academy/tests/gate.mjs — pure gate logic evaluated in a sandbox (no browser)
import vm from 'node:vm'; import crypto from 'node:crypto';
import { read, fail } from './_util.mjs';
const root = {}; vm.runInNewContext(read('academy/assets/gate.js'), { root, window: undefined });
const G = root.AcademyGate; if (!G) fail('gate.js must export root.AcademyGate');
const eq = (a, b, m) => { if (JSON.stringify(a) !== JSON.stringify(b)) fail(`${m}: got ${JSON.stringify(a)}`); };
eq(G.PUBLIC_TRACKS, ['solar-fundamentals', 'ev-storage'], 'public tracks'); eq(G.TEAM_TRACKS, ['sales-bd', 'technical', 'management'], 'team tracks');
eq(G.trackOf('courses/sales-bd-02.html'), 'sales-bd', 'trackOf lesson'); eq(G.trackOf('/academy/courses/technical-01.html'), 'technical', 'trackOf abs path');
eq(G.trackOf('/academy/index.html'), null, 'trackOf hub'); eq(G.isTeamTrack('management'), true, 'team'); eq(G.isTeamTrack('ev-storage'), false, 'public');
eq(G.KEY_HASH, crypto.createHash('sha256').update('bustan-team-2026').digest('hex'), 'hash of the shared passcode');
console.log('gate: ok');
