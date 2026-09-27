/* Pure pipe topology and conserved pump transfers. Quantities are world blocks.
   Tanks are sinks: their ports do not bridge otherwise disconnected pipe graphs. */
(function (root, factory) {
  'use strict';
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.ExtractionNetwork = api;
})(typeof window === 'object' ? window : null, function () {
  'use strict';
  const KINDS = Object.freeze(['oil', 'water', 'lava']);
  const kindValid = kind => KINDS.includes(kind);
  const coordinate = point => point && Number.isSafeInteger(point.x) && Number.isSafeInteger(point.y);
  const key = point => point.x + ',' + point.y;
  const neighbors = point => [
    { x: point.x, y: point.y - 1 }, { x: point.x + 1, y: point.y },
    { x: point.x, y: point.y + 1 }, { x: point.x - 1, y: point.y },
  ];
  const orderPoint = (a, b) => a.y - b.y || a.x - b.x;
  const orderId = (a, b) => String(a.id).localeCompare(String(b.id), 'en', { numeric: true }) || a.index - b.index;
  const positive = value => Number.isFinite(value) && value > 0;

  function createNetwork() {
    // A single latest topology is retained; repeated edits cannot grow this cache.
    let cachedSignature = null, cachedTopology = null, topologyBuilds = 0;

    function topologyFor(pipes) {
      const unique = new Map();
      for (const pipe of pipes) if (coordinate(pipe)) unique.set(key(pipe), { x: pipe.x, y: pipe.y });
      const cells = [...unique.values()].sort(orderPoint);
      const signature = cells.map(key).join(';');
      if (signature === cachedSignature) return cachedTopology;
      const componentByCell = Object.create(null), components = [];
      for (const start of cells) {
        if (Object.hasOwn(componentByCell, key(start))) continue;
        const id = key(start), queue = [start], members = [];
        componentByCell[id] = id;
        for (let i = 0; i < queue.length; i++) {
          const cell = queue[i], adjacent = neighbors(cell).filter(next => unique.has(key(next)));
          members.push(Object.freeze({ x: cell.x, y: cell.y, degree: adjacent.length }));
          for (const next of adjacent) {
            const nextKey = key(next);
            if (Object.hasOwn(componentByCell, nextKey)) continue;
            componentByCell[nextKey] = id;
            queue.push(unique.get(nextKey));
          }
        }
        members.sort(orderPoint);
        components.push(Object.freeze({ id, cells: Object.freeze(members) }));
      }
      topologyBuilds++;
      cachedSignature = signature;
      cachedTopology = Object.freeze({
        componentByCell: Object.freeze(componentByCell), components: Object.freeze(components),
      });
      return cachedTopology;
    }

    /**
     * update({pipes,pumps,tanks}, dtSeconds, adapter)
     * pipes: {x,y,kind?}; pumps: {id,intake:{x,y},outlet:{x,y},rate?:1,enabled?:true}
     * tanks: {id,ports:[{x,y}],amount?:0,kind?:null,capacity?:32}
     * query(x,y) -> null | {kind,amount}; extract(x,y,kind,requested) -> amount.
     * Adapter quantities are block units. extract must atomically remove and return
     * a finite amount in [0, requested], or throw without removing anything.
     * Inputs are never mutated; callers must apply returned tanks after every update.
     * Adapter failures are reported so earlier successful transfers are not lost.
     */
    function update(state = {}, dtSeconds, adapter) {
      const pipes = Array.isArray(state.pipes) ? state.pipes : [];
      const pumps = (Array.isArray(state.pumps) ? state.pumps : []).map((pump, index) => ({
        ...pump, id: pump.id ?? 'pump:' + index, index,
      })).sort(orderId);
      const tanks = (Array.isArray(state.tanks) ? state.tanks : []).map(tank => ({
        ...tank, capacity: tank.capacity ?? 32, amount: tank.amount ?? 0,
        kind: (tank.amount ?? 0) === 0 ? null : tank.kind,
      }));
      const topology = topologyFor(pipes), diagnostics = [], transfers = [], pumpResults = [];
      const componentMap = new Map(topology.components.map(component => [component.id, {
        ...component, kind: null, mixed: false, tanks: [], terminals: [],
      }]));
      const componentAt = point => coordinate(point) ? componentMap.get(topology.componentByCell[key(point)]) : null;
      function constrain(component, kind) {
        if (!component || !kind) return;
        if (!kindValid(kind) || (component.kind && component.kind !== kind)) component.mixed = true;
        else component.kind = kind;
      }
      for (const pipe of pipes) constrain(componentAt(pipe), pipe.kind);

      const intakePorts = new Set(pumps.filter(pump => coordinate(pump.intake)).map(pump => key(pump.intake)));
      for (const component of componentMap.values()) {
        component.terminals = component.cells.filter(cell => cell.degree <= 1 &&
          !(cell.degree > 0 && intakePorts.has(key(cell))));
      }
      tanks.forEach((tank, index) => {
        const ports = Array.isArray(tank.ports) ? tank.ports : [];
        const componentIds = [...new Set(ports.map(point => componentAt(point)?.id).filter(id => id !== undefined))];
        const valid = Number.isFinite(tank.capacity) && tank.capacity >= 0 &&
          Number.isFinite(tank.amount) && tank.amount >= 0 && tank.amount <= tank.capacity &&
          (tank.amount === 0 || kindValid(tank.kind));
        const record = { tank, id: tank.id ?? 'tank:' + index, index, componentIds, valid };
        if (!valid) diagnostics.push({ type: 'invalid-tank', tankId: record.id });
        for (const id of componentIds) {
          const component = componentMap.get(id);
          if (valid) component.tanks.push(record);
          // An invalid occupied tank must not silently allow a different fluid in.
          if (tank.amount > 0) constrain(component, tank.kind || 'unknown');
        }
      });
      for (const component of componentMap.values()) component.tanks.sort(orderId);

      let totalTransferred = 0;
      const activeTime = positive(dtSeconds);
      if (activeTime && (!adapter || typeof adapter.query !== 'function' || typeof adapter.extract !== 'function')) {
        throw new TypeError('ExtractionNetwork requires query and extract adapter functions');
      }
      function query(cell, pumpId) {
        try {
          const source = adapter.query(cell.x, cell.y);
          if (!source || !positive(source.amount)) return null;
          if (!kindValid(source.kind)) {
            diagnostics.push({ type: 'invalid-source', pumpId, x: cell.x, y: cell.y });
            return { kind: 'unknown', amount: source.amount };
          }
          return { kind: source.kind, amount: source.amount };
        } catch (error) {
          diagnostics.push({ type: 'query-error', pumpId, message: String(error?.message || error) });
          return null;
        }
      }

      for (const pump of pumps) {
        const result = { id: pump.id, status: 'paused', amount: 0, kind: null };
        pumpResults.push(result);
        const rate = pump.rate ?? 1;
        if (!activeTime || pump.enabled === false || !positive(rate)) continue;
        const budget = rate * dtSeconds;
        if (!positive(budget)) continue;
        const intake = componentAt(pump.intake), outlet = componentAt(pump.outlet);
        if (!intake) { result.status = 'no-intake'; continue; }
        if (!outlet) { result.status = 'no-outlet'; continue; }
        if (intake.id === outlet.id) { result.status = 'loop'; continue; }
        if (intake.mixed || outlet.mixed) { result.status = 'mixed'; continue; }
        if (!outlet.tanks.length) { result.status = 'no-tank'; continue; }

        const sources = intake.terminals.map(cell => ({ cell, source: query(cell, pump.id) })).filter(item => item.source);
        const kinds = new Set(sources.map(item => item.source.kind));
        if (!sources.length) { result.status = 'dry'; continue; }
        if (kinds.size !== 1 || !kindValid(sources[0].source.kind)) {
          intake.mixed = true; result.status = 'mixed'; continue;
        }
        const kind = sources[0].source.kind;
        if ((intake.kind && intake.kind !== kind) || (outlet.kind && outlet.kind !== kind)) {
          result.status = 'mixed'; continue;
        }
        result.kind = kind;
        const sinks = outlet.tanks.filter(record => record.valid &&
          (record.tank.amount === 0 || record.tank.kind === kind) &&
          record.componentIds.every(id => {
            const other = componentMap.get(id);
            return !other.mixed && (!other.kind || other.kind === kind);
          }));
        if (!sinks.length) { result.status = 'mixed'; continue; }
        if (!sinks.some(record => record.tank.amount < record.tank.capacity)) { result.status = 'full'; continue; }

        let remaining = budget, failed = false;
        for (const record of sinks) {
          const tank = record.tank;
          for (const { cell } of sources) {
            if (!(remaining > 0 && tank.amount < tank.capacity)) break;
            // Sources are re-queried before each removal, including between pumps.
            const source = query(cell, pump.id);
            if (!source || source.kind !== kind) continue;
            const requested = Math.min(remaining, source.amount, tank.capacity - tank.amount);
            if (!positive(requested)) continue;
            let actual;
            try { actual = adapter.extract(cell.x, cell.y, kind, requested); }
            catch (error) {
              diagnostics.push({ type: 'extract-error', pumpId: pump.id, message: String(error?.message || error) });
              failed = true; break;
            }
            // An adapter contract violation is explicit; never silently discard an
            // over-return by clamping it to the request. The adapter owns rollback.
            if (!Number.isFinite(actual) || actual < 0 || actual > requested) {
              diagnostics.push({ type: 'invalid-extraction', pumpId: pump.id, requested, actual });
              failed = true; break;
            }
            if (actual === 0) continue;
            tank.amount += actual; tank.kind = kind;
            remaining -= actual; result.amount += actual; totalTransferred += actual;
            constrain(intake, kind); constrain(outlet, kind);
            for (const id of record.componentIds) constrain(componentMap.get(id), kind);
            transfers.push({ pumpId: pump.id, tankId: record.id, kind, amount: actual, x: cell.x, y: cell.y });
          }
          if (failed || remaining <= 0) break;
        }
        result.status = result.amount > 0 ? 'pumping' : 'dry';
      }
      const components = [...componentMap.values()].map(({ id, kind, mixed, cells }) => ({ id, kind, mixed, cells }));
      return {
        tanks, pumps: pumpResults, transfers, totalTransferred, diagnostics,
        componentByCell: topology.componentByCell,
        componentTypes: Object.fromEntries(components.map(component => [component.id, component.mixed ? null : component.kind])),
        components,
      };
    }
    return Object.freeze({
      update,
      getStats: () => ({ cacheEntries: cachedTopology ? 1 : 0,
        cells: cachedTopology ? Object.keys(cachedTopology.componentByCell).length : 0, topologyBuilds }),
    });
  }
  const defaultNetwork = createNetwork();
  return Object.freeze({ KINDS, createNetwork, update: defaultNetwork.update });
});
