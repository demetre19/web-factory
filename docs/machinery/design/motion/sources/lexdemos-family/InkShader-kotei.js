import{t as e}from"./gsap.CvDoa17S.js";import{t}from"./ScrollTrigger.C7HwZxAz.js";var n={ground:`--color-background`,ink:`--color-acid`,deep:`oklch(0.68 0.02 262)`},r=`
  attribute vec2 position;
  void main() {
    gl_Position = vec4(position, 0.0, 1.0);
  }
`,i=`
  precision highp float;
  uniform vec2 resolution;
  uniform float time;
  uniform vec3 ground;
  uniform vec3 ink;
  uniform vec3 deep;
  uniform vec3 pointer;
  uniform float flip;
  uniform float reveal;

  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
  }

  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(
      mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
      mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x),
      u.y
    );
  }

  float fbm(vec2 p) {
    float value = 0.0;
    float amplitude = 0.5;
    for (int i = 0; i < 5; i++) {
      value += amplitude * noise(p);
      p = p * 2.0 + vec2(17.0, 9.0);
      amplitude *= 0.5;
    }
    return value;
  }

  void main() {
    vec2 uv = gl_FragCoord.xy / resolution;
    float depth = mix(1.0 - uv.y, uv.y, flip);
    float x = uv.x * resolution.x / resolution.y;

    vec2 offset = vec2(x, depth) - pointer.xy;
    float pull = exp(-dot(offset, offset) * 18.0) * pointer.z;
    vec2 swirl = vec2(-offset.y, offset.x) * pull * 1.4;

    vec2 flow = vec2(x * 1.3, depth * 1.1 - time * 0.04) + swirl;
    vec2 first = vec2(fbm(flow + vec2(0.0, time * 0.03)), fbm(flow + vec2(5.2, 1.3) - time * 0.02));
    vec2 second = vec2(fbm(flow + first * 2.2 + vec2(1.7, 9.2)), fbm(flow + first * 2.2 + vec2(8.3, 2.8)));
    float body = fbm(flow + second * 1.8);

    float edge = 0.42 + 0.2 * fbm(vec2(x * 1.1, time * 0.04) + first);
    float mask = 1.0 - smoothstep(edge - 0.35, edge + 0.1, depth);
    float value = body * mask * 1.4 * reveal;

    float shade = mix(0.92, 1.04, fbm(flow * 2.0 + second));
    float rim = smoothstep(0.12, 0.42, value);
    float core = smoothstep(0.48, 0.82, value);
    vec3 color = mix(ground, ink * shade, rim);
    color = mix(color, deep * shade, core);
    color += (hash(gl_FragCoord.xy + fract(time)) - 0.5) * 0.02 * rim;

    gl_FragColor = vec4(color, 1.0);
  }
`,a=(e,t)=>{let n=e.getContext(`webgl`,{antialias:!1,premultipliedAlpha:!1});if(!n)return null;let a=(e,t)=>{let r=n.createShader(e);return n.shaderSource(r,t),n.compileShader(r),r},o=n.createProgram();if(n.attachShader(o,a(n.VERTEX_SHADER,r)),n.attachShader(o,a(n.FRAGMENT_SHADER,i)),n.linkProgram(o),!n.getProgramParameter(o,n.LINK_STATUS))return null;n.useProgram(o);let s=n.createBuffer();n.bindBuffer(n.ARRAY_BUFFER,s),n.bufferData(n.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,1,1]),n.STATIC_DRAW);let c=n.getAttribLocation(o,`position`);n.enableVertexAttribArray(c),n.vertexAttribPointer(c,2,n.FLOAT,!1,0,0);let l=e=>n.getUniformLocation(o,e);n.uniform3fv(l(`ground`),t.ground),n.uniform3fv(l(`ink`),t.ink),n.uniform3fv(l(`deep`),t.deep),n.uniform1f(l(`flip`),+!!t.flip);let u=l(`resolution`),d=l(`time`),f=l(`reveal`),p=l(`pointer`),m={x:0,y:0,strength:0},h={x:0,y:0,strength:0},g=-1,_=e=>{if(t.still)n.uniform1f(f,1),n.uniform1f(d,12);else{g<0&&(g=e);let t=Math.min(1,(e-g)/1600);n.uniform1f(f,1-(1-t)**2),n.uniform1f(d,e/1e3)}n.drawArrays(n.TRIANGLE_STRIP,0,4)},v=(t,r)=>{e.width=t,e.height=r,n.viewport(0,0,t,r),n.uniform2f(u,t,r)},y=0,b=e=>{y=requestAnimationFrame(b),h.x+=(m.x-h.x)*.08,h.y+=(m.y-h.y)*.08,h.strength+=(m.strength-h.strength)*.05,n.uniform3f(p,h.x,h.y,h.strength),_(e)};return v(t.width,t.height),t.still&&_(0),e=>{e.type===`resize`?(v(e.width,e.height),_(performance.now())):e.type===`pointer`?(m.x=e.x,m.y=e.y,m.strength=+!!e.inside):t.still||(cancelAnimationFrame(y),e.on&&(y=requestAnimationFrame(b)))}};e.registerPlugin(t);var{ground:o,ink:s,deep:c}=n,l=e=>getComputedStyle(document.documentElement).getPropertyValue(e).trim(),u=e=>{let t=document.createElement(`canvas`).getContext(`2d`);if(!t)return[1,1,1];t.fillStyle=e,t.fillRect(0,0,1,1);let[n,r,i]=t.getImageData(0,0,1,1).data;return[n/255,r/255,i/255]},d=window.matchMedia(`(prefers-reduced-motion: reduce)`).matches,f=()=>document.querySelectorAll(`[data-ink-shader]`).forEach(t=>{let n=t.dataset.from===`bottom`,r=()=>{let e=Math.min(window.devicePixelRatio,1.5);return{width:Math.round(t.clientWidth*e),height:Math.round(t.clientHeight*e)}},i={ground:u(l(o)),ink:u(l(s)),deep:u(c),flip:n,still:d,...r()},f;if(`transferControlToOffscreen`in t){let e=t.transferControlToOffscreen(),n=new Worker(new URL(`/_astro/ink-worker-COBxfqyP.js`,``+import.meta.url),{type:`module`});n.postMessage({type:`init`,canvas:e,...i},[e]),f=e=>n.postMessage(e)}else{let e=a(t,i);if(!e)return;f=e}if(window.addEventListener(`resize`,()=>f({type:`resize`,...r()})),d)return;n?e.from(t,{yPercent:30,ease:`none`,scrollTrigger:{trigger:t.parentElement,start:`top bottom`,end:`bottom bottom`,scrub:!0}}):e.to(t,{yPercent:35,opacity:.5,ease:`none`,scrollTrigger:{trigger:document.body,start:`top top`,end:()=>`+=${t.offsetHeight}`,scrub:!0}});let p={type:`pointer`,x:0,y:0,inside:!1};window.addEventListener(`pointermove`,e=>{let r=t.getBoundingClientRect();p.x=(e.clientX-r.left)/r.height,p.y=(n?r.bottom-e.clientY:e.clientY-r.top)/r.height,p.inside=e.clientY>=r.top&&e.clientY<=r.bottom,f(p)}),document.documentElement.addEventListener(`pointerleave`,()=>{p.inside=!1,f(p)}),new IntersectionObserver(([e])=>f({type:`run`,on:e.isIntersecting})).observe(t)});document.readyState===`complete`?f():window.addEventListener(`load`,f,{once:!0});