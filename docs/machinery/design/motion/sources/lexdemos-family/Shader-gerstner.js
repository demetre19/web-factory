var e=e=>{let t=document.createElement(`canvas`).getContext(`2d`);if(!t)return[0,0,0];t.fillStyle=e,t.fillRect(0,0,1,1);let[n,r,i]=t.getImageData(0,0,1,1).data;return[n/255,r/255,i/255]},t=(e,t,n)=>{let r=e.createShader(t);return e.shaderSource(r,n),e.compileShader(r),r},n=window.matchMedia(`(prefers-reduced-motion: reduce)`).matches,r=r=>{let i=r.getContext(`webgl`,{antialias:!1,alpha:!1});if(!i)return;let a=i.createProgram();if(i.attachShader(a,t(i,i.VERTEX_SHADER,`
    attribute vec2 position;
    void main() { gl_Position = vec4(position, 0.0, 1.0); }
  `)),i.attachShader(a,t(i,i.FRAGMENT_SHADER,`
    precision highp float;
    uniform vec2 uResolution;
    uniform float uTime;
    uniform vec3 uColors[4];
    uniform vec3 uGround;
    uniform vec2 uPointer;

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

    float field(vec2 frag, float unit, float t) {
      vec2 p = frag / unit * 1.6;
      vec2 away = (frag - uPointer) / unit;
      p += away * 1.5 * exp(-dot(away, away) * 5.0);
      vec2 q = vec2(fbm(p + t * 0.3), fbm(p + vec2(5.2, 1.3) - t * 0.2));
      vec2 r = vec2(fbm(p + 3.0 * q + vec2(1.7, 9.2) + t * 0.5),
                    fbm(p + 3.0 * q + vec2(8.3, 2.8) - t * 0.4));
      return fbm(p + 3.0 * r) + 0.5 * length(q);
    }

    vec3 pick(float i) {
      if (i < 0.5) return uColors[0];
      if (i < 1.5) return uColors[1];
      if (i < 2.5) return uColors[2];
      return uColors[3];
    }

    vec3 palette(float x) {
      x = fract(x) * 4.0;
      float i = floor(x);
      float blend = smoothstep(0.0, 1.0, fract(x));
      return mix(pick(i), pick(mod(i + 1.0, 4.0)), blend);
    }

    void main() {
      float unit = min(uResolution.x, uResolution.y);
      float t = uTime * 0.15;

      float ribWidth = unit * 0.03;
      float rib = fract(gl_FragCoord.x / ribWidth);
      vec2 frag = gl_FragCoord.xy + vec2((rib - 0.5) * ribWidth * 1.6, 0.0);
      vec2 split = vec2((rib - 0.5) * ribWidth * 0.5, 0.0);

      float bands = 1.3;
      float fR = field(frag + split, unit, t);
      float fG = field(frag, unit, t);
      float fB = field(frag - split, unit, t);

      vec3 color = vec3(palette(fR * bands + t).r, palette(fG * bands + t).g, palette(fB * bands + t).b);
      color = mix(uGround, color, 0.45 + 0.55 * smoothstep(0.3, 1.1, fG));
      color *= 0.8 + 0.2 * sin(rib * 3.1416);

      color += (hash(gl_FragCoord.xy + uTime) - 0.5) * 0.02;
      gl_FragColor = vec4(clamp(color, 0.0, 1.0), 1.0);
    }
  `)),i.linkProgram(a),!i.getProgramParameter(a,i.LINK_STATUS))return;i.useProgram(a),i.bindBuffer(i.ARRAY_BUFFER,i.createBuffer()),i.bufferData(i.ARRAY_BUFFER,new Float32Array([-1,-1,3,-1,-1,3]),i.STATIC_DRAW);let o=i.getAttribLocation(a,`position`);i.enableVertexAttribArray(o),i.vertexAttribPointer(o,2,i.FLOAT,!1,0,0);let s=i.getUniformLocation(a,`uResolution`),c=i.getUniformLocation(a,`uTime`),l=JSON.parse(r.dataset.shader??`[]`);i.uniform3fv(i.getUniformLocation(a,`uColors`),l.flatMap(e));let u=getComputedStyle(document.documentElement).getPropertyValue(`--color-primary`).trim();i.uniform3fv(i.getUniformLocation(a,`uGround`),e(u));let d=i.getUniformLocation(a,`uPointer`),f={x:-9999,y:-9999},p={x:-9999,y:-9999};window.addEventListener(`pointermove`,e=>{let t=r.getBoundingClientRect();if(!t.width||!t.height)return;let n=r.width/t.width;f.x=(e.clientX-t.left)*n,f.y=(t.bottom-e.clientY)*n,p.x<-999&&Object.assign(p,f)});let m=e=>{p.x+=(f.x-p.x)*.06,p.y+=(f.y-p.y)*.06,i.uniform2f(d,p.x,p.y),i.uniform1f(c,e/1e3),i.drawArrays(i.TRIANGLES,0,3)};if(new ResizeObserver(()=>{let e=Math.min(window.devicePixelRatio,1.5);r.width=Math.round(r.clientWidth*e),r.height=Math.round(r.clientHeight*e),i.viewport(0,0,r.width,r.height),i.uniform2f(s,r.width,r.height),n&&m(0)}).observe(r),n)return;let h=0,g=e=>{m(e),h=requestAnimationFrame(g)};new IntersectionObserver(([e])=>{cancelAnimationFrame(h),e.isIntersecting&&(h=requestAnimationFrame(g))}).observe(r)},i=()=>document.querySelectorAll(`[data-shader]`).forEach(e=>{let t=new IntersectionObserver(([n])=>{n.isIntersecting&&n.boundingClientRect.width&&n.boundingClientRect.height&&(t.disconnect(),r(e),requestAnimationFrame(()=>e.classList.remove(`opacity-0`)))},{rootMargin:`200px`});t.observe(e)});document.readyState===`complete`?i():window.addEventListener(`load`,i,{once:!0});