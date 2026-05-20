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

  return skills;
}
