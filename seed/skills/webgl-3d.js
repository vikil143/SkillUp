// seed/skills/webgl-3d.js — Three.js, WebGL fundamentals, GLSL
import { mk, uid } from '../helpers.js';

export default function buildWebGLSkills() {
  const threejs = mk('Three.js', 'webgl', null, {
    definition: 'JavaScript 3D library wrapping WebGL. Provides a scene graph (Scene, Mesh, Camera, Light) so you can render 3D without raw WebGL boilerplate.',
    whenUsed: 'Portfolio 3D effects, product configurators, interactive data viz, immersive UIs.',
    gotchas: 'Always dispose() geometries, materials, and textures when removing objects — Three.js does not GC GPU memory automatically.',
    refs: [
      { id: uid(), title: 'Three.js Official Docs', url: 'https://threejs.org/docs/' },
      { id: uid(), title: 'Three.js Examples Gallery', url: 'https://threejs.org/examples/' },
      { id: uid(), title: 'Three.js in 100 Seconds – Fireship', url: 'https://www.youtube.com/watch?v=Q7AOvWpIVHU' },
      { id: uid(), title: 'Three.js Journey – Bruno Simon (trailer)', url: 'https://www.youtube.com/watch?v=y4ctEhB5F3s' },
    ],
    flashcards: [
      { id: uid(), q: 'Three.js rendering pipeline?', a: 'Scene + Camera → WebGLRenderer.render(scene, camera) → draws to <canvas>. Run every frame in a loop.' },
      { id: uid(), q: 'What is a Mesh?', a: 'Mesh = Geometry (shape/vertices) + Material (appearance). The fundamental renderable object in Three.js.' },
      { id: uid(), q: 'How to start the render loop?', a: 'renderer.setAnimationLoop(() => renderer.render(scene, camera)) — or requestAnimationFrame recursion.' },
      { id: uid(), q: 'Three.js memory leak — how to avoid?', a: 'Call geometry.dispose(), material.dispose(), texture.dispose() when removing objects. Three.js does not free GPU memory automatically.' },
    ],
    apis: [
      {
        id: uid(),
        name: 'WebGLRenderer',
        signature: 'new THREE.WebGLRenderer(params?: { canvas?, antialias?, alpha? })',
        description: 'Main renderer that draws the Three.js scene to a WebGL canvas.',
        params: 'antialias — smooth edges (slight perf cost). alpha — transparent background.',
        returns: 'Renderer with .render(scene, camera), .setSize(w, h), .setPixelRatio(r), .setAnimationLoop(fn).',
        example: "const renderer = new THREE.WebGLRenderer({ antialias: true });\nrenderer.setSize(innerWidth, innerHeight);\nrenderer.setPixelRatio(devicePixelRatio);\ndocument.body.appendChild(renderer.domElement);",
        gotchas: 'setPixelRatio(devicePixelRatio) is required for crisp rendering on HiDPI/Retina screens.',
      },
      {
        id: uid(),
        name: 'PerspectiveCamera',
        signature: 'new THREE.PerspectiveCamera(fov, aspect, near, far)',
        description: 'Mimics natural human vision — objects further away appear smaller.',
        params: 'fov — vertical field of view in degrees. aspect — width÷height. near/far — clipping planes.',
        returns: 'Camera object. Set .position and call .lookAt(target) to aim.',
        example: 'const cam = new THREE.PerspectiveCamera(75, innerWidth / innerHeight, 0.1, 1000);\ncam.position.set(0, 2, 5);\ncam.lookAt(0, 0, 0);',
        gotchas: 'On resize: update camera.aspect and call camera.updateProjectionMatrix() or the scene will distort.',
      },
      {
        id: uid(),
        name: 'Scene',
        signature: 'new THREE.Scene()',
        description: 'Root container for all objects, lights, and helpers in a Three.js world.',
        params: 'None at construction. Add children with .add(object).',
        returns: 'Scene extending Object3D. Supports .background (Color/Texture), .fog.',
        example: 'const scene = new THREE.Scene();\nscene.background = new THREE.Color(0x1a1a2e);\nscene.fog = new THREE.FogExp2(0x1a1a2e, 0.05);\nscene.add(mesh, light);',
        gotchas: 'scene.add() accepts multiple objects at once. Call scene.remove(obj) then dispose() to fully clean up.',
      },
    ],
  });

  const threeScene = mk('Scene Setup', 'webgl', threejs.id, {
    definition: 'Three.js bootstrap: WebGLRenderer (canvas), Scene (container), PerspectiveCamera (viewpoint). Append domElement, handle resize, run the loop.',
    codeExample: "const scene = new THREE.Scene();\nconst camera = new THREE.PerspectiveCamera(75, innerWidth / innerHeight, 0.1, 1000);\ncamera.position.z = 5;\nconst renderer = new THREE.WebGLRenderer({ antialias: true });\nrenderer.setSize(innerWidth, innerHeight);\nrenderer.setPixelRatio(devicePixelRatio);\ndocument.body.appendChild(renderer.domElement);\n\nwindow.addEventListener('resize', () => {\n  camera.aspect = innerWidth / innerHeight;\n  camera.updateProjectionMatrix();\n  renderer.setSize(innerWidth, innerHeight);\n});\n\nrenderer.setAnimationLoop(() => renderer.render(scene, camera));",
    flashcards: [
      { id: uid(), q: 'PerspectiveCamera(fov, aspect, near, far)?', a: 'fov = vertical angle in degrees. aspect = width÷height. near/far = clipping planes — objects outside are culled.' },
      { id: uid(), q: 'Why setPixelRatio(devicePixelRatio)?', a: 'Renders at the native display resolution. Skipping it causes a blurry canvas on HiDPI/Retina screens.' },
      { id: uid(), q: 'What breaks on window resize?', a: 'Camera aspect + renderer size go stale. Fix: camera.aspect = w/h → camera.updateProjectionMatrix() → renderer.setSize(w, h).' },
      { id: uid(), q: 'OrbitControls — what do they give you?', a: 'Mouse/touch drag to rotate, scroll to zoom, right-click to pan — without writing camera math. Import from three/addons.' },
    ],
  });

  const threeGeo = mk('Geometries & Materials', 'webgl', threejs.id, {
    definition: 'Geometry stores vertex data (positions, normals, UVs). Material defines appearance. Combined in a Mesh. Primitives: BoxGeometry, SphereGeometry, PlaneGeometry, TorusGeometry. PBR material: MeshStandardMaterial.',
    codeExample: "const geo = new THREE.BoxGeometry(1, 1, 1);\nconst mat = new THREE.MeshStandardMaterial({\n  color: 0x6688cc,\n  metalness: 0.3,\n  roughness: 0.7,\n});\nconst cube = new THREE.Mesh(geo, mat);\nscene.add(cube);\n\n// Texture\nconst tex = new THREE.TextureLoader().load('map.jpg');\nmat.map = tex;",
    flashcards: [
      { id: uid(), q: 'MeshBasicMaterial vs MeshStandardMaterial?', a: 'Basic = flat colour, ignores lights entirely. Standard = PBR with metalness/roughness, responds correctly to scene lights.' },
      { id: uid(), q: 'Can you share one material across many meshes?', a: 'Yes — one instance, many meshes. Changes to material affect all. Assign different .color via mesh.material.color.set() per mesh if needed.' },
      { id: uid(), q: 'When to call geometry.dispose()?', a: 'Whenever you permanently remove a mesh. Frees the GPU vertex buffer. Also call material.dispose() and texture.dispose().' },
      { id: uid(), q: 'What are UVs?', a: '2D texture coordinates per vertex (0–1 range). U = horizontal, V = vertical. Three.js built-in geometries generate UVs automatically.' },
    ],
  });

  const threeLights = mk('Lights & Shadows', 'webgl', threejs.id, {
    definition: 'Light types: AmbientLight (flat fill, no shadows), DirectionalLight (parallel sun rays), PointLight (omnidirectional bulb), SpotLight (cone beam). Shadows require renderer.shadowMap.enabled = true plus castShadow/receiveShadow on objects.',
    codeExample: "renderer.shadowMap.enabled = true;\nrenderer.shadowMap.type = THREE.PCFSoftShadowMap;\n\nconst ambient = new THREE.AmbientLight(0xffffff, 0.3);\nconst sun = new THREE.DirectionalLight(0xffffff, 1);\nsun.position.set(5, 10, 5);\nsun.castShadow = true;\nscene.add(ambient, sun);\n\nmesh.castShadow = true;\nfloor.receiveShadow = true;",
    flashcards: [
      { id: uid(), q: 'Shadow not showing — 3 common causes?', a: '1) renderer.shadowMap.enabled not set to true. 2) castShadow/receiveShadow missing on mesh/light. 3) Using AmbientLight (cannot cast shadows).' },
      { id: uid(), q: 'AmbientLight vs HemisphereLight?', a: 'Ambient: single uniform colour everywhere. Hemisphere: blends sky colour (top) and ground colour (bottom) for a natural outdoor look.' },
      { id: uid(), q: 'PCFSoftShadowMap vs BasicShadowMap?', a: 'PCFSoft = smooth blurred shadow edges. Basic = hard pixelated edges, cheapest. Default is PCF (medium).' },
      { id: uid(), q: 'Why do shadows have artifacts (shadow acne)?', a: 'Self-shadowing from floating-point precision. Fix: increase light.shadow.bias (e.g. -0.001) to push shadow back slightly.' },
    ],
  });

  const threeAnim = mk('Animations', 'webgl', threejs.id, {
    definition: 'Three.js render loop via setAnimationLoop or rAF. Mutate .rotation/.position/.scale each frame. GSAP integrates cleanly — tween any Three.js object property with spring/ease. Use lerp() for smooth damping.',
    codeExample: "// Three.js built-in loop\nrenderer.setAnimationLoop((time) => {\n  cube.rotation.x = time * 0.001;\n  cube.rotation.y = time * 0.002;\n  renderer.render(scene, camera);\n});\n\n// GSAP tween\nimport gsap from 'gsap';\ngsap.to(cube.rotation, {\n  y: Math.PI * 2,\n  duration: 2,\n  repeat: -1,\n  ease: 'power2.inOut',\n});\n\n// Lerp for smooth camera follow (run every frame)\ncamera.position.lerp(targetPosition, 0.05);",
    flashcards: [
      { id: uid(), q: 'setAnimationLoop vs requestAnimationFrame?', a: 'setAnimationLoop is Three.js wrapper — handles WebXR/VR. rAF is the raw browser API. Both work; prefer setAnimationLoop in Three.js projects.' },
      { id: uid(), q: 'How does GSAP tween Three.js objects?', a: 'GSAP tweens any plain JS object property. Pass mesh.position, mesh.rotation, or material directly: gsap.to(mesh.rotation, { y: Math.PI, duration: 1 }).' },
      { id: uid(), q: 'How to stop the animation loop?', a: 'renderer.setAnimationLoop(null). For rAF: store the ID with const id = requestAnimationFrame(loop), cancel with cancelAnimationFrame(id).' },
      { id: uid(), q: 'What is lerp and why use it in animations?', a: 'Linear interpolation: a + (b - a) * t. Running vec.lerp(target, 0.05) every frame creates smooth exponential damping without springs or physics.' },
      { id: uid(), q: 'Clock.getDelta() vs getElapsedTime()?', a: 'getDelta() = seconds since last call — use for frame-rate-independent movement. getElapsedTime() = total seconds since clock start — use for sine/cos waves.' },
    ],
  });

  const glslShaders = mk('GLSL & ShaderMaterial', 'webgl', threejs.id, {
    definition: 'GLSL: C-like language compiled on the GPU. Vertex shader transforms positions; fragment shader colours pixels. Three.js ShaderMaterial exposes custom shaders with uniforms (dynamic data) and varyings (vertex→fragment interpolation).',
    codeExample: "const mat = new THREE.ShaderMaterial({\n  uniforms: {\n    uTime: { value: 0 },\n    uColor: { value: new THREE.Color(0xff6600) },\n  },\n  vertexShader: `\n    varying vec2 vUv;\n    void main() {\n      vUv = uv;\n      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);\n    }`,\n  fragmentShader: `\n    uniform float uTime;\n    varying vec2 vUv;\n    void main() {\n      gl_FragColor = vec4(vUv, sin(uTime) * 0.5 + 0.5, 1.0);\n    }`,\n});\n\n// Update each frame\nrenderer.setAnimationLoop((t) => {\n  mat.uniforms.uTime.value = t * 0.001;\n  renderer.render(scene, camera);\n});",
    flashcards: [
      { id: uid(), q: 'uniform vs varying in GLSL?', a: 'Uniform: same value for every vertex/fragment in a draw (time, resolution). Varying: written in vertex shader, interpolated across triangle, read in fragment shader.' },
      { id: uid(), q: 'How to animate a shader with time?', a: 'Declare uniform float uTime. Each frame: mat.uniforms.uTime.value = clock.getElapsedTime(). Use in GLSL: sin(uTime), cos(uTime * 2.0).' },
      { id: uid(), q: 'ShaderMaterial vs RawShaderMaterial?', a: 'ShaderMaterial auto-injects Three.js built-ins (projectionMatrix, modelViewMatrix, position, uv, normal). RawShaderMaterial is a blank slate — write everything yourself.' },
      { id: uid(), q: 'What is gl_Position?', a: 'Required vertex shader output — the clip-space position of the vertex. Formula: projectionMatrix * modelViewMatrix * vec4(position, 1.0).' },
    ],
  });

  const webglFund = mk('WebGL Fundamentals', 'webgl', null, {
    definition: 'Low-level browser GPU API (OpenGL ES 2.0 wrapper). Every draw call requires vertex shader (positions) and fragment shader (pixel colours) in GLSL, plus buffer binding and attribute setup.',
    flashcards: [
      { id: uid(), q: 'Two required shaders in every WebGL draw call?', a: 'Vertex shader — runs per vertex, outputs gl_Position. Fragment shader — runs per fragment/pixel, outputs gl_FragColor.' },
      { id: uid(), q: 'Why use Three.js over raw WebGL?', a: 'Three.js abstracts 100s of lines of boilerplate (buffer creation, shader compilation, attribute binding). Raw WebGL needed only for custom render pipelines.' },
      { id: uid(), q: 'What is a VBO?', a: 'Vertex Buffer Object — GPU-side array holding vertex data (positions, normals, UVs). Upload once with gl.bufferData; reused every frame.' },
      { id: uid(), q: 'uniform vs attribute in WebGL?', a: 'Attribute: per-vertex data (position, UV, normal). Uniform: constant for all vertices in a draw call (transform matrix, colour, time).' },
    ],
  });

  return [threejs, threeScene, threeGeo, threeLights, threeAnim, glslShaders, webglFund];
}
