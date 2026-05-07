"use client";

import React, { useEffect, useRef } from "react";
import * as THREE from "three";

export default function OctahedronVideo() {
    const mountRef = useRef(null);

    useEffect(() => {
        if (!mountRef.current) return;

        // Capture the DOM element in a local variable so cleanup always
        // has a stable reference — mountRef.current can be null by the
        // time React runs the effect destructor during Next.js navigation.
        const container = mountRef.current;

        // Remove any orphaned canvas from a previous mount cycle.
        // This handles React 18 Strict Mode (double-mount in dev) and
        // stale canvases left behind when cleanup couldn't find the ref.
        while (container.firstChild) {
            container.removeChild(container.firstChild);
        }

        // ─────────────────────────────────────────────────────────
        //  RENDERER
        // ─────────────────────────────────────────────────────────
        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));

        const width = container.clientWidth;
        const height = container.clientHeight || 500;
        renderer.setSize(width, height);
        renderer.setClearColor(0xffffff, 0);
        renderer.autoClear = true;
        container.appendChild(renderer.domElement);

        const scene = new THREE.Scene();

        // ─────────────────────────────────────────────────────────
        //  CAMERA
        // ─────────────────────────────────────────────────────────
        const camera = new THREE.PerspectiveCamera(40, width / height, 0.01, 100);
        camera.position.set(0, 0.6, 2.5);
        camera.lookAt(0, 0, 0);

        // ─────────────────────────────────────────────────────────
        //  LIGHTS
        // ─────────────────────────────────────────────────────────
        scene.add(new THREE.AmbientLight(0xffffff, 0.5));

        const keyLightFront = new THREE.DirectionalLight(0xfff6ee, 1.5);
        keyLightFront.position.set(0, 6, 6);
        scene.add(keyLightFront);

        const keyLightRear = new THREE.DirectionalLight(0xfff6ee, 1.5);
        keyLightRear.position.set(0, 6, -6);
        scene.add(keyLightRear);

        const topLight = new THREE.DirectionalLight(0xffffff, 0.2);
        topLight.position.set(0, 8, 0);
        scene.add(topLight);

        // ─────────────────────────────────────────────────────────
        //  VIDEO ELEMENTS (one per face)
        // ─────────────────────────────────────────────────────────
        const VIDEO_PATHS = [
            "/videos/vid1.mp4", "/videos/vid2.mp4", "/videos/vid3.mp4", "/videos/vid4.mp4",
            "/videos/vid5.mp4", "/videos/vid6.mp4", "/videos/vid7.mp4", "/videos/vid8.mp4",
        ];
        const videos = [];
        const videoTextures = [];
        VIDEO_PATHS.forEach((src) => {
            const vid = document.createElement("video");
            vid.src = src;
            vid.crossOrigin = "anonymous";
            vid.loop = true;
            vid.muted = true;
            vid.playsInline = true;
            vid.preload = "metadata";
            // Don't auto-play yet — IntersectionObserver will trigger play
            videos.push(vid);

            const tex = new THREE.VideoTexture(vid);
            tex.minFilter = THREE.LinearFilter;
            tex.magFilter = THREE.LinearFilter;
            tex.format = THREE.RGBAFormat;
            if (THREE.SRGBColorSpace) {
                tex.colorSpace = THREE.SRGBColorSpace;
            }
            videoTextures.push(tex);
        });

        // ─────────────────────────────────────────────────────────
        //  OCTAHEDRON GEOMETRY DATA
        //
        //  The octahedron has poles on the Z-axis:
        //    V[0] = +Z  (top pole)
        //    V[5] = -Z  (bottom pole)
        //  Equatorial belt on XY plane: V[1]=+X, V[2]=+Y, V[3]=-X, V[4]=-Y
        // ─────────────────────────────────────────────────────────
        const V = [
            new THREE.Vector3(0, 0, 1),   // 0: top pole
            new THREE.Vector3(1, 0, 0),   // 1: +X equator
            new THREE.Vector3(0, 1, 0),   // 2: +Y equator
            new THREE.Vector3(-1, 0, 0),  // 3: -X equator
            new THREE.Vector3(0, -1, 0),  // 4: -Y equator
            new THREE.Vector3(0, 0, -1),  // 5: bottom pole
        ];

        // Upper 4 faces share V[0] (top pole), lower 4 share V[5] (bottom pole)
        const FACES = [
            [0, 1, 2], [0, 2, 3], [0, 3, 4], [0, 4, 1],   // upper 4
            [5, 2, 1], [5, 3, 2], [5, 4, 3], [5, 1, 4],   // lower 4
        ];

        // ─────────────────────────────────────────────────────────
        //  ROUNDED TRIANGLE 2-D SHAPE
        // ─────────────────────────────────────────────────────────
        function roundedTriShape(p0, p1, p2, cornerFrac) {
            const e01 = Math.hypot(p1[0] - p0[0], p1[1] - p0[1]);
            const e12 = Math.hypot(p2[0] - p1[0], p2[1] - p1[1]);
            const e20 = Math.hypot(p0[0] - p2[0], p0[1] - p2[1]);
            const r = Math.min(e01, e12, e20) * Math.min(cornerFrac, 0.40);

            function dir(a, b) {
                const l = Math.hypot(b[0] - a[0], b[1] - a[1]);
                return [(b[0] - a[0]) / l, (b[1] - a[1]) / l];
            }
            const d01 = dir(p0, p1), d10 = [-d01[0], -d01[1]];
            const d12 = dir(p1, p2), d21 = [-d12[0], -d12[1]];
            const d20 = dir(p2, p0), d02 = [-d20[0], -d20[1]];

            const s0 = [p0[0] + d01[0] * r, p0[1] + d01[1] * r];
            const e0 = [p0[0] + d02[0] * r, p0[1] + d02[1] * r];
            const s1 = [p1[0] + d12[0] * r, p1[1] + d12[1] * r];
            const e1 = [p1[0] + d10[0] * r, p1[1] + d10[1] * r];
            const s2 = [p2[0] + d20[0] * r, p2[1] + d20[1] * r];
            const e2 = [p2[0] + d21[0] * r, p2[1] + d21[1] * r];

            const shape = new THREE.Shape();
            shape.moveTo(s0[0], s0[1]);
            shape.lineTo(e1[0], e1[1]);
            shape.quadraticCurveTo(p1[0], p1[1], s1[0], s1[1]);
            shape.lineTo(e2[0], e2[1]);
            shape.quadraticCurveTo(p2[0], p2[1], s2[0], s2[1]);
            shape.lineTo(e0[0], e0[1]);
            shape.quadraticCurveTo(p0[0], p0[1], s0[0], s0[1]);
            shape.closePath();
            return shape;
        }

        // ─────────────────────────────────────────────────────────
        //  BUILD 3-D PANEL GEOMETRY FROM FACE
        //
        //  UV MAPPING STRATEGY (HeyGen-style):
        //  ────────────────────────────────────
        //  Each face has one "pole" vertex (V[0] or V[5]) and two
        //  "equatorial" vertices. We define UV "up" as the direction
        //  from the equatorial midpoint toward the pole, projected
        //  onto the face plane. This guarantees:
        //    • Upper faces: video top → top pole (upward)
        //    • Lower faces: video top → equator (upward from viewer)
        //  This is geometrically consistent and avoids any inversion.
        //
        //  The video is then center-cropped with a gentle "contain"
        //  bias so the content is visible, never over-zoomed.
        // ─────────────────────────────────────────────────────────
        function makePanelGeo(vi0, vi1, vi2, scale, cornerFrac, lift) {
            const v0 = V[vi0].clone(), v1 = V[vi1].clone(), v2 = V[vi2].clone();

            // Face centroid
            const cen = new THREE.Vector3().addVectors(v0, v1).add(v2).multiplyScalar(1 / 3);

            // Scale verts toward centroid
            const s0 = cen.clone().add(v0.clone().sub(cen).multiplyScalar(scale));
            const s1 = cen.clone().add(v1.clone().sub(cen).multiplyScalar(scale));
            const s2 = cen.clone().add(v2.clone().sub(cen).multiplyScalar(scale));

            // Face-local coordinate frame
            const faceNormal = new THREE.Vector3()
                .crossVectors(s1.clone().sub(s0), s2.clone().sub(s0))
                .normalize();

            // Make sure normal points outward (away from origin)
            if (faceNormal.dot(cen) < 0) faceNormal.negate();

            const tang = s1.clone().sub(s0).normalize();
            const bitan = new THREE.Vector3().crossVectors(faceNormal, tang).normalize();

            function to2(v) {
                const d = v.clone().sub(cen);
                return [d.dot(tang), d.dot(bitan)];
            }

            const [ax, ay] = to2(s0);
            const [bx, by] = to2(s1);
            const [cx, cy] = to2(s2);

            const shape = roundedTriShape([ax, ay], [bx, by], [cx, cy], cornerFrac);
            const geo = new THREE.ShapeGeometry(shape, 48);

            // Rebuild positions in 3-D, lifted along face normal
            const pos = geo.attributes.position;
            const newPos = [], newNorm = [], newWorldY = [], newUv = [];

            // ── World-Y UV frame derivation ──
            //
            // Project world-Y onto the face plane to get a UV "up" direction
            // that keeps video content right-side-up. Works because world-Y
            // aligns with the camera's vertical axis.

            const worldUp = new THREE.Vector3(0, 1, 0);

            // Project world-up onto the face plane
            let uvUp = worldUp.clone()
                .sub(faceNormal.clone().multiplyScalar(worldUp.dot(faceNormal)));

            // Handle degenerate case: face normal is exactly ±Y
            if (uvUp.lengthSq() < 1e-6) {
                uvUp.set(0, 0, -1)
                    .sub(faceNormal.clone().multiplyScalar(
                        new THREE.Vector3(0, 0, -1).dot(faceNormal)
                    ));
            }
            uvUp.normalize();

            // Track lower hemisphere faces for UV flip
            const isLowerFace = (vi0 === 5 || vi1 === 5 || vi2 === 5);

            // U-axis: perpendicular to uvUp on the face plane
            let uvRight = new THREE.Vector3().crossVectors(faceNormal, uvUp).normalize();

            // Handedness check: ensure (uvRight, uvUp, faceNormal) forms a
            // right-handed frame so the video is never mirrored on any face.
            // If the cross product (uvRight × uvUp) opposes the outward normal,
            // flip uvRight to fix the mirror.
            const handCheck = new THREE.Vector3().crossVectors(uvRight, uvUp);
            if (handCheck.dot(faceNormal) < 0) {
                uvRight.negate();
            }

            // ── Bounding-box pass ──
            let minU = Infinity, maxU = -Infinity, minV = Infinity, maxV = -Infinity;
            for (let i = 0; i < pos.count; i++) {
                const lx = pos.getX(i);
                const ly = pos.getY(i);
                const p3 = new THREE.Vector3()
                    .addScaledVector(tang, lx)
                    .addScaledVector(bitan, ly);
                const pu = p3.dot(uvRight);
                const pv = p3.dot(uvUp);
                if (pu < minU) minU = pu;
                if (pu > maxU) maxU = pu;
                if (pv < minV) minV = pv;
                if (pv > maxV) maxV = pv;
            }

            // ── Aspect-ratio "cover" fit (gentle) ──
            // Use a balanced approach: scale enough to cover the triangle
            // but avoid excessive cropping. Blend between "contain" and
            // "cover" for the best visual result on triangular panels.
            const videoAspect = 16 / 9;
            const panelW = maxU - minU;
            const panelH = maxV - minV;
            const panelAspect = panelW / panelH;

            // Pure cover scale
            let coverU = 1, coverV = 1;
            if (panelAspect > videoAspect) {
                coverV = 1;
                coverU = panelAspect / videoAspect;
            } else {
                coverU = 1;
                coverV = videoAspect / panelAspect;
            }

            // Blend 70% cover + 30% contain to avoid extreme crop on triangles
            // (triangles have tall aspect so pure cover crops too much width)
            const blendFactor = 0.70;
            const finalScaleU = 1 + (coverU - 1) * blendFactor;
            const finalScaleV = 1 + (coverV - 1) * blendFactor;

            // ── Final UV assignment ──
            for (let i = 0; i < pos.count; i++) {
                const lx = pos.getX(i);
                const ly = pos.getY(i);
                const localP3 = new THREE.Vector3()
                    .addScaledVector(tang, lx)
                    .addScaledVector(bitan, ly);
                const p3 = cen.clone().add(localP3).addScaledVector(faceNormal, lift);

                newPos.push(p3.x, p3.y, p3.z);
                newNorm.push(faceNormal.x, faceNormal.y, faceNormal.z);
                newWorldY.push(p3.y);

                const pu = localP3.dot(uvRight);
                const pv = localP3.dot(uvUp);

                // Normalize to 0-1 range
                let u = (pu - minU) / (maxU - minU);
                let v = (pv - minV) / (maxV - minV);

                // Lower hemisphere faces: flip V so videos appear
                // right-side-up when viewed from outside (below)
                if (isLowerFace) {
                    v = 1.0 - v;
                }

                // Apply center-fit scaling
                u = (u - 0.5) / finalScaleU + 0.5;
                v = (v - 0.5) / finalScaleV + 0.5;

                newUv.push(u, v);
            }

            geo.setAttribute('position', new THREE.Float32BufferAttribute(newPos, 3));
            geo.setAttribute('normal', new THREE.Float32BufferAttribute(newNorm, 3));
            geo.setAttribute('worldY', new THREE.Float32BufferAttribute(newWorldY, 1));
            geo.setAttribute('uv', new THREE.Float32BufferAttribute(newUv, 2));

            geo.computeBoundingSphere();
            return { geo, faceNormal, cen, uvUp: uvUp.clone(), uvRight: uvRight.clone(), isLowerFace };
        }

        // ─────────────────────────────────────────────────────────
        //  RAINBOW SHADER  — position-based hue, green→violet
        // ─────────────────────────────────────────────────────────
        const rainbowVert = `
      attribute float worldY;
      varying float vY;
      void main() {
        vY = worldY;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `;
        const rainbowFrag = `
      precision highp float;
      uniform float time;
      varying float vY;

      vec3 hsl2rgb(float h, float s, float l) {
        float c = (1.0 - abs(2.0*l - 1.0)) * s;
        float x = c * (1.0 - abs(mod(h*6.0, 2.0) - 1.0));
        float m = l - c*0.5;
        vec3 rgb;
        if(h < 1.0/6.0)      rgb = vec3(c,x,0);
        else if(h < 2.0/6.0) rgb = vec3(x,c,0);
        else if(h < 3.0/6.0) rgb = vec3(0,c,x);
        else if(h < 4.0/6.0) rgb = vec3(0,x,c);
        else if(h < 5.0/6.0) rgb = vec3(x,0,c);
        else                  rgb = vec3(c,0,x);
        return rgb + m;
      }

      void main() {
        float t   = clamp(vY * 0.5 + 0.5, 0.0, 1.0);
        float hue = mod(mix(0.33, 0.80, t) + time * 0.035, 1.0);
        vec3 col  = hsl2rgb(hue, 1.0, 0.60);
        gl_FragColor = vec4(col, 1.0);
      }
    `;

        function makeRainbowMat() {
            return new THREE.ShaderMaterial({
                uniforms: { time: { value: 0.0 } },
                vertexShader: rainbowVert,
                fragmentShader: rainbowFrag,
                side: THREE.DoubleSide,
                depthWrite: true,
                depthTest: true,
            });
        }

        // ─────────────────────────────────────────────────────────
        //  GLOW SHADER  — soft additive halo around border
        // ─────────────────────────────────────────────────────────
        const glowFrag = `
      precision highp float;
      uniform float time;
      varying float vY;

      vec3 hsl2rgb(float h, float s, float l) {
        float c = (1.0 - abs(2.0*l - 1.0)) * s;
        float x = c * (1.0 - abs(mod(h*6.0, 2.0) - 1.0));
        float m = l - c*0.5;
        vec3 rgb;
        if(h < 1.0/6.0)      rgb = vec3(c,x,0);
        else if(h < 2.0/6.0) rgb = vec3(x,c,0);
        else if(h < 3.0/6.0) rgb = vec3(0,c,x);
        else if(h < 4.0/6.0) rgb = vec3(0,x,c);
        else if(h < 5.0/6.0) rgb = vec3(x,0,c);
        else                  rgb = vec3(c,0,x);
        return rgb + m;
      }

      void main() {
        float t   = clamp(vY * 0.5 + 0.5, 0.0, 1.0);
        float hue = mod(mix(0.33, 0.80, t) + time * 0.035, 1.0);
        vec3 col  = hsl2rgb(hue, 1.0, 0.65);
        gl_FragColor = vec4(col, 0.15);
      }
    `;

        function makeGlowMat() {
            return new THREE.ShaderMaterial({
                uniforms: { time: { value: 0.0 } },
                vertexShader: rainbowVert,
                fragmentShader: glowFrag,
                side: THREE.DoubleSide,
                transparent: true,
                blending: THREE.AdditiveBlending,
                depthWrite: false,
                depthTest: true,
            });
        }

        // ─────────────────────────────────────────────────────────
        //  SCREEN MATERIAL  — glassy panel with per-face VIDEO
        // ─────────────────────────────────────────────────────────
        function makeScreenMat(texture) {
            return new THREE.MeshPhysicalMaterial({
                map: texture,
                emissive: new THREE.Color(0xffffff),
                emissiveMap: texture,
                emissiveIntensity: 0.9,
                metalness: 0.1,
                roughness: 0.1,
                clearcoat: 1.0,
                clearcoatRoughness: 0.04,
                side: THREE.DoubleSide,
                transparent: true,
                opacity: 0.75,
                depthWrite: false,
            });
        }

        // ─────────────────────────────────────────────────────────
        //  ASSEMBLE SCENE
        // ─────────────────────────────────────────────────────────
        const outerGroup = new THREE.Group();
        scene.add(outerGroup);

        const innerGroup = new THREE.Group();
        innerGroup.position.y = 0.0;
        outerGroup.add(innerGroup);

        // Volumetric center core light
        const coreLight = new THREE.PointLight(0xccddff, 2.0, 3.0);
        innerGroup.add(coreLight);

        // Rim Light
        const rimLight = new THREE.PointLight(0xffffff, 2.5, 6.0);
        rimLight.position.set(2, 2, 0);
        outerGroup.add(rimLight);

        // Panel proportions
        const BORDER_SCALE = 0.950;
        const SCREEN_SCALE = 0.895;
        const CORNER_B = 0.27;
        const CORNER_S = 0.26;
        const GLOW_SCALE = 0.990;

        const rainbowMats = [];
        const glowMats = [];
        const screenMats = [];
        const faceUvData = [];  // Per-face UV orientation data for dynamic rotation

        FACES.forEach(([i0, i1, i2], fi) => {
            // Layer 3 (back): soft outer glow
            const glowM = makeGlowMat();
            glowMats.push(glowM);
            const { geo: gGeo } = makePanelGeo(i0, i1, i2, GLOW_SCALE, CORNER_B + 0.01, 0.000);
            const glowMesh = new THREE.Mesh(gGeo, glowM);
            glowMesh.renderOrder = 0;
            innerGroup.add(glowMesh);

            // Layer 2 (middle): rainbow border
            const rbM = makeRainbowMat();
            rainbowMats.push(rbM);
            const { geo: bGeo } = makePanelGeo(i0, i1, i2, BORDER_SCALE, CORNER_B, 0.003);
            const borderMesh = new THREE.Mesh(bGeo, rbM);
            borderMesh.renderOrder = 1;
            innerGroup.add(borderMesh);

            // Layer 1 (front): screen content (per-face video)
            const { geo: sGeo, faceNormal: sFaceNormal, uvUp: sUvUp, uvRight: sUvRight, isLowerFace: sIsLower } = makePanelGeo(i0, i1, i2, SCREEN_SCALE, CORNER_S, 0.006);
            const sMat = makeScreenMat(videoTextures[fi]);
            screenMats.push(sMat);
            const screenMesh = new THREE.Mesh(sGeo, sMat);
            screenMesh.renderOrder = 2;
            innerGroup.add(screenMesh);

            // Store per-face data for dynamic UV rotation
            // For lower faces (V-flipped in static UVs), the effective UV up
            // in 3D space is the negative of the computed uvUp
            faceUvData.push({
                normal: sFaceNormal.clone(),
                uvUp: sIsLower ? sUvUp.clone().negate() : sUvUp.clone(),
                uvRight: sUvRight.clone(),
            });

            // Set texture rotation center to (0.5, 0.5) for rotation around center
            videoTextures[fi].center.set(0.5, 0.5);
        });

        // ─────────────────────────────────────────────────────────
        //  ENVIRONMENTAL PARTICLES
        // ─────────────────────────────────────────────────────────
        const particleCount = 80;
        const particlePos = new Float32Array(particleCount * 3);
        const particleVel = new Float32Array(particleCount * 3);
        const particleBase = new Float32Array(particleCount * 3);

        for (let i = 0; i < particleCount; i++) {
            const r = 1.8 + Math.random() * 2.5;
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos((Math.random() * 2) - 1);

            particlePos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
            particlePos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
            particlePos[i * 3 + 2] = r * Math.cos(phi);

            particleBase[i * 3] = particlePos[i * 3];
            particleBase[i * 3 + 1] = particlePos[i * 3 + 1];
            particleBase[i * 3 + 2] = particlePos[i * 3 + 2];

            particleVel[i * 3] = particleVel[i * 3 + 1] = particleVel[i * 3 + 2] = 0;
        }

        const particlesGeo = new THREE.BufferGeometry();
        particlesGeo.setAttribute('position', new THREE.BufferAttribute(particlePos, 3));
        const particlesMat = new THREE.PointsMaterial({
            color: 0xccaaff, size: 0.02, transparent: true, opacity: 0.6, blending: THREE.AdditiveBlending
        });
        const particleSystem = new THREE.Points(particlesGeo, particlesMat);
        scene.add(particleSystem);

        // ─────────────────────────────────────────────────────────
        //  GLINT LIGHT
        // ─────────────────────────────────────────────────────────
        const glintLight = new THREE.PointLight(0xffffff, 0, 10);
        glintLight.position.set(2, 2, 2);
        scene.add(glintLight);

        // ─────────────────────────────────────────────────────────
        //  INITIAL ORIENTATION & STATE
        // ─────────────────────────────────────────────────────────
        const baseY = outerGroup.position.y;

        // ─────────────────────────────────────────────────────────
        //  ANIMATE  — HeyGen Mesmerizing Motion (State Machine)
        //
        //  Two-phase motion that creates the hypnotic effect:
        //
        //  PHASE 1 — IDLE DRIFT (7-12s):
        //    Ultra-slow multi-axis wobble. The octahedron feels
        //    weightless, barely moving, like floating in zero-G.
        //    Gentle Y rotation, subtle X/Z oscillation.
        //
        //  PHASE 2 — SUDDEN FLIP (~1.8s):
        //    A rapid, purposeful rotation (~90-120°) that snaps
        //    new faces into view. Uses spring easing: gentle
        //    acceleration → fast peak → deceleration with slight
        //    overshoot/settle. This catches the eye.
        //
        //  The CONTRAST between near-stillness and sudden motion
        //  is what makes HeyGen's octahedron feel alive and
        //  mesmerizing. The exact timing randomization prevents
        //  the motion from ever feeling mechanical.
        // ─────────────────────────────────────────────────────────
        const clock = new THREE.Clock();
        let animationFrameId;

        // ── Motion parameters ──
        const IDLE_DURATION_MIN = 4.0;    // seconds between flips
        const IDLE_DURATION_MAX = 8.0;
        const FLIP_DURATION = 1.3;        // seconds for each flip
        const IDLE_Y_SPEED = 0.15;        // rad/s — smooth continuous spin
        const IDLE_WOBBLE_AMP = 10;       // degrees — visible, organic tilt
        const deg = Math.PI / 180;

        // ── State ──
        const currentQuat = new THREE.Quaternion();
        const targetQuat = new THREE.Quaternion();
        const flipStartQuat = new THREE.Quaternion();
        const displayQuat = new THREE.Quaternion();

        // ── PRE-ALLOCATED TEMP OBJECTS (zero per-frame allocation) ──
        const _spinQuat = new THREE.Quaternion();
        const _wobbleQuatX = new THREE.Quaternion();
        const _wobbleQuatZ = new THREE.Quaternion();
        const _yAxis = new THREE.Vector3(0, 1, 0);
        const _xAxis = new THREE.Vector3(1, 0, 0);
        const _zAxis = new THREE.Vector3(0, 0, 1);
        const _relFlip = new THREE.Quaternion();

        // Pre-allocated vectors for dynamic UV rotation (zero per-frame alloc)
        const _worldNormal = new THREE.Vector3();
        const _worldUvUp = new THREE.Vector3();
        const _worldUvRight = new THREE.Vector3();
        const _desiredUp = new THREE.Vector3();
        const _viewDir = new THREE.Vector3();
        const _camUp = new THREE.Vector3(0, 1, 0);
        const _prevAngles = new Float32Array(8);  // Smooth interpolation targets

        // Pre-merge shader material arrays (avoid spread each frame)
        const allShaderMats = [...rainbowMats, ...glowMats];
        const allShaderMatsLen = allShaderMats.length;
        const screenMatsLen = screenMats.length;

        // Pre-calculate trig constants
        const BOB_FREQ_1 = Math.PI * 2 / 5.5;
        const BOB_FREQ_2 = Math.PI * 2 / 3.7;
        const PULSE_FREQ = Math.PI * 2 / 5;

        // Accumulates slow continuous Y rotation separately
        let continuousY = 0;
        // Accumulated "base" orientation that flips modify
        const baseQuat = new THREE.Quaternion();

        let phase = 'idle';               // 'idle' | 'flipping'
        let phaseTimer = 0;
        let nextFlipAt = IDLE_DURATION_MIN + Math.random() * (IDLE_DURATION_MAX - IDLE_DURATION_MIN);
        let flipProgress = 0;
        let wobbleBlend = 1.0;  // Continuous blend for wobble (no snap-back)

        // Pre-build a set of target flip quaternions (relative rotations)
        const flipAxes = [
            new THREE.Vector3(1, 0, 0),
            new THREE.Vector3(0, 1, 0),
            new THREE.Vector3(0, 0, 1),
            new THREE.Vector3(1, 1, 0).normalize(),
            new THREE.Vector3(1, 0, 1).normalize(),
            new THREE.Vector3(0, 1, 1).normalize(),
            new THREE.Vector3(1, -1, 0).normalize(),
            new THREE.Vector3(-1, 0, 1).normalize(),
        ];
        let lastFlipAxisIndex = -1;

        // Fast PRNG to avoid expensive Math.random() in hot loops
        let _seed = 42;
        function fastRand() {
            _seed = (_seed * 1664525 + 1013904223) & 0x7fffffff;
            return _seed / 0x7fffffff;
        }

        // ── Custom easing: cubic ease-out (sudden start, smooth stop) ──
        // Starts at full speed → feels "sudden"
        // Decelerates smoothly → never feels "stuck"
        // No overshoot → clean confident landing
        function flipEaseOut(t) {
            if (t <= 0) return 0;
            if (t >= 1) return 1;
            return 1 - Math.pow(1 - t, 3);
        }

        // ── Generate next flip target ──
        function generateFlipTarget() {
            let axisIndex;
            do {
                axisIndex = Math.floor(Math.random() * flipAxes.length);
            } while (axisIndex === lastFlipAxisIndex);
            lastFlipAxisIndex = axisIndex;

            const axis = flipAxes[axisIndex];
            const angleSign = Math.random() > 0.5 ? 1 : -1;
            const flipAngle = (Math.PI / 2 + Math.random() * (Math.PI * 0.22)) * angleSign;

            _relFlip.setFromAxisAngle(axis, flipAngle);
            flipStartQuat.copy(baseQuat);
            targetQuat.copy(baseQuat).multiply(_relFlip);
            targetQuat.normalize();
        }

        // ── Visibility state (declared ahead of animate for correct scoping) ──
        let isInViewport = true;   // Assume visible initially
        let isTabVisible = true;
        let isAnimating = true;    // Controls whether animate() loop runs
        let disposed = false;      // Set true on unmount — prevents stale callbacks

        const animate = () => {
            if (!isAnimating) return;  // Exit early if paused by visibility
            animationFrameId = requestAnimationFrame(animate);
            const delta = Math.min(clock.getDelta(), 0.033); // Cap ~30fps minimum
            const t = clock.getElapsedTime();

            phaseTimer += delta;

            // ═══════════════════════════════════════════════════
            //  STATE MACHINE
            // ═══════════════════════════════════════════════════
            if (phase === 'idle') {
                // Check if it's time for a flip
                if (phaseTimer >= nextFlipAt) {
                    // Transition to flipping
                    phase = 'flipping';
                    phaseTimer = 0;
                    flipProgress = 0;
                    generateFlipTarget();
                }
            } else if (phase === 'flipping') {
                flipProgress = Math.min(phaseTimer / FLIP_DURATION, 1.0);

                if (flipProgress >= 1.0) {
                    // Flip complete → return to idle
                    baseQuat.copy(targetQuat);
                    baseQuat.normalize();
                    phase = 'idle';
                    phaseTimer = 0;
                    // Randomize next flip timing
                    nextFlipAt = IDLE_DURATION_MIN + Math.random() * (IDLE_DURATION_MAX - IDLE_DURATION_MIN);
                }
            }

            // ═══════════════════════════════════════════════════
            //  1. COMPUTE ORIENTATION
            // ═══════════════════════════════════════════════════

            // -- Continuous Y spin (reuse pre-allocated quaternion) --
            continuousY += IDLE_Y_SPEED * delta;
            _spinQuat.setFromAxisAngle(_yAxis, continuousY);

            // -- Base orientation (modified by flips) --
            if (phase === 'flipping') {
                const easedT = flipEaseOut(flipProgress);
                currentQuat.copy(flipStartQuat).slerp(targetQuat, easedT);
            } else {
                currentQuat.copy(baseQuat);
            }

            // -- Idle wobble (reuse pre-allocated quaternions) --
            const wobbleX = Math.sin(t * 0.73) * IDLE_WOBBLE_AMP * deg +
                Math.sin(t * 0.47) * (IDLE_WOBBLE_AMP * 0.5) * deg;
            const wobbleZ = Math.sin(t * 0.59) * (IDLE_WOBBLE_AMP * 0.7) * deg +
                Math.sin(t * 0.31) * (IDLE_WOBBLE_AMP * 0.3) * deg;

            // Continuous wobble blend — no discontinuous snap-back.
            // Fades out fast (rate=8) when flip starts, fades back in
            // gradually (rate=3, ~0.5s) after flip lands.
            const wobbleTarget = phase === 'flipping' ? 0.0 : 1.0;
            const blendRate = wobbleTarget > wobbleBlend ? 3.0 : 8.0;
            wobbleBlend += (wobbleTarget - wobbleBlend) * (1 - Math.exp(-blendRate * delta));

            _wobbleQuatX.setFromAxisAngle(_xAxis, wobbleX * wobbleBlend);
            _wobbleQuatZ.setFromAxisAngle(_zAxis, wobbleZ * wobbleBlend);

            // -- Compose final orientation (zero allocations) --
            displayQuat.copy(_spinQuat)
                .multiply(currentQuat)
                .multiply(_wobbleQuatX)
                .multiply(_wobbleQuatZ);

            outerGroup.quaternion.copy(displayQuat);

            // ═══════════════════════════════════════════════════
            //  2. FLOATING BOB — weightless suspension
            //     Two overlapping vertical sines for organic float
            // ═══════════════════════════════════════════════════
            const bobPrimary = Math.sin(t * BOB_FREQ_1) * 0.022;
            const bobSecondary = Math.sin(t * BOB_FREQ_2) * 0.010;
            outerGroup.position.y = baseY + bobPrimary + bobSecondary;

            // ═══════════════════════════════════════════════════
            //  3. EMISSIVE PULSE — breathing glow (5s cycle)
            // ═══════════════════════════════════════════════════
            const pulse = (Math.sin(t * PULSE_FREQ) + 1) / 2;
            const emissive = 0.6 + pulse * 0.25;
            for (let i = 0; i < screenMatsLen; i++) screenMats[i].emissiveIntensity = emissive;

            // Subtle glint (16s cycle)
            const glintCycle = (t % 16) / 16;
            const glintPower = Math.pow(Math.max(0, 1 - Math.abs(glintCycle - 0.5) * 30), 2);
            glintLight.intensity = glintPower * 6.0;

            // ═══════════════════════════════════════════════════
            //  4. PARTICLE PHYSICS
            // ═══════════════════════════════════════════════════
            // Particle physics — optimized: cached lookups, fast PRNG, no sqrt for far particles
            const positions = particlesGeo.attributes.position.array;
            const gpx = outerGroup.position.x;
            const gpy = outerGroup.position.y;
            const gpz = outerGroup.position.z;
            const edgeWake = 1 + glintPower * 4.0;

            // Frame-rate independent damping: equivalent to 0.92/frame at 60fps
            // but correct at any frame rate.  ln(0.92)*60 ≈ -5.0
            const dampFactor = Math.exp(-5.0 * delta);

            for (let i = 0; i < particleCount; i++) {
                const ix = i * 3, iy = ix + 1, iz = ix + 2;
                const px = positions[ix], py = positions[iy], pz = positions[iz];

                const dx = px - gpx;
                const dy = py - gpy;
                const dz = pz - gpz;
                const distSq = dx * dx + dy * dy + dz * dz;

                // Skip expensive sqrt for distant particles (>4 units away)
                if (distSq > 16) {
                    // Only apply spring-back
                    particleVel[ix] += (particleBase[ix] - px) * 0.2 * delta;
                    particleVel[iy] += (particleBase[iy] - py) * 0.2 * delta;
                    particleVel[iz] += (particleBase[iz] - pz) * 0.2 * delta;
                } else {
                    const dist = Math.sqrt(distSq);
                    const invDist = 1 / dist;
                    const pushFactor = Math.max(0, 2.5 - dist) * 1.2;

                    if (fastRand() > 0.99 && dist < 3.5) {
                        const pull = 1.5 * delta * invDist;
                        particleVel[ix] -= dx * pull;
                        particleVel[iy] -= dy * pull;
                        particleVel[iz] -= dz * pull;
                    } else {
                        const push = pushFactor * edgeWake * delta * invDist;
                        particleVel[ix] += dx * push;
                        particleVel[iy] += dy * push;
                        particleVel[iz] += dz * push;
                    }

                    particleVel[ix] += (particleBase[ix] - px) * 0.2 * delta;
                    particleVel[iy] += (particleBase[iy] - py) * 0.2 * delta;
                    particleVel[iz] += (particleBase[iz] - pz) * 0.2 * delta;
                }

                positions[ix] += particleVel[ix] * delta;
                positions[iy] += particleVel[iy] * delta;
                positions[iz] += particleVel[iz] * delta;

                particleVel[ix] *= dampFactor;
                particleVel[iy] *= dampFactor;
                particleVel[iz] *= dampFactor;
            }
            particlesGeo.attributes.position.needsUpdate = true;

            // Core light pulse
            coreLight.intensity = 1.0 + pulse * 1.2;

            // Update shader uniforms
            for (let i = 0; i < allShaderMatsLen; i++) allShaderMats[i].uniforms.time.value = t;

            // ═══════════════════════════════════════════════════
            //  5. DYNAMIC UV ROTATION — keep videos upright on screen
            //
            //  For each face, compute the angle between the static UV
            //  "up" direction (now in world space) and the camera's "up"
            //  projected onto the face plane. Set texture.rotation to
            //  counter-rotate, keeping the video right-side-up.
            // ═══════════════════════════════════════════════════
            const currentQ = outerGroup.quaternion;

            for (let i = 0; i < 8; i++) {
                const fd = faceUvData[i];

                // Transform face normal to world space
                _worldNormal.copy(fd.normal).applyQuaternion(currentQ);

                // Skip back-facing faces (optimization: dot with view dir)
                _viewDir.subVectors(camera.position, outerGroup.position).normalize();
                if (_worldNormal.dot(_viewDir) < -0.15) continue;

                // Transform static UV up/right to world space
                _worldUvUp.copy(fd.uvUp).applyQuaternion(currentQ);
                _worldUvRight.copy(fd.uvRight).applyQuaternion(currentQ);

                // Desired up: camera's Y projected onto the face plane
                const nDotCam = _camUp.dot(_worldNormal);
                _desiredUp.copy(_camUp)
                    .addScaledVector(_worldNormal, -nDotCam);

                if (_desiredUp.lengthSq() < 1e-6) {
                    // Face looks straight up/down — use camera right as fallback
                    _desiredUp.set(1, 0, 0)
                        .addScaledVector(_worldNormal, -_worldNormal.x);
                }
                _desiredUp.normalize();

                // Angle from current static UV up to desired screen up
                // in the face plane, using (uvRight, uvUp) as local 2D frame
                const cosA = _desiredUp.dot(_worldUvUp);
                const sinA = _desiredUp.dot(_worldUvRight);
                const targetAngle = Math.atan2(sinA, cosA);

                // Smooth interpolation for buttery transitions during flips
                let angle = _prevAngles[i];
                // Handle angle wrapping for smooth lerp
                let diff = targetAngle - angle;
                if (diff > Math.PI) diff -= Math.PI * 2;
                if (diff < -Math.PI) diff += Math.PI * 2;
                angle += diff * (1 - Math.exp(-12 * delta));  // Frame-rate independent exponential smoothing
                _prevAngles[i] = angle;

                // Apply as texture rotation (negated: rotating UVs CW
                // makes the visible texture rotate CCW, which is what we want)
                videoTextures[i].rotation = -angle;
            }

            // ── RENDER ── (autoClear = true handles clearing automatically)
            renderer.render(scene, camera);
        };

        animate();

        // ─────────────────────────────────────────────────────────
        //  VISIBILITY MANAGEMENT
        //
        //  Three-layer system for ultimate performance:
        //
        //  Layer 1 — IntersectionObserver:
        //    Detects when octahedron scrolls in/out of viewport.
        //    Uses rootMargin "200px" so videos pre-start 200px
        //    BEFORE the octahedron scrolls into view, ensuring
        //    seamless playback with no visible loading.
        //
        //  Layer 2 — Page Visibility API:
        //    Detects when the browser tab is hidden/shown.
        //    Pauses EVERYTHING when tab is not active.
        //
        //  Layer 3 — Clock pause/resume:
        //    When pausing, we stop the THREE.Clock so elapsed
        //    time doesn't jump. When resuming, the animation
        //    continues from the exact frame it left off —
        //    perfectly seamless to the user.
        //
        //  Combined savings when off-screen:
        //    • 0 requestAnimationFrame calls (loop fully stopped)
        //    • 0 video decode operations (all 8 videos paused)
        //    • 0 GPU draw calls
        //    • 0 CPU for particle physics
        // ─────────────────────────────────────────────────────────

        function startPlayback() {
            if (disposed) return;  // Guard: component already unmounted
            videos.forEach(v => v.play().catch(() => { }));
            if (!isAnimating) {
                isAnimating = true;
                clock.start();  // Resume clock from where it was
                animate();
            }
        }

        function stopPlayback() {
            videos.forEach(v => v.pause());
            if (isAnimating) {
                isAnimating = false;
                cancelAnimationFrame(animationFrameId);
                clock.stop();  // Freeze clock so no time jump on resume
            }
        }

        function updateVisibility() {
            if (isInViewport && isTabVisible) {
                startPlayback();
            } else {
                stopPlayback();
            }
        }

        // Layer 1: IntersectionObserver — viewport scroll detection
        // rootMargin: "200px" means we start 200px BEFORE the element
        // enters the viewport, giving videos time to buffer and start
        const observer = new IntersectionObserver(
            (entries) => {
                isInViewport = entries[0].isIntersecting;
                updateVisibility();
            },
            {
                rootMargin: '200px 0px',  // Pre-trigger 200px above/below
                threshold: 0,
            }
        );
        observer.observe(container);

        // Layer 2: Page Visibility API — tab switch detection
        const handleVisibilityChange = () => {
            isTabVisible = !document.hidden;
            updateVisibility();
        };
        document.addEventListener('visibilitychange', handleVisibilityChange);

        // Trigger initial visibility check
        isInViewport = true;  // Assume visible initially
        updateVisibility();

        // ─────────────────────────────────────────────────────────
        //  RESIZE — debounced to avoid layout thrash
        // ─────────────────────────────────────────────────────────
        let resizeTimer;
        const handleResize = () => {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(() => {
                if (disposed || !container.isConnected) return;
                const nw = container.clientWidth;
                const nh = container.clientHeight || 500;
                camera.aspect = nw / nh;
                camera.updateProjectionMatrix();
                renderer.setSize(nw, nh);
            }, 100);
        };

        window.addEventListener("resize", handleResize);

        return () => {
            // ── CRITICAL: stop the render loop immediately ──
            // Without this, a pending RAF callback could fire after
            // disposal and try to render to a dead WebGL context.
            disposed = true;
            isAnimating = false;
            cancelAnimationFrame(animationFrameId);

            // Detach observers and listeners
            observer.disconnect();
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            window.removeEventListener("resize", handleResize);
            clearTimeout(resizeTimer);

            // Remove canvas from DOM using the captured container ref
            // (mountRef.current may already be null during Next.js unmount)
            if (container.contains(renderer.domElement)) {
                container.removeChild(renderer.domElement);
            }

            // Traverse the entire scene graph and dispose every
            // geometry + material.  Without this, ShaderMaterials,
            // MeshPhysicalMaterials, and ShapeGeometries leak GPU memory.
            scene.traverse((obj) => {
                if (obj.geometry) obj.geometry.dispose();
                if (obj.material) {
                    if (Array.isArray(obj.material)) {
                        obj.material.forEach(m => m.dispose());
                    } else {
                        obj.material.dispose();
                    }
                }
            });

            renderer.dispose();
            videos.forEach((v) => { v.pause(); v.src = ""; v.load(); });
            videoTextures.forEach((t) => t.dispose());
        };
    }, []);

    return <div ref={mountRef} className="w-full h-full min-h-[500px] md:min-h-[600px] flex items-center justify-center" />;
}
