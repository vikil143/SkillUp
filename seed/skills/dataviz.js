// seed/skills/dataviz.js — D3.js, Three.js, SVG
import { mk, uid } from '../helpers.js';

const card = (q, a) => ({ id: uid(), q, a });
const api = (name, signature, description, params, returns, example, gotchas) => ({
  id: uid(),
  name,
  signature,
  description,
  params,
  returns,
  example,
  gotchas,
});
const ref = (title, url) => ({ id: uid(), title, url });

export default function buildDatavizSkills() {
  const skills = [];

  const d3 = mk('D3.js', 'dataviz', null, {
    definition:
      'D3.js is a low-level JavaScript library for binding data to DOM/SVG/Canvas and driving visual changes through transforms and scales. It gives fine-grained control over chart behavior, interactions, and animations rather than high-level chart presets. D3 is ideal when product requirements exceed what off-the-shelf chart libraries can express.',
    codeExample:
      "import * as d3 from 'd3';\n\nconst data = [12, 18, 9, 24, 15];\nconst width = 360;\nconst height = 180;\n\nconst x = d3.scaleBand().domain(data.map((_, i) => i)).range([0, width]).padding(0.2);\nconst y = d3.scaleLinear().domain([0, d3.max(data)]).nice().range([height, 0]);\n\nconst svg = d3.select('#chart').append('svg').attr('width', width).attr('height', height);\nsvg.selectAll('rect')\n  .data(data)\n  .join('rect')\n  .attr('x', (_, i) => x(i))\n  .attr('y', (d) => y(d))\n  .attr('width', x.bandwidth())\n  .attr('height', (d) => height - y(d));",
    whenUsed: 'Used for custom interactive graphing and high-performance visualization flows in `p-stock`.',
    gotchas:
      'Using array index as data key in joins causes unstable transitions during reorder.\nMixing D3 DOM mutation with React rendering without boundary ownership creates conflicts.\nScale domains not recomputed from new data produce clipped or misleading visuals.\nLarge SVG node counts degrade performance; switch to canvas for dense scatter/heat maps.',
    flashcards: [
      card('What does D3 data join solve?', 'It reconciles data with existing DOM elements and lets you define enter/update/exit behavior deterministically.'),
      card('Why are scales central in D3 architecture?', 'Scales map raw data domains to visual ranges and isolate conversion logic from rendering code.'),
      card('When should you use Canvas with D3 utilities?', 'When visual density is too high for SVG DOM performance but you still need D3 scales/layouts/axes logic.'),
      card('Why does `selection.join` usually beat manual enter/update/exit?', 'It simplifies code and reduces edge-case bugs while preserving keyed reconciliation semantics.'),
      card('How can transitions hide data correctness issues?', 'Smooth animations can mask wrong scales or stale domains; always validate static correctness first.'),
      card('What is a common React + D3 split?', 'Use D3 for math/scales and React for DOM, or isolate D3 full DOM control inside refs.'),
      card('Why do time scales need parsing discipline?', 'Mixed timezone/parsing rules can shift points and break trend interpretation.'),
      card('What makes an interactive chart usable under load?', 'Incremental rendering, debounced handlers, and bounded tooltip computations.'),
    ],
    apis: [
      api('d3.select', 'd3.select(selector)', 'Selects first matching DOM element for chained operations.', 'CSS selector or element', 'selection', "const svg = d3.select('#chart').append('svg');", 'Selecting before element mount returns empty selections.'),
      api('selection.data().join()', 'selection.data(data, key?).join(enter, update, exit)', 'Binds data and defines element lifecycle behavior.', 'data array and optional key function', 'merged selection', "svg.selectAll('circle').data(points, (d) => d.id).join('circle');", 'Missing stable keys causes transition/state mismatch.'),
      api('scaleLinear', 'd3.scaleLinear().domain([min,max]).range([a,b])', 'Maps continuous numeric domain to continuous range.', 'domain and range arrays', 'scale function', 'const y = d3.scaleLinear().domain([0, 100]).range([200, 0]);', 'Range inversion for y-axis is easy to forget.'),
      api('scaleBand', 'd3.scaleBand().domain(keys).range([a,b]).padding(p)', 'Maps categorical values to evenly spaced bands.', 'category domain and numeric range', 'band scale', 'const x = d3.scaleBand().domain(labels).range([0, w]);', 'Band scales have no invert by default.'),
      api('axisBottom/axisLeft', 'd3.axisBottom(scale), d3.axisLeft(scale)', 'Creates axis generators for scales.', 'configured scale', 'axis function', "svg.append('g').attr('transform', `translate(0,${h})`).call(d3.axisBottom(x));", 'Axis labels can overlap without tick/format tuning.'),
      api('line generator', 'd3.line().x(fn).y(fn)', 'Converts point arrays into SVG path data.', 'x/y accessor functions', 'path generator', "const line = d3.line().x((d) => x(d.t)).y((d) => y(d.v));", 'Null/NaN values break paths unless handled with defined().'),
      api('zoom behavior', 'd3.zoom().on("zoom", handler)', 'Adds pan/zoom interaction to selections.', 'extent/scale config and handler', 'zoom behavior', "svg.call(d3.zoom().on('zoom', (e) => g.attr('transform', e.transform)));", 'Must rescale axes/marks consistently to avoid drift.'),
      api('transition', 'selection.transition().duration(ms)', 'Animates attribute/style changes over time.', 'duration/easing/interpolation config', 'transition object', "bars.transition().duration(300).attr('height', (d) => h - y(d));", 'Concurrent transitions can interrupt each other unexpectedly.'),
    ],
    refs: [
      ref('D3 Official API', 'https://d3js.org/'),
      ref('Observable D3 Examples', 'https://observablehq.com/@d3'),
      ref('D3 In Depth', 'https://www.d3indepth.com/'),
      ref('SVG and D3 Guide (MDN)', 'https://developer.mozilla.org/en-US/docs/Web/SVG'),
      ref('Data Visualization Best Practices', 'https://www.data-to-viz.com/'),
    ],
    relatedProjectIds: ['p-stock'],
  });
  skills.push(d3);

  [
    'Selections & Data Join',
    'Scales & Axes',
    'Shapes (line/area/arc)',
    'Transitions & Animations',
    'Interactions (zoom/brush/drag)',
    'Layouts (hierarchy/stack/force)',
    'React Integration Patterns',
  ].forEach((name) => {
    skills.push(
      mk(name, 'dataviz', d3.id, {
        definition: `${name} is a core D3 subtopic for robust interactive chart systems.`,
        codeExample:
          name === 'Selections & Data Join'
            ? "g.selectAll('circle')\n  .data(points, (d) => d.id)\n  .join('circle')\n  .attr('r', 3);"
            : name === 'Scales & Axes'
              ? "const x = d3.scaleTime().domain([minDate, maxDate]).range([0, width]);\ng.call(d3.axisBottom(x));"
              : "const t = d3.transition().duration(250);\nbars.transition(t).attr('y', (d) => y(d.value));",
        flashcards: [
          card(`What usually fails first in ${name}?`, 'Data-key/scale consistency under incremental updates and interaction state changes.'),
          card(`How do you harden ${name} for production?`, 'Add deterministic keys, resize handling, and performance budgets for node count and event frequency.'),
        ],
      })
    );
  });

  const three = mk('Three.js', 'dataviz', null, {
    definition:
      'Three.js is a WebGL abstraction library for rendering 3D scenes in browsers. In dataviz, it enables large-point clouds, 3D surfaces, and immersive spatial analytics beyond 2D charts. It provides scene graph, cameras, materials, geometry, and render loops that can be combined with data pipelines.',
    codeExample:
      "import * as THREE from 'three';\n\nconst scene = new THREE.Scene();\nconst camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);\nconst renderer = new THREE.WebGLRenderer({ antialias: true });\nrenderer.setSize(window.innerWidth, window.innerHeight);\ndocument.body.appendChild(renderer.domElement);\n\nconst geometry = new THREE.BoxGeometry();\nconst material = new THREE.MeshStandardMaterial({ color: 0x4f46e5 });\nconst cube = new THREE.Mesh(geometry, material);\nscene.add(cube);\nscene.add(new THREE.DirectionalLight(0xffffff, 1));\ncamera.position.z = 4;\n\nfunction animate() {\n  cube.rotation.y += 0.01;\n  renderer.render(scene, camera);\n  requestAnimationFrame(animate);\n}\nanimate();",
    whenUsed: 'Relevant for advanced visualization work and exploratory 3D interactions when 2D charting is insufficient.',
    gotchas:
      'Forgetting to dispose geometries/materials/textures causes GPU memory leaks.\nPer-frame object allocations in animation loop trigger GC jank.\nCamera controls without bounds disorient users and reduce analytical usability.\nHigh-detail geometry on low-end devices drops frame rate quickly.',
    flashcards: [
      card('Why is disposal critical in Three.js apps?', 'GPU resources are not automatically reclaimed promptly; explicit disposal prevents memory growth.'),
      card('When does instancing matter in 3D dataviz?', 'Rendering many similar objects where draw-call reduction is crucial.'),
      card('What is the analytical downside of unconstrained 3D interactions?', 'Users can lose orientation/context and misread spatial relationships.'),
      card('Why is camera choice important in data scenes?', 'Perspective can distort quantitative interpretation; orthographic is often better for metric fidelity.'),
      card('How do you keep render loops efficient?', 'Avoid per-frame allocations, throttle expensive calculations, and update only changed uniforms/transforms.'),
      card('What role does raycasting play in dataviz UX?', 'It enables object picking/hover detail, linking interaction to data entities.'),
      card('How does post-processing affect readability?', 'Effects can improve clarity but easily over-stylize and obscure actual values.'),
      card('Why pair Three.js with 2D overlays?', 'Labels/tooltips/legends are often clearer in HTML/CSS than in-scene text rendering.'),
    ],
    apis: [
      api('THREE.Scene', 'new THREE.Scene()', 'Container for all objects, lights, and environment.', 'none', 'scene instance', 'const scene = new THREE.Scene();', 'Too many scene children without culling impacts performance.'),
      api('THREE.PerspectiveCamera', 'new THREE.PerspectiveCamera(fov, aspect, near, far)', 'Defines perspective projection camera.', 'fov/aspect clipping planes', 'camera instance', 'const cam = new THREE.PerspectiveCamera(60, w / h, 0.1, 1000);', 'Near/far planes too wide reduce depth precision.'),
      api('THREE.WebGLRenderer', 'new THREE.WebGLRenderer(options)', 'Renders scene/camera output to canvas.', 'renderer options like antialias', 'renderer instance', 'renderer.render(scene, camera);', 'Handle resize updates for aspect and canvas dimensions.'),
      api('THREE.BufferGeometry', 'new THREE.BufferGeometry()', 'Efficient geometry container for custom vertex data.', 'typed attribute buffers', 'geometry', 'geometry.setAttribute("position", new THREE.BufferAttribute(arr, 3));', 'Attribute lengths must align with item size.'),
      api('THREE.Mesh', 'new THREE.Mesh(geometry, material)', 'Renderable object combining geometry and material.', 'geometry and material', 'mesh', 'scene.add(new THREE.Mesh(geo, mat));', 'Dispose mesh resources when removing permanently.'),
      api('THREE.Raycaster', 'new THREE.Raycaster()', 'Performs hit-testing for mouse/touch picking.', 'origin and direction from camera', 'intersections array', 'const hits = raycaster.intersectObjects(points);', 'Raycasting many objects each frame is expensive; spatial partitioning helps.'),
      api('OrbitControls', 'new OrbitControls(camera, domElement)', 'Adds camera orbit/pan/zoom controls.', 'camera and dom element', 'controls instance', 'controls.enableDamping = true;', 'Unbounded controls can create disorienting views.'),
      api('InstancedMesh', 'new THREE.InstancedMesh(geometry, material, count)', 'Renders many copies with fewer draw calls.', 'shared geometry/material and count', 'instanced mesh', 'const cloud = new THREE.InstancedMesh(geo, mat, 50000);', 'Per-instance metadata handling needs careful indexing strategy.'),
    ],
    refs: [
      ref('Three.js Docs', 'https://threejs.org/docs/'),
      ref('Three.js Examples', 'https://threejs.org/examples/'),
      ref('Three.js Journey (Reference)', 'https://threejs-journey.com/'),
      ref('WebGL Fundamentals', 'https://webglfundamentals.org/'),
    ],
  });
  skills.push(three);

  [
    'Scene Graph & Cameras',
    'Geometry & Materials',
    'Lighting',
    'Animation Loop',
    'Raycasting & Picking',
    'Performance Optimization',
  ].forEach((name) => {
    skills.push(
      mk(name, 'dataviz', three.id, {
        definition: `${name} is a practical Three.js area required for real-time 3D visualization reliability.`,
        codeExample:
          name === 'Animation Loop'
            ? "function frame() {\n  renderer.render(scene, camera);\n  requestAnimationFrame(frame);\n}\nframe();"
            : name === 'Raycasting & Picking'
              ? "raycaster.setFromCamera(pointer, camera);\nconst hits = raycaster.intersectObjects(scene.children, true);"
              : "const mesh = new THREE.Mesh(geometry, material);\nscene.add(mesh);",
        flashcards: [
          card(`What production issue is common in ${name}?`, 'Resource/performance regressions that only appear under realistic data volumes.'),
          card(`How do you verify ${name} behavior?`, 'Profile frame time, memory usage, and interaction latency under representative loads.'),
        ],
      })
    );
  });

  const svg = mk('SVG', 'dataviz', null, {
    definition:
      'SVG is a vector graphics markup format integrated into the DOM, ideal for crisp, scalable charts and UI graphics. Because SVG nodes are DOM elements, styling and event handling are straightforward with CSS/JS. SVG excels for moderate element counts and precise axis/text rendering.',
    codeExample:
      "<svg viewBox='0 0 320 120' width='320' height='120'>\n  <polyline\n    fill='none'\n    stroke='#2563eb'\n    stroke-width='3'\n    points='0,90 60,70 120,80 180,30 240,50 300,20'\n  />\n  <line x1='0' y1='100' x2='320' y2='100' stroke='#9ca3af' />\n  <text x='4' y='16' font-size='12'>Revenue trend</text>\n</svg>",
    whenUsed: 'Used in `p-stock` visualization components and charting UIs where sharp scalable graphics are required.',
    gotchas:
      'Very large node counts (thousands+) degrade interactivity and layout performance.\nText measurement/alignment differences across browsers can shift labels.\nMissing `viewBox` harms responsiveness and scaling behavior.\nPointer-event handling can be unintuitive with overlapping transparent shapes.',
    flashcards: [
      card('Why is SVG often preferred for axes/labels?', 'Text and lines stay sharp and semantically addressable at any zoom level.'),
      card('When should Canvas replace SVG?', 'When element counts and redraw frequency exceed practical DOM performance limits.'),
      card('What does `viewBox` enable?', 'Resolution-independent scaling and responsive rendering without recalculating coordinates.'),
      card('How does SVG accessibility improve chart usability?', 'Titles, descriptions, and ARIA semantics help assistive technologies interpret visuals.'),
      card('Why can hit-testing fail on visible shapes?', '`pointer-events` and fill/stroke settings control interactable regions.'),
      card('What is a common animation strategy in SVG?', 'Animate transforms/opacities rather than layout-heavy attributes for smoother updates.'),
    ],
    apis: [
      api('viewBox', '<svg viewBox="minX minY width height">', 'Defines internal coordinate system and scaling behavior.', 'four numeric values', 'responsive rendering behavior', "<svg viewBox='0 0 800 400'>...</svg>", 'Without viewBox, responsiveness is limited.'),
      api('<path d>', "path `d` commands (M/L/C/A/Z)", 'Represents complex shapes and lines compactly.', 'path command string', 'rendered vector path', "<path d='M0 10 L100 50 L200 20' />", 'Malformed commands silently render wrong shapes.'),
      api('<g transform>', "<g transform='translate(...) scale(...)'>", 'Groups elements for collective transforms/styles.', 'transform string and child nodes', 'grouped rendering', "<g transform='translate(40,20)'>...</g>", 'Transform nesting order matters.'),
      api('stroke-dasharray', 'stroke-dasharray: a b', 'Creates dashed stroke patterns for gridlines/trends.', 'dash and gap lengths', 'styled stroke', "<line stroke-dasharray='4 3' ... />", 'Small dash values can blur at low resolutions.'),
      api('pointer-events', 'pointer-events: auto | none | stroke | fill', 'Controls whether SVG shapes receive pointer interactions.', 'CSS property value', 'interaction behavior', ".overlay { pointer-events: none; }", 'Wrong value can block tooltips and drag behavior.'),
    ],
    refs: [
      ref('MDN SVG Guide', 'https://developer.mozilla.org/en-US/docs/Web/SVG'),
      ref('SVG 2 Spec', 'https://www.w3.org/TR/SVG2/'),
      ref('Sara Soueidan SVG Articles', 'https://www.sarasoueidan.com/tags/svg/'),
      ref('Smashing Magazine SVG', 'https://www.smashingmagazine.com/category/svg/'),
    ],
    relatedProjectIds: ['p-stock'],
  });
  skills.push(svg);

  [
    'Coordinate Systems & viewBox',
    'Paths & Shapes',
    'Groups & Transforms',
    'Text & Labeling',
    'Interactivity & Events',
    'Accessibility in SVG',
  ].forEach((name) => {
    skills.push(
      mk(name, 'dataviz', svg.id, {
        definition: `${name} is a foundational SVG concept for creating production-quality data visuals.`,
        codeExample:
          name === 'Paths & Shapes'
            ? "<path d='M10 80 L60 40 L110 60' stroke='#111' fill='none' />"
            : name === 'Groups & Transforms'
              ? "<g transform='translate(40,20) scale(1.2)'>...</g>"
              : "<svg viewBox='0 0 200 120'>...</svg>",
        flashcards: [
          card(`What subtle bug appears in ${name}?`, 'Coordinate/transform assumptions breaking after responsive resize or zoom changes.'),
          card(`How do you keep ${name} maintainable?`, 'Use consistent coordinate conventions and isolate reusable primitives.'),
        ],
      })
    );
  });

  // Added by Claude Code audit — 2026-05-20

  // D3.js — additional top-level flashcards
  d3.flashcards.push(
    card('What does d3.extent() return and why is it useful?', 'It returns [min, max] of an array in one pass — the standard input for scale .domain() calls, avoiding separate d3.min/d3.max calls.'),
    card('What is the difference between d3.scaleLinear and d3.scaleLog?', 'scaleLinear maps linearly between domain and range; scaleLog uses a logarithmic mapping — use scaleLog when data spans multiple orders of magnitude to avoid extreme visual compression.'),
    card('How do you make a D3 chart responsive to container resize?', 'Use a ResizeObserver on the container element and re-derive width/height from its contentRect on each callback, then redraw the chart with updated scales and dimensions.'),
    card('What is d3.format() used for?', 'It creates number formatting functions for tick labels — e.g., d3.format(".1f") rounds to one decimal, d3.format("$,.0f") formats as currency.'),
    card('How does d3.drag() differ from d3.zoom()?', 'drag() handles individual element repositioning with start/drag/end events; zoom() applies pan/zoom transforms to the entire selection or a group.'),
  );

  // D3.js — additional APIs
  d3.apis.push(
    api('d3.extent', 'd3.extent(iterable, accessor?)', 'Returns [min, max] of an array in a single pass.', 'array and optional value accessor', '[min, max] tuple', "const [lo, hi] = d3.extent(data, (d) => d.value);", 'Returns [undefined, undefined] on empty array — guard before passing to scale domain.'),
    api('d3.scaleTime', 'd3.scaleTime().domain([date1, date2]).range([a, b])', 'Maps Date domain to continuous numeric range with time-aware ticks.', 'Date array domain and numeric range', 'time scale function', "const x = d3.scaleTime().domain([new Date('2024-01'), new Date('2025-01')]).range([0, width]);", 'Parse date strings before setting domain — raw strings produce invalid scales.'),
    api('d3.scaleOrdinal', 'd3.scaleOrdinal().domain(keys).range(colors)', 'Maps categorical keys to discrete values (colours, shapes).', 'key array and value array', 'ordinal scale function', "const color = d3.scaleOrdinal().domain(['A','B','C']).range(d3.schemeTableau10);", 'Unknown domain values cycle through range; use .unknown() to set explicit fallback.'),
    api('d3.stack', 'd3.stack().keys(keys)(data)', 'Computes baseline/ceiling values for stacked bar or area charts.', 'key array and data rows', 'stacked series array', "const series = d3.stack().keys(['a','b','c'])(data);", 'Negative values require d3.stackOffsetDiverging to maintain axis baseline.'),
    api('d3.arc / d3.pie', 'd3.pie()(data) → arc data; d3.arc().innerRadius(r).outerRadius(R)', 'Computes angular pie slices and SVG arc path strings.', 'pie: value array; arc: inner/outer radius', 'arc path generator + layout', "const pie = d3.pie().value((d) => d.count);\nconst arc = d3.arc().innerRadius(0).outerRadius(80);\nsvg.selectAll('path').data(pie(data)).join('path').attr('d', arc);", 'Sort order affects slice sequence — use pie.sort(null) to preserve input order.'),
    api('d3.forceSimulation', 'd3.forceSimulation(nodes).force(name, force)', 'Runs physics-based force layout for network graphs.', 'node array and named force configs', 'simulation instance', "const sim = d3.forceSimulation(nodes)\n  .force('link', d3.forceLink(links).id((d) => d.id))\n  .force('charge', d3.forceManyBody().strength(-60))\n  .force('center', d3.forceCenter(w / 2, h / 2));", 'alpha decays over time — call simulation.restart() to re-energise after data changes.'),
  );

  // D3.js sub-topics — specific flashcards
  skills.forEach((s) => {
    if (s.parentId !== d3.id) return;
    const specific = {
      'Selections & Data Join': [
        card('What is the key function in selection.data(data, keyFn) used for?', 'It maps each datum to an identity string so D3 can match existing DOM elements to new data by key rather than index — critical for stable transitions during reorder.'),
        card('What is the enter selection?', 'Elements in the new data array that have no corresponding DOM element yet — .join() or .enter().append() creates DOM nodes for these incoming data points.'),
      ],
      'Scales & Axes': [
        card('Why do you invert the y-scale range in SVG charts?', 'SVG y-coordinates increase downward (0 at top); inverting the range (range([height, 0])) maps larger data values to smaller y-coordinates so bars grow upward.'),
        card('What does scale.nice() do?', 'It extends the domain to round human-friendly values — e.g., [0, 97] becomes [0, 100] — making axis tick labels cleaner without manual domain adjustment.'),
      ],
      'Shapes (line/area/arc)': [
        card('What does the defined() accessor do on a line generator?', 'It lets you skip null/NaN data points — returning false for a point breaks the path at that gap instead of drawing a line to zero.'),
        card('What is the difference between d3.line() and d3.area()?', 'd3.line() draws a stroked path through points; d3.area() fills the region between a baseline (y0) and the value line (y1) — used for filled area charts.'),
      ],
      'Transitions & Animations': [
        card('What does selection.interrupt() do?', 'It cancels any in-progress transition on the selection immediately, preventing conflicts when a new data update triggers a new transition before the old one completes.'),
        card('What is transition.attrTween() used for?', 'Custom per-element interpolation when the default attribute interpolator is insufficient — e.g., interpolating along an arc path or applying custom easing to complex attributes.'),
      ],
      'Interactions (zoom/brush/drag)': [
        card('How do you rescale axes after a zoom event?', "In the zoom handler, use event.transform.rescaleX(xScale) to get a transformed copy of the scale, then redraw the axis with g.call(axisBottom(rescaled))."),
        card('What is d3.brush() used for?', 'It lets users select a rectangular region on a chart, emitting start/brush/end events with the selected pixel extent — used for cross-filtering and range selection.'),
      ],
      'Layouts (hierarchy/stack/force)': [
        card('What does d3.hierarchy() require as input?', 'A nested JS object with a children array property — it converts the tree into a hierarchy node with parent/depth/height properties for use with treemap, tree, or pack layouts.'),
        card('What is d3.treemap() used for?', 'It partitions a hierarchy into rectangles proportional to each leaf value — used for disk-space or portfolio allocation visualisations.'),
      ],
      'React Integration Patterns': [
        card('What is the "React for DOM, D3 for math" pattern?', 'React renders SVG elements from data state; D3 is only used for scale/axis/path calculations — no D3 DOM mutations, avoiding conflicts with React reconciliation.'),
        card('When is the "D3 owns a ref" pattern preferable?', 'For complex animated charts where D3 transitions and selections provide irreplaceable value — isolate a single SVG ref, let D3 own it fully, and keep React state to data only.'),
      ],
    };
    const cards = specific[s.name];
    if (cards) s.flashcards.push(...cards);
  });

  // SVG — additional top-level flashcards (currently 6, need 8+)
  svg.flashcards.push(
    card('What is the SVG coordinate system origin and how does transform affect it?', 'Origin is top-left (0,0); x increases rightward, y increases downward. translate(x,y) shifts the local origin — nested transforms compound.'),
    card('What does `currentColor` do in SVG?', 'It inherits the CSS color property value for fill or stroke — enabling SVG icons to adapt to text colour without inline style overrides.'),
    card('What is an SVG sprite and what problem does it solve?', 'A single SVG file with multiple <symbol> elements referenced via <use href="#icon-id"> — reduces HTTP requests and enables icon reuse across a page.'),
  );

  // SVG — additional APIs
  svg.apis.push(
    api('<circle> / <rect> / <line>', '<circle cx cy r /> / <rect x y width height rx /> / <line x1 y1 x2 y2 />', 'Basic SVG shape primitives for points, rectangles, and lines.', 'positional and dimensional attributes', 'rendered shape', "<circle cx='50' cy='50' r='40' fill='#2563eb' />\n<rect x='10' y='10' width='80' height='40' rx='4' />", 'All coordinates are in the current user coordinate system — affected by parent transforms.'),
    api('<text> / <tspan>', '<text x y font-size text-anchor>content</text>', 'Renders text in SVG with positional and typographic attributes.', 'x/y position, text-anchor (start/middle/end)', 'text element', "<text x='160' y='20' text-anchor='middle' font-size='14'>Label</text>", 'SVG text does not wrap automatically — use <tspan> or foreignObject for multi-line text.'),
    api('<defs> / <use> / <symbol>', '<defs><symbol id="icon">...</symbol></defs> + <use href="#icon" />', 'Defines reusable fragments and instantiates them anywhere in the document.', 'symbol id and use href', 'cloned element instance', "<defs><symbol id='arrow' viewBox='0 0 10 10'><path d='M0 5 L10 5' /></symbol></defs>\n<use href='#arrow' x='50' y='50' />", '<symbol> creates its own viewport — set viewBox for correct scaling.'),
    api('<clipPath>', '<clipPath id="clip"><rect .../></clipPath> + clip-path="url(#clip)"', 'Masks elements to only render within the clip region.', 'clip shape and target clip-path attribute', 'clipped rendering', "<clipPath id='chartClip'><rect width='400' height='300' /></clipPath>\n<g clip-path='url(#chartClip)'>...</g>", 'Apply clip paths to groups to constrain all children in one declaration.'),
    api('<linearGradient> / <radialGradient>', '<linearGradient id><stop offset color /></linearGradient>', 'Defines gradient fills referenced by fill or stroke attributes.', 'gradient id, stop offsets and colors', 'gradient paint server', "<defs>\n  <linearGradient id='grad' x1='0' x2='0' y1='0' y2='1'>\n    <stop offset='0%' stop-color='#2563eb' />\n    <stop offset='100%' stop-color='#7c3aed' />\n  </linearGradient>\n</defs>\n<rect fill='url(#grad)' width='200' height='100' />", 'Default gradientUnits is objectBoundingBox — percentages relate to the bounding box of the target element.'),
    api('<marker>', '<marker id orient refX refY><path /></marker> + marker-end="url(#m)"', 'Attaches arrowheads or custom symbols to line endpoints.', 'marker id, size, orientation, and shape', 'decorated line endpoint', "<defs>\n  <marker id='arrow' markerWidth='10' markerHeight='7' refX='9' refY='3.5' orient='auto'>\n    <polygon points='0 0, 10 3.5, 0 7' fill='#111' />\n  </marker>\n</defs>\n<line x1='0' y1='50' x2='200' y2='50' stroke='#111' marker-end='url(#arrow)' />", 'refX/refY control which point of the marker aligns to the line endpoint.'),
    api('CSS animation on SVG', '.el { animation: dash 2s linear infinite; } + stroke-dashoffset', 'Animates SVG stroke drawing effect using stroke-dasharray/dashoffset.', 'stroke-dasharray length and animated dashoffset', 'animated stroke', ".line {\n  stroke-dasharray: 200;\n  stroke-dashoffset: 200;\n  animation: draw 1s ease forwards;\n}\n@keyframes draw { to { stroke-dashoffset: 0; } }", 'stroke-dasharray must equal the path total length — use path.getTotalLength() to measure.'),
  );

  // SVG — additional sub-topics (currently 6; adding 2 to reach 8, within zero-to-hero 6–10 target)
  const svgFilters = mk('Filters & Effects', 'dataviz', svg.id, {
    definition: 'SVG filters apply pixel-level effects like blur, drop shadow, and colour manipulation using a composable filter primitive graph defined in <filter> elements.',
    codeExample: "<defs>\n  <filter id='shadow' x='-20%' y='-20%' width='140%' height='140%'>\n    <feDropShadow dx='2' dy='2' stdDeviation='3' flood-color='rgba(0,0,0,0.3)' />\n  </filter>\n</defs>\n<rect filter='url(#shadow)' x='20' y='20' width='160' height='80' rx='8' fill='white' />",
    flashcards: [
      card('What does feGaussianBlur do in an SVG filter chain?', 'It applies a Gaussian blur to the input — useful for glow effects, soft shadows, and depth-of-field treatments in SVG illustrations.'),
      card('Why should SVG filters be used sparingly on animated elements?', 'Filter primitives are re-evaluated on every frame during animation — complex filter graphs are expensive to composite and can drop frame rate significantly.'),
      card('What is the x/y/width/height on a <filter> element?', 'They define the filter region as a fraction of the target bounding box (default: slightly larger than the element). Too small clips shadow/blur overflow.'),
    ],
  });

  const svgAnimation = mk('SVG Animation', 'dataviz', svg.id, {
    definition: 'SVG elements can be animated via CSS transitions/keyframes, the Web Animations API, or D3 transitions. Each has different performance characteristics and integration points with JS.',
    codeExample: "/* CSS keyframe approach */\n.bar {\n  transform-origin: bottom;\n  animation: growUp 0.4s ease-out both;\n}\n@keyframes growUp {\n  from { transform: scaleY(0); }\n  to   { transform: scaleY(1); }\n}\n\n/* Web Animations API */\nel.animate(\n  [{ strokeDashoffset: length }, { strokeDashoffset: 0 }],\n  { duration: 800, easing: 'ease-out', fill: 'forwards' }\n);",
    flashcards: [
      card('Why are CSS transform animations on SVG elements sometimes inconsistent cross-browser?', "SVG elements have their own coordinate system — transform-origin: 50% 50% behaves differently on SVG vs HTML elements. Use transform-box: fill-box to normalise it."),
      card('What is the WAAPI (Web Animations API) advantage over CSS animations?', 'WAAPI is JS-controllable — you can pause, seek, reverse, and respond to finish events programmatically, making it easier to synchronise with data updates.'),
      card('When should you use requestAnimationFrame directly instead of CSS/WAAPI?', 'When animation logic depends on computed data values that change each frame (e.g., physics simulations, live streaming charts) where declarative CSS cannot express the interpolation.'),
    ],
  });
  skills.push(svgFilters, svgAnimation);

  // SVG sub-topics — specific flashcards for existing forEach sub-topics
  skills.forEach((s) => {
    if (s.parentId !== svg.id) return;
    if (s === svgFilters || s === svgAnimation) return; // skip newly added ones
    const specific = {
      'Coordinate Systems & viewBox': [
        card('What are the four values in viewBox and what do they mean?', 'viewBox="minX minY width height" — minX/minY set the origin offset, width/height define the internal coordinate space size. The element scales to fit.'),
        card('What is the difference between preserveAspectRatio="xMidYMid meet" and "none"?', '"meet" maintains aspect ratio and fits the viewBox inside the element (letterboxing); "none" stretches to fill exactly, distorting the graphic.'),
      ],
      'Paths & Shapes': [
        card('What is the difference between absolute and relative path commands?', 'Uppercase commands (M, L, C) use absolute coordinates; lowercase (m, l, c) are relative to the current point — mixing both is common in generated paths.'),
        card('What does the Z command do in an SVG path?', 'Z closes the path by drawing a straight line back to the starting point — required for filled closed shapes; without it, the fill may render oddly at the junction.'),
      ],
      'Groups & Transforms': [
        card('Why is grouping elements in <g> before transforming preferable to transforming each individually?', 'A single transform on a <g> applies to all children, reducing attribute repetition and making coordinated movement/scaling simpler to maintain.'),
        card('What is the order of transform operations and why does it matter?', 'Transforms apply right-to-left: rotate then translate ≠ translate then rotate. The order determines the final position because each operation modifies the coordinate frame.'),
      ],
      'Text & Labeling': [
        card('How do you centre SVG text horizontally and vertically?', 'Set text-anchor="middle" for horizontal centering and dominant-baseline="central" for vertical centering relative to the text position point.'),
        card('Why is measuring SVG text width difficult?', 'SVG text layout is font-dependent and browser-specific — use getBBox() or getComputedTextLength() at runtime rather than estimating character width.'),
      ],
      'Interactivity & Events': [
        card('How do you attach a tooltip to an SVG element?', 'Listen for mouseenter/mouseleave (or pointerenter/pointerleave) on the element; position an HTML div tooltip using clientX/clientY from the event — HTML tooltips are easier to style than SVG foreignObject.'),
        card('Why use pointer-events: none on overlay elements?', 'Transparent overlay layers (for hit-testing) should not capture events meant for underlying elements — setting pointer-events: none passes events through to the correct target.'),
      ],
      'Accessibility in SVG': [
        card('How do you make an SVG chart accessible to screen readers?', 'Add role="img" to the <svg>, a <title> for the accessible name, and a <desc> for description; for data charts, also provide an accessible table or list of the data values.'),
        card('What does aria-hidden="true" on an SVG do?', 'It hides the element from the accessibility tree entirely — use on decorative SVGs (icons, dividers) that add no informational value beyond visual context.'),
      ],
    };
    const cards = specific[s.name];
    if (cards) s.flashcards.push(...cards);
  });

  return skills;
}
