var e=document.createElement(`canvas`).getContext(`2d`,{willReadFrequently:!0});function t(t){e.clearRect(0,0,1,1),e.fillStyle=t,e.fillRect(0,0,1,1);let[n,r,i]=e.getImageData(0,0,1,1).data;return[n/255,r/255,i/255]}function n(e,t){return getComputedStyle(document.documentElement).getPropertyValue(e).trim()||t}function r(e,t,n){let r=e.createShader(t);return e.shaderSource(r,n),e.compileShader(r),r}function i(e,t){let n=e.createProgram();return e.attachShader(n,r(e,e.VERTEX_SHADER,`
    attribute vec2 position;
    void main() { gl_Position = vec4(position, 0.0, 1.0); }
  `)),e.attachShader(n,r(e,e.FRAGMENT_SHADER,t)),e.bindAttribLocation(n,0,`position`),e.linkProgram(n),e.getProgramParameter(n,e.LINK_STATUS)?n:null}var a=e=>e-Math.floor(e),o=window.matchMedia(`(prefers-reduced-motion: reduce)`).matches;function s(e){let r=e.getContext(`webgl`,{antialias:!1,alpha:!1,failIfMajorPerformanceCaveat:!0});if(!r)return;let s=i(r,`
    precision highp float;
    uniform vec2 uResolution;
    uniform float uTime;
    uniform float uFlip;
    uniform float uBand;
    uniform vec2 uMouse;
    uniform float uPush;
    uniform vec3 uInk;
    uniform vec3 uDeep;
    uniform vec3 uPrimary;
    uniform vec3 uLavender;
    uniform vec3 uHaze;
    uniform vec3 uGround;

    float hash(vec2 p) {
      return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
    }
    float noise(vec2 p) {
      vec2 i = floor(p);
      vec2 f = fract(p);
      f = f * f * (3.0 - 2.0 * f);
      return mix(
        mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x),
        mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x),
        f.y
      );
    }
    float fbm(vec2 p) {
      float value = 0.0;
      float amplitude = 0.5;
      for (int i = 0; i < 4; i++) {
        value += amplitude * noise(p);
        p *= 2.0;
        amplitude *= 0.5;
      }
      return value;
    }

    // Bulge the gradient away from the pointer
    vec2 push(vec2 uv) {
      vec2 aspect = vec2(uResolution.x / uResolution.y, 1.0);
      vec2 delta = (uv - uMouse) * aspect;
      float falloff = exp(-dot(delta, delta) * 6.0);
      return uv - delta / aspect * falloff * 0.5 * uPush;
    }

    vec3 bandColor(vec2 uv, float t) {
      vec2 q = vec2(fbm(uv * vec2(2.0, 1.5) + t), fbm(uv * vec2(2.0, 1.5) - t + 3.7));
      vec2 p = uv + (q - 0.5) * vec2(0.12, 0.3);
      // A slow wave for the centre line, and a core that swells and thins
      // Tilted so it falls from the top left to the bottom right
      float line = 0.5 + (0.5 - p.x) * 0.5 + sin(p.x * 3.2 + t * 3.0) * 0.06 + sin(p.x * 7.0 - t * 2.0) * 0.025;
      float thickness = 0.36 + sin(p.x * 2.4 - t * 2.5) * 0.1;
      float d = abs(p.y - line) / thickness;

      vec3 color = uInk;
      color = mix(color, uDeep, smoothstep(0.12, 0.3, d));
      color = mix(color, uPrimary, smoothstep(0.3, 0.48, d));
      color = mix(color, uLavender, smoothstep(0.48, 0.7, d));
      color = mix(color, uGround, smoothstep(0.7, 1.0, d));
      // Always land on the page colour at the top and bottom edges
      float edge = smoothstep(0.7, 1.0, abs(uv.y - 0.5) * 2.0);
      return mix(color, uGround, edge);
    }

    void main() {
      vec2 screen = gl_FragCoord.xy / uResolution;
      vec2 uv = push(screen);
      if (uBand > 0.5) {
        vec3 color = bandColor(uv, uTime * 0.04);
        float fade = 1.0 - smoothstep(0.6, 1.0, abs(screen.y - 0.5) * 2.0);
        gl_FragColor = vec4(color, fade);
        return;
      }
      // y = 0 is where the arch hangs from: the top, or the bottom when flipped
      uv.y = mix(1.0 - uv.y, uv.y, uFlip);
      float t = uTime * 0.04;

      // Warp the coordinates with soft noise so the band drifts
      vec2 q = vec2(fbm(uv * 1.5 + t), fbm(uv * 1.5 - t + 3.7));
      vec2 p = uv + (q - 0.5) * 0.18;

      vec2 center = vec2(0.65 + sin(t * 2.0) * 0.05, 0.0);
      float d = length((p - center) / vec2(1.5, 0.85));

      vec3 ground = mix(uHaze, uGround, uv.y);
      vec3 color = uInk;
      color = mix(color, uDeep, smoothstep(0.38, 0.52, d));
      color = mix(color, uPrimary, smoothstep(0.52, 0.64, d));
      color = mix(color, uLavender, smoothstep(0.64, 0.8, d));
      color = mix(color, ground, smoothstep(0.8, 0.98, d));

      // Soft blue glow on the left edge
      float glow = 1.0 - smoothstep(0.0, 1.0, length((p - vec2(0.0, 0.55)) / vec2(0.9, 0.5)));
      color = mix(color, uPrimary, glow * 0.35 * smoothstep(0.4, 0.7, d));

      // Melt colour and grain into the page at the free edge, so it meets the
      // next section without a seam
      float fade = 1.0 - smoothstep(0.8, 1.0, mix(1.0 - screen.y, screen.y, uFlip));
      color = mix(uGround, color, fade);

      // Alpha carries how much grain the second pass adds
      gl_FragColor = vec4(color, fade);
    }
  `),c=i(r,`
    precision highp float;
    uniform sampler2D uImage;
    uniform vec2 uResolution;
    uniform float uSeed;
    float hash(vec2 p) {
      return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
    }
    void main() {
      vec4 color = texture2D(uImage, gl_FragCoord.xy / uResolution);
      float grain = hash(gl_FragCoord.xy + uSeed) - 0.5;
      gl_FragColor = vec4(color.rgb + grain * 0.05 * color.a, 1.0);
    }
  `);if(!s||!c)return;r.bindBuffer(r.ARRAY_BUFFER,r.createBuffer()),r.bufferData(r.ARRAY_BUFFER,new Float32Array([-1,-1,3,-1,-1,3]),r.STATIC_DRAW),r.enableVertexAttribArray(0),r.vertexAttribPointer(0,2,r.FLOAT,!1,0,0);let l=r.createTexture();r.bindTexture(r.TEXTURE_2D,l),r.texParameteri(r.TEXTURE_2D,r.TEXTURE_MIN_FILTER,r.LINEAR),r.texParameteri(r.TEXTURE_2D,r.TEXTURE_MAG_FILTER,r.LINEAR),r.texParameteri(r.TEXTURE_2D,r.TEXTURE_WRAP_S,r.CLAMP_TO_EDGE),r.texParameteri(r.TEXTURE_2D,r.TEXTURE_WRAP_T,r.CLAMP_TO_EDGE);let u=r.createFramebuffer(),d={width:1,height:1};r.useProgram(c),r.uniform1i(r.getUniformLocation(c,`uImage`),0);let f=r.getUniformLocation(c,`uResolution`),p=r.getUniformLocation(c,`uSeed`);r.useProgram(s);let m={uInk:n(`--color-inverse`,`oklch(16% 0.05 270)`),uDeep:`oklch(30% 0.14 268)`,uPrimary:n(`--color-primary`,`oklch(52% 0.22 268)`),uLavender:`oklch(78% 0.1 275)`,uHaze:`oklch(92% 0.04 275)`,uGround:n(`--color-background`,`oklch(98.8% 0.006 275)`)};for(let[e,n]of Object.entries(m))r.uniform3fv(r.getUniformLocation(s,e),t(n));r.uniform1f(r.getUniformLocation(s,`uFlip`),+!!e.dataset.flip),r.uniform1f(r.getUniformLocation(s,`uBand`),+!!e.dataset.band);let h=r.getUniformLocation(s,`uResolution`),g=r.getUniformLocation(s,`uMouse`),_=r.getUniformLocation(s,`uPush`),v={x:.5,y:.5,tx:.5,ty:.5,push:0,target:0};o||(window.addEventListener(`pointermove`,t=>{if(t.pointerType!==`mouse`)return;let n=e.getBoundingClientRect();v.tx=(t.clientX-n.left)/n.width,v.ty=1-(t.clientY-n.top)/n.height,v.target=+(v.tx>=0&&v.tx<=1&&v.ty>=0&&v.ty<=1)},{passive:!0}),document.documentElement.addEventListener(`pointerleave`,()=>v.target=0));let y=r.getUniformLocation(s,`uTime`),b=performance.now(),x=0,S=0,C=!1;function w(t){v.x+=(v.tx-v.x)*.08,v.y+=(v.ty-v.y)*.08,v.push+=(v.target-v.push)*.05,r.uniform2f(g,v.x,v.y),r.uniform1f(_,v.push);let n=o?0:(t-b)/1e3;r.uniform1f(y,n),r.bindFramebuffer(r.FRAMEBUFFER,u),r.viewport(0,0,d.width,d.height),r.drawArrays(r.TRIANGLES,0,3),r.useProgram(c),r.uniform1f(p,a(n)*100),r.bindFramebuffer(r.FRAMEBUFFER,null),r.viewport(0,0,e.width,e.height),r.drawArrays(r.TRIANGLES,0,3),r.useProgram(s)}function T(){let t=Math.max(e.clientWidth*e.clientHeight,1),n=Math.min(.5,Math.sqrt(4e5/t));d.width=Math.max(Math.round(e.clientWidth*n),1),d.height=Math.max(Math.round(e.clientHeight*n),1),r.bindTexture(r.TEXTURE_2D,l),r.texImage2D(r.TEXTURE_2D,0,r.RGBA,d.width,d.height,0,r.RGBA,r.UNSIGNED_BYTE,null),r.bindFramebuffer(r.FRAMEBUFFER,u),r.framebufferTexture2D(r.FRAMEBUFFER,r.COLOR_ATTACHMENT0,r.TEXTURE_2D,l,0),r.uniform2f(h,d.width,d.height);let i=Math.min(window.devicePixelRatio,1.5);e.width=Math.round(e.clientWidth*i),e.height=Math.round(e.clientHeight*i),r.useProgram(c),r.uniform2f(f,e.width,e.height),r.useProgram(s),w(performance.now())}function E(e){x=requestAnimationFrame(E),!(e-S<33)&&(S=e,w(e))}new ResizeObserver(T).observe(e),T(),e.classList.replace(`opacity-0`,`opacity-100`),o||new IntersectionObserver(([e])=>{e.isIntersecting&&!C&&(x=requestAnimationFrame(E)),e.isIntersecting||cancelAnimationFrame(x),C=e.isIntersecting}).observe(e)}function c(){let e=new IntersectionObserver(t=>{for(let n of t)n.isIntersecting&&(e.unobserve(n.target),s(n.target))},{rootMargin:`200px`});document.querySelectorAll(`[data-gradient-shader]`).forEach(t=>e.observe(t))}var l=()=>`requestIdleCallback`in window?requestIdleCallback(c,{timeout:2e3}):setTimeout(c,200);document.readyState===`complete`?l():window.addEventListener(`load`,l,{once:!0});