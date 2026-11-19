function e(e){let t=e.startsWith(`--`)?getComputedStyle(document.documentElement).getPropertyValue(e).trim():e,n=document.createElement(`canvas`).getContext(`2d`);if(!n||!t)return[0,0,0];n.fillStyle=t,n.fillRect(0,0,1,1);let[r,i,a]=n.getImageData(0,0,1,1).data;return[r/255,i/255,a/255]}function t(e,t,n){let r=e.createShader(t);return e.shaderSource(r,n),e.compileShader(r),r}var n=window.matchMedia(`(prefers-reduced-motion: reduce)`).matches,r=2,i=1e3/30;function a(a){let o=a.getContext(`webgl`,{premultipliedAlpha:!0,antialias:!1,powerPreference:`low-power`});if(!o)return;a.style.imageRendering=`pixelated`;let s=o.createProgram();if(o.attachShader(s,t(o,o.VERTEX_SHADER,`
    attribute vec2 position;
    void main() { gl_Position = vec4(position, 0.0, 1.0); }
  `)),o.attachShader(s,t(o,o.FRAGMENT_SHADER,`
    precision highp float;
    uniform vec2 uResolution;
    uniform float uTime;
    uniform vec3 uColors[4];
    uniform vec2 uPointer;
    uniform float uSweep;

    float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }

    float noise(vec2 p) {
      vec2 i = floor(p);
      vec2 f = fract(p);
      vec2 u = f * f * (3.0 - 2.0 * f);
      return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
                 mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
    }

    float fbm(vec2 p) {
      float value = 0.0;
      float amplitude = 0.5;
      mat2 turn = mat2(0.8, 0.6, -0.6, 0.8);
      for (int i = 0; i < 4; i++) {
        value += amplitude * noise(p);
        p = turn * p * 2.03;
        amplitude *= 0.5;
      }
      return value;
    }

    float bayer2(vec2 a) { a = floor(a); return fract(dot(a, vec2(0.5, a.y * 0.75))); }
    float bayer4(vec2 a) { return bayer2(0.5 * a) * 0.25 + bayer2(a); }
    float bayer8(vec2 a) { return bayer4(0.5 * a) * 0.25 + bayer2(a); }

    vec3 pick(float i) {
      if (i < 0.5) return uColors[0];
      if (i < 1.5) return uColors[1];
      if (i < 2.5) return uColors[2];
      return uColors[3];
    }

    void main() {
      float unit = min(uResolution.x, uResolution.y);
      float t = uTime * 0.08;

      vec2 cell = floor(gl_FragCoord.xy);
      vec2 center = cell + 0.5;
      vec2 uv = center / uResolution;
      float threshold = bayer8(cell);

      vec2 p = center / unit * 1.3;
      vec2 warp = vec2(fbm(p + t), fbm(p + vec2(4.1, 1.7) - t));
      float value = fbm(p + 1.6 * warp + vec2(t * 0.5, 0.0));
      value = smoothstep(0.2, 0.85, value) * 0.8 + uv.x * 0.25 - uv.y * 0.15;

      vec2 away = (center - uPointer) / unit;
      value += 0.45 * exp(-dot(away, away) * 7.0);

      float level = clamp(floor(value * 3.0 + threshold), 0.0, 3.0);
      vec3 color = pick(level);

      float curve = 0.06 + 0.64 * pow(max(uv.x, 0.0), 1.25);
      float fade = clamp((curve - uv.y) / 0.12 + 0.5, 0.0, 1.0);
      float alpha = mix(1.0, step(threshold, fade), uSweep);

      gl_FragColor = vec4(color * alpha, alpha);
    }
  `)),o.linkProgram(s),!o.getProgramParameter(s,o.LINK_STATUS))return;o.useProgram(s),o.bindBuffer(o.ARRAY_BUFFER,o.createBuffer()),o.bufferData(o.ARRAY_BUFFER,new Float32Array([-1,-1,3,-1,-1,3]),o.STATIC_DRAW);let c=o.getAttribLocation(s,`position`);o.enableVertexAttribArray(c),o.vertexAttribPointer(c,2,o.FLOAT,!1,0,0);let l=o.getUniformLocation(s,`uResolution`),u=o.getUniformLocation(s,`uTime`),d=o.getUniformLocation(s,`uPointer`),f=(a.dataset.colors??``).split(`,`);o.uniform3fv(o.getUniformLocation(s,`uColors`),f.flatMap(e)),o.uniform1f(o.getUniformLocation(s,`uSweep`),a.dataset.sweep===`0`?0:1);let p={x:-9999,y:-9999},m={x:-9999,y:-9999};window.addEventListener(`pointermove`,e=>{let t=a.getBoundingClientRect();if(!t.width||!t.height)return;let n=a.width/t.width;p.x=(e.clientX-t.left)*n,p.y=(t.bottom-e.clientY)*n,m.x<-999&&Object.assign(m,p)});let h=e=>{m.x+=(p.x-m.x)*.06,m.y+=(p.y-m.y)*.06,o.uniform2f(d,m.x,m.y),o.uniform1f(u,e/1e3),o.drawArrays(o.TRIANGLES,0,3)};if(new ResizeObserver(()=>{a.width=Math.max(1,Math.round(a.clientWidth/r)),a.height=Math.max(1,Math.round(a.clientHeight/r)),o.viewport(0,0,a.width,a.height),o.uniform2f(l,a.width,a.height),n&&h(0)}).observe(a),n)return;let g=0,_=0,v=e=>{g=requestAnimationFrame(v),!(e-_<i)&&(_=e,h(e))};new IntersectionObserver(([e])=>{cancelAnimationFrame(g),e.isIntersecting&&(g=requestAnimationFrame(v))}).observe(a)}var o=e=>`requestIdleCallback`in window?requestIdleCallback(e,{timeout:1500}):setTimeout(e,200),s=new IntersectionObserver(e=>{e.forEach(e=>{e.isIntersecting&&(s.unobserve(e.target),o(()=>a(e.target)))})},{rootMargin:`200px`});document.querySelectorAll(`[data-shader]`).forEach(e=>s.observe(e));