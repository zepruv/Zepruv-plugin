---
name: zepruv-system-design-pack
description: Turn a system-design interview topic ("design a rate limiter", "design a URL shortener", "build me a pack on chat systems") into a Zepruv pack - an atlas (architecture), a slate (request flow or sequence) and a scribe walkthrough that shows both - with workspace_create_pack. Also use to build or improve a standalone atlas or slate for a design topic, and to iterate on a pack with workspace_update_system_design / workspace_update_slate.
---

# System-design pack

Output: three documents, in one allowed collection, that belong together:
- an **atlas**: the architecture, every component the design needs, labelled connections, component properties, general notes, interview guide;
- a **slate**: one flow (request lifecycle, decision flow or sequence diagram) with notes;
- a **scribe**: a spoken-answer walkthrough that shows the atlas and slate as design cards.

Read `zepruv-workspace-basics` first if you have not in this session.

## Ask first

1. Topic and scope (e.g. "rate limiter for a public API", not just "rate limiter"). Assume nothing about scale the user has stated otherwise.
2. Collection name. Default: `"<Topic>: interview pack"`. Confirm it.
3. Depth: 45-minute senior answer (default) or a short 20-minute version.

Do not ask more than this. Then build.

## Workflow

1. `workspace_describe_formats {"kind": "atlas"}`, then `{"kind": "slate"}` and `{"kind": "pack"}`.
2. `workspace_list_atlas_components {}`. Use only ids from this list (e.g. `client`, `loadBalancer`, `apiGateway`, `microservice`, `cache`, `database`, `nosqlDb`, `kafka`, `messageQueue`, `worker`, `rateLimiter`, `cdn`, `storage`, `searchEngine`, `monitoring`). If nothing fits, use `custom` with a clear label, or the user's existing `custom_<id>` type. Create a new custom component only if the user asks.
3. Design the architecture on paper first: list components, then connections with labels. Include what the design really needs, as many components as that takes.
4. Lay out the atlas (grid below). Write the slate elements (recipes below).
5. Write the scribe markdown with `{{atlas}}` and `{{slate}}` placeholders.
6. Call `workspace_create_pack`. It returns `{collection, scribe, slate, atlas}` ids.
7. Per-component properties (technology, capacity, replicas, notes) can be given at create time in `design.componentNotes[nodeId]` as objects, or afterwards with `setComponentProperties` in `workspace_update_system_design`.
8. Read the scribe back (`workspace_get_document`) and check both cards resolved to `zws-design://<uuid>`.
9. Report the collection and the three titles. Offer one round of changes.

Writes used: 2. Stay well under the hourly write limit.

## Atlas layout

**Do not choose coordinates.** Describe the structure (components and connections) and leave `x` and `y` out: Zepruv arranges the components in layers that follow the connections (left to right; pass `direction: "TB"` for top to bottom), spaces them for their real size so nothing overlaps, and picks the side each line leaves and arrives at. The same arrangement is what the editor's Tidy up button makes, at any size of diagram. There is no limit to aim for: model the system as completely as it needs.
- Order your `nodes` roughly in the direction of the flow and connect them the way requests and data really move (client to edge to services to stores; services to the event bus to workers). The arrangement follows the connections, so correct connections give a readable picture.
- Give `x`/`y` only to pin a component you want somewhere specific. Components you leave out are placed beside the components they connect to.
- Added more later? `workspace_update_system_design` with `addNodes` (no x/y) puts each new component beside what it connects to and moves nothing else. If the picture has become a mess, call `workspace_arrange_atlas` (it re-arranges the whole atlas; one undo restores it).
- Node ids: short and stable (`n-gw`, `n-cache`), never reused. Connection ids: `c-1`, `c-2`, ...
- Labels: what it is, 2-5 words ("API gateway", "Redis cluster (counters)"). Put the technology in `subtitle` or properties, not in a 9-word label.
- Connections: leave `fromPosition`/`toPosition` out and they are chosen from where the two components end up (set them only to force a side).
- **Make lines mean something.** Give each connection a `kind`: `request` (blue, the default), `data` (green), `async` (amber, dashed: queues and events) or `auth` (rose). Add a `lineStyle` to the design: `"step"` draws right-angle lines, the classic architecture look, `"straight"` straight ones, `"curve"` (default) smooth ones. Pick one style for the whole diagram. Lines are routed around components automatically, and people can drag the checkpoints to adjust them.
- Connection labels say what flows: "check(key)", "allowed", "429 + reason", "events". 1-4 words.
- Readability: name connections briefly, and prefer a few clear connections over every possible one; a dense diagram is fine, the arrangement handles it.

## Slate recipes

Coordinates are canvas pixels, origin top-left. A connector is a separate element with `startPoint`/`endPoint`; compute them from shape edges: right edge middle = (x + width, y + height / 2), bottom middle = (x + width / 2, y + height).

**Decision or lifecycle flow (left to right):** shapes 160-180 x 70, 60 px gap between shapes, all on one centre line. `terminator` for start/end, `process` for steps, `decision` (150 x 100) for branches, `database`/`cylinder` for stores. Branch "no" downwards from the decision's bottom. Colours: start `#3b82f6`, step `#1e293b` with `textColor` `#f8fafc`, decision `#f59e0b`, success `#10b981`, failure `#ef4444`, connectors `#94a3b8`.

**Sequence diagram:** participants are `rectangle` 140 x 55 at y = 50, x = 100, 320, 540, 760 (220 apart). Lifelines are vertical `straightConnector`s from each participant's bottom middle to y = 500, colour `#475569`. Messages are horizontal connectors at y = 170, 230, 290, ... (60 apart) labelled `"1. POST /login"`, `"2. ..."`; replies point right-to-left.

**Notes:** 1-3 `stickyNote`s (default 200 x 200, `#fef08a`) below or beside the flow with the one thing to say out loud. A `text` title at the top (`style: {"fontSize": 20, "fontWeight": "bold"}`). Optional `section` (behind a group; list it before the elements it contains).

Keep a slate to 10-25 elements.

## Scribe walkthrough

Title: `"<Topic>: walkthrough"`. Structure (headings exactly like this so later edits can target them):

```
# Design a <topic>: interview walkthrough
> One line on what the interviewer is really testing.
## 1. Clarify requirements      functional, out of scope, non-functional with numbers
## 2. Estimate the load          QPS avg/peak, storage, bandwidth; show the arithmetic
## 3. High-level design          ![<Topic> architecture](zws-design://{{atlas}} "h=380") + 3-5 bullets
## 4. <The core flow>            ![<Flow name>](zws-design://{{slate}} "h=340") + numbered steps
## 5. Deep dive: <hardest part>  2-3 options compared, one chosen, why
## 6. Data model                 a markdown table
## 7. Bottlenecks and trade-offs failure modes, hot keys, consistency
## Self-review                   2-3 questions to check after practising
```

Quality bar: every number has its arithmetic; every choice names the alternative it beat; no filler sentences; plain words. Each card sits under the heading that talks about it, never stacked at the end.

## Example: workspace_create_pack (rate limiter, abbreviated scribe)

```json
{
  "collection": "System design",
  "scribe": {
    "title": "Rate limiter: walkthrough",
    "markdown": "# Design a rate limiter: interview walkthrough\n\n> Short question, deep follow-ups: defend the algorithm and the failure mode.\n\n## 1. Clarify requirements\n- Limit per API key, fall back to IP.\n- Hard limit: reject with 429.\n\n## 2. Estimate the load\n- 100,000 req/s; 10M keys x 32 B = about 320 MB of counters.\n\n## 3. High-level design\n![Rate limiter architecture](zws-design://{{atlas}} \"h=380\")\n\n- The limiter runs as gateway middleware; counters live in a shared Redis cluster.\n\n## 4. Allow or reject\n![Allow or reject decision](zws-design://{{slate}} \"h=340\")\n\n## 5. Deep dive: algorithm\n| Algorithm | Good at | Weakness |\n|---|---|---|\n| Fixed window | Cheap | 2x burst at window edge |\n| Token bucket (chosen) | Bursts, smooth refill | Two values per key |\n\n## 7. Bottlenecks and trade-offs\n- Redis down: fail open for cheap endpoints, closed for expensive ones.\n\n## Self-review\n- Did I say what happens when Redis is unavailable?\n"
  },
  "atlas": {
    "title": "Rate limiter architecture",
    "design": {
      "nodes": [
        { "id": "n-client", "type": "client", "x": 80, "y": 240, "label": "API clients" },
        { "id": "n-lb", "type": "loadBalancer", "x": 300, "y": 240, "label": "Load balancer" },
        { "id": "n-gw", "type": "apiGateway", "x": 520, "y": 240, "label": "API gateway" },
        { "id": "n-rules", "type": "configServer", "x": 520, "y": 80, "label": "Limit rules" },
        { "id": "n-rl", "type": "rateLimiter", "x": 740, "y": 240, "label": "Rate limiter", "subtitle": "token bucket" },
        { "id": "n-cache", "type": "cache", "x": 740, "y": 80, "label": "Redis cluster", "subtitle": "counters" },
        { "id": "n-api", "type": "microservice", "x": 960, "y": 240, "label": "Backend services" },
        { "id": "n-log", "type": "logging", "x": 740, "y": 400, "label": "Rejection log" },
        { "id": "n-mon", "type": "monitoring", "x": 960, "y": 400, "label": "Metrics and alerts" }
      ],
      "connections": [
        { "id": "c-1", "from": "n-client", "to": "n-lb", "fromPosition": "right", "toPosition": "left", "label": "HTTPS" },
        { "id": "c-2", "from": "n-lb", "to": "n-gw", "fromPosition": "right", "toPosition": "left" },
        { "id": "c-3", "from": "n-rules", "to": "n-gw", "fromPosition": "bottom", "toPosition": "top", "label": "rules (cached 30 s)" },
        { "id": "c-4", "from": "n-gw", "to": "n-rl", "fromPosition": "right", "toPosition": "left", "label": "check(key)" },
        { "id": "c-5", "from": "n-rl", "to": "n-cache", "fromPosition": "top", "toPosition": "bottom", "label": "atomic Lua" },
        { "id": "c-6", "from": "n-rl", "to": "n-api", "fromPosition": "right", "toPosition": "left", "label": "allowed" },
        { "id": "c-7", "from": "n-rl", "to": "n-log", "fromPosition": "bottom", "toPosition": "top", "label": "429 + reason" },
        { "id": "c-8", "from": "n-log", "to": "n-mon", "fromPosition": "right", "toPosition": "left", "label": "reject rate" }
      ],
      "generalNotes": "Scope: per-key limits for a public API, same limits in every region. Chosen: token bucket in Redis, updated by one Lua script per request. Fail open for read endpoints, fail closed for writes.",
      "guide": {
        "name": "Rate limiter: 5 steps",
        "steps": [
          { "id": "req", "title": "1. Requirements", "prompts": ["Who is limited: key, user or IP?", "Hard 429 or soft slow-down?"] },
          { "id": "est", "title": "2. Estimates", "prompts": ["Peak QPS", "Counter memory for all active keys"] },
          { "id": "algo", "title": "3. Algorithm", "prompts": ["Compare fixed window, sliding window, token bucket"] },
          { "id": "atomic", "title": "4. Correctness", "prompts": ["Race between two gateways", "Clock skew"] },
          { "id": "fail", "title": "5. Failure modes", "prompts": ["Redis down", "Hot key"] }
        ]
      }
    }
  },
  "slate": {
    "title": "Allow or reject decision",
    "elements": [
      { "id": "t-title", "type": "text", "x": 40, "y": 30, "width": 420, "height": 40, "label": "Allow or reject one request", "style": { "fontSize": 20, "fontWeight": "bold" } },
      { "id": "s-start", "type": "terminator", "x": 40, "y": 120, "width": 160, "height": 70, "label": "Request arrives", "color": "#3b82f6", "textColor": "#ffffff" },
      { "id": "k-1", "type": "straightConnector", "startPoint": { "x": 200, "y": 155 }, "endPoint": { "x": 260, "y": 155 }, "color": "#94a3b8" },
      { "id": "s-key", "type": "process", "x": 260, "y": 120, "width": 180, "height": 70, "label": "Identify key (API key / IP)", "color": "#1e293b", "textColor": "#f8fafc" },
      { "id": "k-2", "type": "straightConnector", "startPoint": { "x": 440, "y": 155 }, "endPoint": { "x": 500, "y": 155 }, "color": "#94a3b8" },
      { "id": "s-rule", "type": "process", "x": 500, "y": 120, "width": 180, "height": 70, "label": "Load rule (local cache)", "color": "#1e293b", "textColor": "#f8fafc" },
      { "id": "k-3", "type": "straightConnector", "startPoint": { "x": 680, "y": 155 }, "endPoint": { "x": 740, "y": 155 }, "color": "#94a3b8" },
      { "id": "s-dec", "type": "decision", "x": 740, "y": 105, "width": 150, "height": 100, "label": "Token left?", "color": "#f59e0b", "textColor": "#ffffff" },
      { "id": "k-yes", "type": "straightConnector", "startPoint": { "x": 890, "y": 155 }, "endPoint": { "x": 960, "y": 155 }, "label": "yes", "color": "#10b981" },
      { "id": "s-ok", "type": "process", "x": 960, "y": 120, "width": 180, "height": 70, "label": "Take token, forward", "color": "#10b981", "textColor": "#ffffff" },
      { "id": "k-no", "type": "straightConnector", "startPoint": { "x": 815, "y": 205 }, "endPoint": { "x": 815, "y": 280 }, "label": "no", "color": "#ef4444" },
      { "id": "s-429", "type": "process", "x": 725, "y": 280, "width": 180, "height": 70, "label": "429 + Retry-After", "color": "#ef4444", "textColor": "#ffffff" },
      { "id": "n-race", "type": "stickyNote", "x": 40, "y": 260, "width": 240, "height": 150, "label": "Read and decrement in ONE Lua script, or two gateways can both spend the last token." }
    ]
  }
}
```

Follow-up properties patch (step 7):

```json
{
  "id": "<atlas id from the pack result>",
  "patch": {
    "setComponentProperties": {
      "n-cache": { "technology": "Redis Cluster", "capacity": "about 320 MB for 10M keys", "replicas": "3 shards x 2", "notes": "Hash per key: tokens, last_refill" },
      "n-rl": { "technology": "Gateway middleware + Lua", "notes": "Fail open on Redis timeout for GET, closed for POST" },
      "n-gw": { "technology": "Envoy", "replicas": "6" }
    }
  }
}
```

Property fields: `name`, `nodeType` (`Standard` | `Custom` | `External API`), `category`, `technology`, `capacity`, `replicas`, `notes`. Fill at least technology on stores, queues and the core service.

## Check what you made (you cannot see the canvas)

Every call that creates or changes a slate or atlas returns a `layout` field. `"ok"` means nothing is wrong. Otherwise it lists problems, each with the element `ids` and a `fix`:

- `overlap`, `stacked`, `no_position`: things on top of each other. Move them, or run `workspace_arrange_atlas` for an atlas.
- `text_overflow`, `label_too_long`, `too_small`: text will be cut off. Enlarge the shape, shorten the label (put detail in `subtitle` or notes), or lower `style.fontSize`.
- `line_through_component`, `many_line_crossings`: a line is hard to follow. `workspace_arrange_atlas` routes lines around components.
- `low_contrast`, `dangling_connector`, `straddles_section`, `far_away`: fix the colours, the connector's end points, or the position.

Fix what is listed, then look at `layout` in the next result (or call `workspace_check_layout {"id"}`). Stop when it says `"ok"`, and do not loop more than three times. Text fit is an estimate (no fonts are loaded), so a rare warning may be cautious: change it only if it is cheap to do. Tell the user about any warning you left.

## Interview guide

`design.guide` is either a template id (`"classic_7_step"`, `"lightweight_4_step"`) or a custom object `{name, steps: [{id?, title, prompts[], notes?, status?}]}`. Prefer a custom guide with topic-specific prompts (4-7 steps, 1-4 prompts each). Step `status`: `pending` | `active` | `done` | `skipped`. Later edits: `setGuide` (template id or object) replaces it; `updateGuideSteps: [{"id": "algo", "status": "done", "notes": "..."}]` ticks steps off.

## Iterating

Read first (`workspace_get_document`), then one patch per round:
- Atlas: `addNodes`, `updateNodes` (`[{"id": "n-gw", "label": "Edge gateway"}]`), `moveNodes` (`[{"ids": ["n-log", "n-mon"], "dx": 0, "dy": 160}]`), `removeNodeIds` (also drops their connections and notes), `addConnections`, `updateConnections`, `removeConnectionIds`, `setComponentProperties`, `setGeneralNotes`, `setGuide`, `updateGuideSteps`.
- Slate: `addElements`, `updateElements` (merge by id; `style` merges key by key), `moveElements` (`[{"ids": [...], "dx": 220, "dy": 0}]`; connectors move with the selection only if their ids are included), `removeElementIds`.
- Scribe: see the `zepruv-scribe-editing` skill.
- To add another diagram later, prefer `workspace_create_inline_design` (it belongs to the scribe and its card is placed for you). Use `workspace_embed_design` only for a design that already exists in the collection.

To nudge a few components, use `moveNodes`; to re-arrange everything, `workspace_arrange_atlas`.

## If the pack call fails

`workspace_create_pack` builds the pack inside one of the allowed collections (name it with `collection`; optional when only one is allowed) and cannot create a new collection. The slate and atlas are **inline** by default: they belong to the scribe (the collection lists one document). Pass `inline: false` for separate documents. If it fails half-way, build the remaining parts yourself:
1. `workspace_create_system_design {"title", "design", "collection": "<granted>"}`.
2. `workspace_create_slate {"title", "elements", "collection": "<granted>"}`.
3. `workspace_create_note {"title", "markdown", "collection": "<granted>"}` with the real ids written into the cards (`zws-design://<atlas id>`), or add the cards afterwards with `workspace_embed_design {"scribeId", "designId", "afterHeading": "3. High-level design"}`.

## Pitfalls

- A connection naming a node id that does not exist fails the whole call. Duplicate node ids fail too.
- `design.componentNotes[nodeId]` may be a plain note or a properties object `{name, nodeType, category, technology, capacity, replicas, notes}`; `generalNotes` is the design-wide note.
- If the pack fails half-way, the error lists what was already created. Nothing is deleted automatically; tell the user and continue from what exists rather than creating duplicates.
- Slate element ids must be unique; omitted ids are assigned (`node-N`), and you then cannot refer to them without re-reading.
- Max 500 slate elements on create, 200 per patch list.
- Do not invent component types. Use ids from `workspace_list_atlas_components`; `custom_<id>` types must already exist in the user's library or the call fails.
