import { useRef, useEffect, useMemo, useState, Suspense } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { Html, Float, ContactShadows } from '@react-three/drei'
import { toonGradient } from './toonGradient'
import ToonCharacter from './ToonCharacter'
import ChatBox from './ChatBox'
import { ZONES, ZONE_POS } from '../zones'
import { EXPERIENCE, PROJECTS, EDUCATION, SKILL_GROUPS } from '../portfolioData'

// ─── Constants ────────────────────────────────────────────────────────────────
const MOVE_SPEED   = 4.4
const ROT_LERP     = 0.18
const ENTER_RADIUS = 4.4
const VIEW_DIST    = 5.4
const STAGE_EXTRA  = 3.0
const PLAYER_R     = 0.45
const CAM_OFFSET   = new THREE.Vector3(0, 4.6, 8)
const CAM_LERP     = 0.07
const SPAWN        = [0, 0, 6]

function Toon({ color, ...rest }) {
  return <meshToonMaterial color={color} gradientMap={toonGradient()} {...rest} />
}

function faceTo(g, mx, mz, delta) {
  const target = Math.atan2(mx, mz)
  let d = target - g.rotation.y
  if (d > Math.PI) d -= 2 * Math.PI
  if (d < -Math.PI) d += 2 * Math.PI
  g.rotation.y += d * (1 - Math.pow(1 - ROT_LERP, delta * 60))
}

// ─── Character controller ───────────────────────────────────────────────────────
function Character({
  groupRef, keysRef, activeZone, onNearChange, onLeaveZone, playerPosRef, travelRef,
  obstacles, onModelClick, chatOpen, onAsk, isLoading, onCloseChat,
}) {
  const gaitRef = useRef(0)
  const nearRef = useRef(null)
  const autoRef = useRef(null)
  const lastTravel = useRef(0)
  const leftRef = useRef(false)
  const locked = !!activeZone

  useEffect(() => {
    if (!groupRef.current) return
    groupRef.current.position.set(...SPAWN)
    groupRef.current.rotation.set(0, 0, 0)
  }, [groupRef])

  useEffect(() => {
    if (activeZone) {
      const p = ZONE_POS[activeZone]
      const len = Math.hypot(p[0], p[2]) || 1
      const k = (len - VIEW_DIST) / len
      autoRef.current = { x: p[0] * k, z: p[2] * k, isle: p }
    } else {
      autoRef.current = null
    }
  }, [activeZone])

  useFrame((_, delta) => {
    const g = groupRef.current
    if (!g) return
    const pos = g.position

    // fast-travel teleport
    const tv = travelRef?.current
    if (tv && tv.n !== lastTravel.current) {
      lastTravel.current = tv.n
      const p = ZONE_POS[tv.zone]
      if (p) {
        const len = Math.hypot(p[0], p[2]) || 1
        const k = (len - VIEW_DIST - STAGE_EXTRA) / len
        pos.set(p[0] * k, 0, p[2] * k)
        faceTo(g, p[0] - pos.x, p[2] - pos.z, 1)
      }
    }

    let mx = 0, mz = 0, moving = false
    if (locked) {
      // Walk away to leave: any movement input while inside exits the island.
      const k = keysRef.current
      if (k.f || k.b || k.l || k.r) {
        if (!leftRef.current) { leftRef.current = true; onLeaveZone?.() }
      }
      const a = autoRef.current
      if (a) {
        const dx = a.x - pos.x, dz = a.z - pos.z
        const d = Math.hypot(dx, dz)
        if (d > 0.12) { mx = dx / d; mz = dz / d; moving = true }
        else faceTo(g, a.isle[0] - pos.x, a.isle[2] - pos.z, delta)
      }
    } else {
      leftRef.current = false
      const k = keysRef.current
      mx = k.r - k.l; mz = k.b - k.f
      if (mx || mz) moving = true
    }

    if (moving) {
      const len = Math.hypot(mx, mz)
      mx /= len; mz /= len
      const spd = locked ? MOVE_SPEED * 0.85 : MOVE_SPEED
      pos.x += mx * spd * delta
      pos.z += mz * spd * delta
      faceTo(g, mx, mz, delta)

      // collision — push out of any overlapping obstacle (free-roam only)
      if (!locked && obstacles) {
        for (const o of obstacles) {
          const ox = pos.x - o.x, oz = pos.z - o.z
          const od = Math.hypot(ox, oz)
          const min = o.r + PLAYER_R
          if (od < min && od > 1e-4) {
            pos.x = o.x + (ox / od) * min
            pos.z = o.z + (oz / od) * min
          }
        }
      }
    }

    gaitRef.current = THREE.MathUtils.lerp(gaitRef.current, moving ? 1 : 0, 1 - Math.pow(0.0005, delta))
    if (playerPosRef) { playerPosRef.current.x = pos.x; playerPosRef.current.z = pos.z }

    if (!locked) {
      let near = null, best = ENTER_RADIUS
      for (const z of ZONES) {
        const d = Math.hypot(z.position[0] - pos.x, z.position[2] - pos.z)
        if (d < best) { best = d; near = z.name }
      }
      if (near !== nearRef.current) { nearRef.current = near; onNearChange(near) }
    }
  })

  return (
    <group
      ref={groupRef}
      onClick={(e) => { e.stopPropagation(); onModelClick?.() }}
      onPointerOver={() => (document.body.style.cursor = 'pointer')}
      onPointerOut={() => (document.body.style.cursor = 'auto')}
    >
      <ToonCharacter gaitRef={gaitRef} />
      {chatOpen && (
        <Html position={[0, 2.55, 0]} center distanceFactor={7} zIndexRange={[60, 40]}>
          <ChatBox onAsk={onAsk} isLoading={isLoading} onClose={onCloseChat} />
        </Html>
      )}
    </group>
  )
}

// ─── Follow camera ──────────────────────────────────────────────────────────────
function FollowCamera({ characterRef, focusPos }) {
  const desired = useRef(new THREE.Vector3())
  const lookAt  = useRef(new THREE.Vector3(0, 1, 0))
  const snapped = useRef(false)

  useFrame((state) => {
    if (focusPos) {
      const isle = new THREE.Vector3(focusPos[0], 0, focusPos[2])
      const inward = isle.clone().normalize().multiplyScalar(-1)
      desired.current.copy(isle).addScaledVector(inward, 7.5).setY(4.4)
      lookAt.current.lerp({ x: isle.x, y: 2.4, z: isle.z }, 0.12)
      state.camera.position.lerp(desired.current, CAM_LERP)
      state.camera.lookAt(lookAt.current)
      return
    }
    if (!characterRef.current) { state.camera.lookAt(0, 1, 0); return }
    const cp = characterRef.current.position
    desired.current.set(cp.x, cp.y, cp.z).add(CAM_OFFSET)
    if (!snapped.current) {
      state.camera.position.copy(desired.current)
      lookAt.current.set(cp.x, cp.y + 1, cp.z)
      snapped.current = true
    }
    state.camera.position.lerp(desired.current, CAM_LERP)
    lookAt.current.lerp({ x: cp.x, y: cp.y + 1.1, z: cp.z }, 0.1)
    state.camera.lookAt(lookAt.current)
  })
  return null
}

// ─── Animated themed prop per island ────────────────────────────────────────────
function ZoneProp({ name, color, active }) {
  const spin = useRef()
  useFrame((s) => { if (spin.current) spin.current.rotation.y = s.clock.elapsedTime * (active ? 1.2 : 0.5) })
  switch (name) {
    case 'experience':
      return (
        <group>
          {[0, 0.7, 1.3].map((y, i) => (
            <Float key={i} speed={2} floatIntensity={active ? 0.5 : 0.2} rotationIntensity={0}>
              <mesh position={[0, 0.7 + y, 0]} castShadow>
                <boxGeometry args={[1.1 - i * 0.25, 0.5, 0.8 - i * 0.15]} />
                <Toon color={color} emissive={active ? color : '#000'} emissiveIntensity={active ? 0.3 : 0} />
              </mesh>
            </Float>
          ))}
        </group>
      )
    case 'projects':
      return (
        <group ref={spin} position={[0, 1.2, 0]}>
          {[0, 1, 2].map((i) => {
            const a = (i * Math.PI * 2) / 3
            return (
              <mesh key={i} position={[Math.cos(a) * 0.9, Math.sin(i) * 0.2, Math.sin(a) * 0.9]} castShadow rotation={[0, a, 0]}>
                <boxGeometry args={[0.65, 0.65, 0.65]} />
                <Toon color={color} emissive={active ? color : '#000'} emissiveIntensity={active ? 0.3 : 0} />
              </mesh>
            )
          })}
          <mesh castShadow>
            <icosahedronGeometry args={[0.45, 0]} />
            <Toon color="#ffffff" emissive={color} emissiveIntensity={active ? 0.5 : 0.15} />
          </mesh>
        </group>
      )
    case 'education':
      return (
        <group>
          <mesh position={[0, 1.0, 0]} castShadow>
            <cylinderGeometry args={[0.45, 0.6, 1.0, 24]} />
            <Toon color="#ffffff" />
          </mesh>
          <mesh position={[0, 1.6, 0]} castShadow>
            <boxGeometry args={[1.4, 0.12, 1.4]} />
            <Toon color={color} />
          </mesh>
          <Float speed={3} floatIntensity={active ? 0.7 : 0.4} rotationIntensity={1.5}>
            <mesh position={[0, 2.3, 0]} castShadow ref={spin}>
              <octahedronGeometry args={[0.32]} />
              <Toon color={color} emissive={color} emissiveIntensity={active ? 0.8 : 0.4} />
            </mesh>
          </Float>
        </group>
      )
    case 'techstack':
      return (
        <group>
          <mesh position={[0, 0.8, 0]} castShadow>
            <cylinderGeometry args={[0.12, 0.2, 0.5, 16]} />
            <Toon color="#ffffff" />
          </mesh>
          <Float speed={2} floatIntensity={active ? 0.4 : 0.15} rotationIntensity={0.4}>
            <group position={[0, 1.6, 0]}>
              <mesh castShadow>
                <boxGeometry args={[1.7, 1.15, 0.18]} />
                <Toon color={color} />
              </mesh>
              <mesh position={[0, 0, 0.1]}>
                <boxGeometry args={[1.45, 0.9, 0.02]} />
                <Toon color="#ffffff" emissive={color} emissiveIntensity={active ? 0.7 : 0.35} />
              </mesh>
            </group>
          </Float>
        </group>
      )
    default:
      return null
  }
}

// ─── Floating in-world content (shown on enter, replaces the side panel) ─────────
function ZoneContent({ name, color }) {
  let rows = null
  if (name === 'experience') {
    rows = EXPERIENCE.map((j, i) => (
      <div key={i} className="zf-card">
        <strong>{j.role}</strong>
        <em>{j.company} · {j.duration}</em>
        <ul>{j.bullets.slice(0, 2).map((b, k) => <li key={k}>{b}</li>)}</ul>
      </div>
    ))
  } else if (name === 'projects') {
    rows = PROJECTS.map((p, i) => (
      <div key={i} className="zf-card">
        <strong>{p.title}</strong>
        <em>{p.metrics}</em>
        <p>{p.description}</p>
        <div className="zf-tags">{p.tags.map((t) => <span key={t}>{t}</span>)}</div>
        {(p.github || p.demo) && (
          <div className="zf-links">
            {p.github && <a href={p.github} target="_blank" rel="noreferrer">GitHub ↗</a>}
            {p.demo && <a href={p.demo} target="_blank" rel="noreferrer">Demo ↗</a>}
          </div>
        )}
      </div>
    ))
  } else if (name === 'education') {
    rows = EDUCATION.map((e, i) => (
      <div key={i} className="zf-card">
        <strong>{e.degree}</strong>
        <em>{e.institution} · {e.year} · GPA {e.gpa}</em>
        <ul>{e.highlights.map((h, k) => <li key={k}>{h}</li>)}</ul>
      </div>
    ))
  } else if (name === 'techstack') {
    rows = SKILL_GROUPS.map((g) => (
      <div key={g.label} className="zf-card">
        <strong>{g.label}</strong>
        <div className="zf-tags">{g.items.map((t) => <span key={t}>{t}</span>)}</div>
      </div>
    ))
  }
  const title = name === 'techstack' ? 'Tech Stack' : name[0].toUpperCase() + name.slice(1)
  return (
    <div className="zone-float" style={{ '--c': color }} onPointerDown={(e) => e.stopPropagation()}>
      <div className="zone-float-title">{title}</div>
      <div className="zone-float-scroll">{rows}</div>
      <div className="zone-float-hint">Walk away to leave ✿</div>
    </div>
  )
}

// ─── Interactive island ─────────────────────────────────────────────────────────
function ZoneArea({ position, color, title, name, active, onSelect }) {
  const grp = useRef()
  const [hovered, setHovered] = useState(false)
  // local inward direction (toward origin) for placing the floating content
  const len = Math.hypot(position[0], position[2]) || 1
  const inward = [-position[0] / len, -position[2] / len]

  useFrame(() => {
    if (!grp.current) return
    const target = hovered || active ? 1.06 : 1
    grp.current.scale.setScalar(THREE.MathUtils.lerp(grp.current.scale.x, target, 0.12))
  })

  useEffect(() => {
    if (hovered) document.body.style.cursor = 'pointer'
    return () => { document.body.style.cursor = 'auto' }
  }, [hovered])

  return (
    <group position={position}>
      <group
        ref={grp}
        onPointerOver={(e) => { e.stopPropagation(); setHovered(true) }}
        onPointerOut={() => setHovered(false)}
        onClick={(e) => { e.stopPropagation(); onSelect(name) }}
      >
        <mesh position={[0, -0.7, 0]} castShadow>
          <coneGeometry args={[2.6, 2.0, 32]} />
          <Toon color="#caa98a" />
        </mesh>
        <mesh position={[0, 0.2, 0]} receiveShadow castShadow>
          <cylinderGeometry args={[2.7, 2.6, 0.6, 32]} />
          <Toon color={color} emissive={color} emissiveIntensity={active ? 0.3 : hovered ? 0.18 : 0} />
        </mesh>
        <mesh position={[0, 0.52, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[2.45, 2.7, 48]} />
          <meshBasicMaterial color="#ffffff" transparent opacity={hovered || active ? 0.5 : 0.18} />
        </mesh>
        <ZoneProp name={name} color={color} active={active} />
      </group>

      {!active && (
        <Html position={[0, 4.0, 0]} center pointerEvents="none" zIndexRange={[20, 0]}>
          <div className="zone-3d-label" style={{ '--c': color, borderColor: color }}>{title}</div>
        </Html>
      )}

      {active && (
        <Html position={[inward[0] * 2.4, 3.0, inward[1] * 2.4]} center zIndexRange={[40, 20]}>
          <ZoneContent name={name} color={color} />
        </Html>
      )}

      <pointLight color={color} intensity={active ? 2.6 : hovered ? 1.8 : 1.0} distance={active ? 12 : 8} decay={2} position={[0, 2, 0]} />
    </group>
  )
}

// ─── Central holographic map ────────────────────────────────────────────────────
function CentralMap() {
  const disc = useRef()
  useFrame((s) => { if (disc.current) disc.current.rotation.y = s.clock.elapsedTime * 0.25 })
  return (
    <group>
      <mesh position={[0, 0.35, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[1.0, 1.25, 0.7, 24]} />
        <Toon color="#b8b1c4" />
      </mesh>
      <group ref={disc} position={[0, 0.85, 0]}>
        <mesh rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[0.95, 40]} />
          <meshBasicMaterial color="#79e7ff" transparent opacity={0.4} side={THREE.DoubleSide} />
        </mesh>
        {ZONES.map((z) => {
          const len = Math.hypot(z.position[0], z.position[2]) || 1
          return (
            <Float key={z.name} speed={4} floatIntensity={0.6} rotationIntensity={0}>
              <mesh position={[(z.position[0] / len) * 0.7, 0.25, (z.position[2] / len) * 0.7]}>
                <coneGeometry args={[0.1, 0.26, 6]} />
                <Toon color={z.color} emissive={z.color} emissiveIntensity={0.7} />
              </mesh>
            </Float>
          )
        })}
      </group>
      <pointLight color="#9fe9ff" intensity={1.4} distance={6} position={[0, 1.6, 0]} />
      <Html position={[0, 2.0, 0]} center pointerEvents="none" zIndexRange={[20, 0]}>
        <div className="zone-3d-label" style={{ '--c': '#79e7ff', borderColor: '#79e7ff', fontSize: '10px' }}>WORLD MAP</div>
      </Html>
    </group>
  )
}

// ─── Paths ────────────────────────────────────────────────────────────────────────
function Paths() {
  return (
    <group>
      {ZONES.map((z) => {
        const len = Math.hypot(z.position[0], z.position[2]) || 1
        const ang = Math.atan2(z.position[0], z.position[2])
        return (
          <group key={z.name} rotation={[0, ang, 0]}>
            <mesh position={[0, 0.015, len / 2]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
              <planeGeometry args={[1.6, len - 3]} />
              <meshToonMaterial color="#d9c39a" gradientMap={toonGradient()} />
            </mesh>
          </group>
        )
      })}
    </group>
  )
}

// ─── Scenery ──────────────────────────────────────────────────────────────────────
function Tree({ position, scale = 1 }) {
  return (
    <group position={position} scale={scale}>
      <mesh position={[0, 0.5, 0]} castShadow>
        <cylinderGeometry args={[0.16, 0.22, 1.0, 10]} />
        <Toon color="#8a5a36" />
      </mesh>
      <mesh position={[0, 1.4, 0]} castShadow>
        <coneGeometry args={[0.85, 1.3, 12]} />
        <Toon color="#39b85a" />
      </mesh>
      <mesh position={[0, 2.1, 0]} castShadow>
        <coneGeometry args={[0.6, 1.0, 12]} />
        <Toon color="#48c96a" />
      </mesh>
    </group>
  )
}

function Decor({ trees, rocks, blooms }) {
  return (
    <group>
      {trees.map((t, i) => <Tree key={i} position={[t.x, 0, t.z]} scale={t.s} />)}
      {rocks.map((r, i) => (
        <mesh key={i} position={[r.x, 0.25, r.z]} rotation={[0.3, i, 0.2]} castShadow>
          <icosahedronGeometry args={[0.5, 0]} />
          <Toon color="#9aa6ad" />
        </mesh>
      ))}
      {blooms.map((b, i) => (
        <group key={i} position={[b.x, 0, b.z]}>
          <mesh position={[0, 0.18, 0]}>
            <cylinderGeometry args={[0.02, 0.02, 0.36, 6]} />
            <Toon color="#3aa052" />
          </mesh>
          <mesh position={[0, 0.38, 0]}>
            <sphereGeometry args={[0.09, 12, 12]} />
            <Toon color={['#ff6fae', '#ffd23e', '#7ec8ff', '#ff8a4c'][i % 4]} />
          </mesh>
        </group>
      ))}
    </group>
  )
}

// ─── Infinite terrain (ground + hills + clouds follow the player) ────────────────
function Terrain({ playerPosRef }) {
  const grp = useRef()
  const hills = useMemo(() => {
    const out = []
    const n = 16
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2
      const r = 50 + (i % 3) * 5
      out.push([Math.cos(a) * r, Math.sin(a) * r, 5 + (i % 4)])
    }
    return out
  }, [])
  const clouds = useMemo(
    () => [[-18, 11, -12, 1.8], [17, 13, -8, 2.2], [-14, 13, 14, 1.6], [19, 11, 10, 2.0], [0, 15, -20, 2.6], [-6, 14, 18, 1.8]],
    []
  )
  useFrame(() => {
    if (grp.current && playerPosRef) {
      grp.current.position.x = playerPosRef.current.x
      grp.current.position.z = playerPosRef.current.z
    }
  })
  return (
    <group ref={grp}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <circleGeometry args={[70, 80]} />
        <Toon color="#58cf6a" />
      </mesh>
      {hills.map(([x, z, s], i) => (
        <mesh key={i} position={[x, -1, z]} castShadow>
          <sphereGeometry args={[s, 20, 12]} />
          <Toon color={i % 2 ? '#7fd98a' : '#69cf78'} />
        </mesh>
      ))}
      {clouds.map(([x, y, z, s], i) => (
        <Float key={i} speed={1} rotationIntensity={0} floatIntensity={0.6} floatingRange={[-0.4, 0.4]}>
          <group position={[x, y, z]} scale={s}>
            {[[0, 0, 0, 0.8], [0.7, -0.1, 0, 0.6], [-0.7, -0.1, 0, 0.6], [0.3, 0.3, 0.2, 0.5]].map(([px, py, pz, r], j) => (
              <mesh key={j} position={[px, py, pz]}>
                <sphereGeometry args={[r, 16, 16]} />
                <meshBasicMaterial color="#ffffff" transparent opacity={0.95} />
              </mesh>
            ))}
          </group>
        </Float>
      ))}
    </group>
  )
}

function HomeMarker() {
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]} receiveShadow>
        <circleGeometry args={[2.6, 48]} />
        <Toon color="#ffe1ec" />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.03, 0]}>
        <ringGeometry args={[2.5, 2.64, 48]} />
        <meshBasicMaterial color="#ff5fa2" transparent opacity={0.85} />
      </mesh>
    </group>
  )
}

// ─── Scene root ──────────────────────────────────────────────────────────────────
export default function Scene({
  keysRef, activeZone, onNearChange, onSelectZone, onLeaveZone, playerPosRef, travelRef,
  onModelClick, chatOpen, onAsk, isLoading, onCloseChat,
}) {
  const characterRef = useRef()
  const focusPos = activeZone ? ZONE_POS[activeZone] : null

  // Fixed scenery + collision obstacles (generated once).
  const { trees, rocks, blooms, obstacles } = useMemo(() => {
    const trees = []
    const n = 26
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2
      const nearAxis = [0, Math.PI / 2, Math.PI, -Math.PI / 2].some(
        (ax) => Math.abs(Math.atan2(Math.sin(a - ax), Math.cos(a - ax))) < 0.28
      )
      if (nearAxis) continue
      const r = 16 + (i % 5) * 2.4
      trees.push({ x: Math.cos(a) * r, z: Math.sin(a) * r, s: 0.85 + (i % 4) * 0.18 })
    }
    const rocks = [[-12, -5], [11, 6], [-6, 13], [7, -14], [14, 10], [-15, -9], [5, 9], [-9, 4]]
      .map(([x, z]) => ({ x, z }))
    const blooms = [[-4, 3], [5, -3], [-7, 7], [8, 5], [3, 8], [-8, -5], [4, 4], [-3, -7], [9, -2], [-11, 2], [6, 11], [-5, -10]]
      .map(([x, z]) => ({ x, z }))

    const obstacles = [
      ...ZONES.map((z) => ({ x: z.position[0], z: z.position[2], r: 3.0 })),
      { x: 0, z: 0, r: 1.6 }, // central map
      ...trees.map((t) => ({ x: t.x, z: t.z, r: 0.5 * t.s })),
      ...rocks.map((r) => ({ x: r.x, z: r.z, r: 0.6 })),
    ]
    return { trees, rocks, blooms, obstacles }
  }, [])

  return (
    <Canvas
      shadows
      gl={{ antialias: true, powerPreference: 'high-performance' }}
      camera={{ position: [0, 4.6, 8], fov: 50 }}
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', zIndex: 1 }}
    >
      <color attach="background" args={['#bfe9ff']} />
      <fog attach="fog" args={['#cfeeff', 48, 110]} />

      <hemisphereLight color="#eaf6ff" groundColor="#7fd98a" intensity={1.35} />
      <ambientLight color="#ffffff" intensity={0.8} />
      <directionalLight
        color="#fff4dd"
        intensity={3.3}
        position={[14, 22, 10]}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-near={0.1}
        shadow-camera-far={120}
        shadow-camera-left={-44}
        shadow-camera-right={44}
        shadow-camera-top={44}
        shadow-camera-bottom={-44}
        shadow-bias={-0.001}
      />
      <directionalLight color="#bcd8ff" intensity={0.5} position={[-12, 8, -12]} />

      <Suspense fallback={null}>
        <Character
          groupRef={characterRef}
          keysRef={keysRef}
          activeZone={activeZone}
          onNearChange={onNearChange}
          onLeaveZone={onLeaveZone}
          playerPosRef={playerPosRef}
          travelRef={travelRef}
          obstacles={obstacles}
          onModelClick={onModelClick}
          chatOpen={chatOpen}
          onAsk={onAsk}
          isLoading={isLoading}
          onCloseChat={onCloseChat}
        />
        {ZONES.map((zone) => (
          <ZoneArea key={zone.name} {...zone} active={activeZone === zone.name} onSelect={onSelectZone} />
        ))}
        <CentralMap />
        <Paths />
        <Decor trees={trees} rocks={rocks} blooms={blooms} />
      </Suspense>

      <Terrain playerPosRef={playerPosRef} />
      <HomeMarker />
      <ContactShadows position={[0, 0.02, 0]} opacity={0.26} scale={70} blur={2.6} far={9} color="#2f6b3a" />

      <FollowCamera characterRef={characterRef} focusPos={focusPos} />
    </Canvas>
  )
}
