import { useRef, useEffect, Suspense } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import {
  Environment,
  useGLTF,
  useAnimations,
  Html,
} from '@react-three/drei'
import walkingGlb from '../assets/walking.glb?url'

// ─── Movement / animation constants ──────────────────────────────────────────
const LERP        = 0.05
const ROT_LERP    = 0.12
const ARRIVE_DIST = 0.1
const MOVE_DIST   = 0.08
const WALK_SPEED  = 0.45
const FADE_IN     = 0.25
const FADE_OUT    = 0.35

// ─── Follow-camera constants ──────────────────────────────────────────────────
const CAM_BEHIND    = 6     // units behind character
const CAM_HEIGHT    = 3.5   // units above character
const CAM_POS_LERP  = 0.06  // position smooth factor
const CAM_ROT_LAG   = 0.05  // rotation lag (lower = more lag)
const CAM_LOOK_AHEAD = 1.5  // units ahead of character to look at

// ─── Zone definitions ─────────────────────────────────────────────────────────
const ZONE_CONFIG = [
  { position: [0,  -1, -5], color: '#00f3ff', title: 'EXPERIENCE', name: 'experience' },
  { position: [-6, -1,  0], color: '#00ff88', title: 'PROJECTS',   name: 'projects'   },
  { position: [6,  -1,  0], color: '#aa44ff', title: 'EDUCATION',  name: 'education'  },
  { position: [0,  -1,  5], color: '#ff8800', title: 'TECH STACK', name: 'techstack'  },
]

// ─── Character ────────────────────────────────────────────────────────────────
// groupRef comes from Scene so FollowCamera can read position/rotation directly.
function Character({ groupRef, targetPosition, targetZone, onArrive }) {
  const { scene, animations } = useGLTF(walkingGlb)
  const { actions, names }    = useAnimations(animations, groupRef)

  const walkActionRef = useRef(null)
  const idleActionRef = useRef(null)
  const isMovingRef   = useRef(false)
  const arrivedAtRef  = useRef(null)
  const stopTimerRef  = useRef(null)
  const configuredRef = useRef(false)

  useEffect(() => {
    scene.traverse((child) => {
      if (child.isMesh) { child.castShadow = true; child.receiveShadow = true }
    })
  }, [scene])

  // Imperative initial transform — R3F reconciler would overwrite JSX props on re-render
  useEffect(() => {
    if (!groupRef.current) return
    groupRef.current.position.set(-2.5, -1, 0)
    groupRef.current.rotation.set(0, Math.PI / 2, 0)
  }, [groupRef])

  useEffect(() => {
    if (!names.length) return
    const walkName = names.find(n => /walk|run|move/i.test(n)) ?? names[0]
    const idleName = names.find(n => /idle|stand|neutral|bind/i.test(n)) ?? (names.length > 1 ? names[1] : null)
    walkActionRef.current = actions[walkName] ?? null
    idleActionRef.current = idleName ? (actions[idleName] ?? null) : null
    configuredRef.current = false
  }, [actions, names])

  useEffect(() => () => clearTimeout(stopTimerRef.current), [])

  useFrame(() => {
    if (!groupRef.current) return

    // One-time action config inside useFrame to satisfy react-hooks/immutability
    if (!configuredRef.current && walkActionRef.current) {
      const w  = walkActionRef.current
      const id = idleActionRef.current
      w.loop = THREE.LoopRepeat; w.clampWhenFinished = false; w.timeScale = WALK_SPEED
      if (id) { id.loop = THREE.LoopRepeat; id.clampWhenFinished = false; id.timeScale = WALK_SPEED }
      configuredRef.current = true
    }

    const pos  = groupRef.current.position
    const [tx, ty, tz] = targetPosition
    const dx   = tx - pos.x
    const dy   = ty - pos.y
    const dz   = tz - pos.z
    const dist = Math.sqrt(dx * dx + dz * dz)

    pos.x += dx * LERP
    pos.y += dy * LERP
    pos.z += dz * LERP

    if (dist > MOVE_DIST) {
      const targetRot = Math.atan2(dx, dz)
      let delta = targetRot - groupRef.current.rotation.y
      if (delta >  Math.PI) delta -= 2 * Math.PI
      if (delta < -Math.PI) delta += 2 * Math.PI
      groupRef.current.rotation.y += delta * ROT_LERP
    }

    const nowMoving = dist > MOVE_DIST
    if (nowMoving !== isMovingRef.current) {
      isMovingRef.current = nowMoving
      const walk = walkActionRef.current
      const idle = idleActionRef.current
      if (nowMoving) {
        clearTimeout(stopTimerRef.current)
        idle?.fadeOut(FADE_IN)
        if (walk) {
          if (!walk.isRunning()) walk.reset().play()
          walk.fadeIn(FADE_IN)
        }
      } else {
        if (walk) {
          walk.fadeOut(FADE_OUT)
          stopTimerRef.current = setTimeout(() => {
            if (!isMovingRef.current) walk.stop()
          }, FADE_OUT * 1000 + 50)
        }
        if (idle) idle.reset().fadeIn(FADE_OUT).play()
      }
    }

    if (dist < ARRIVE_DIST && arrivedAtRef.current !== targetZone) {
      arrivedAtRef.current = targetZone
      onArrive(targetZone)
    }
  })

  return (
    <group ref={groupRef}>
      <primitive object={scene} />
    </group>
  )
}

// ─── Follow Camera ────────────────────────────────────────────────────────────
// Sits behind and above the character, rotates with lag, always looks slightly ahead.
function FollowCamera({ characterRef }) {
  const camAngleRef = useRef(null)   // null = not yet initialized
  const lookAtRef   = useRef(new THREE.Vector3())

  useFrame((state) => {
    // While the character GLB is still loading, point camera at scene center
    if (!characterRef.current) {
      state.camera.lookAt(-2.5, -0.5, 0)
      return
    }
    const char     = characterRef.current
    const charRotY = char.rotation.y

    // Snap camera to ideal position on first frame after character loads
    if (camAngleRef.current === null) {
      camAngleRef.current = charRotY + Math.PI
      const ix = char.position.x + Math.sin(camAngleRef.current) * CAM_BEHIND
      const iz = char.position.z + Math.cos(camAngleRef.current) * CAM_BEHIND
      state.camera.position.set(ix, char.position.y + CAM_HEIGHT, iz)
      lookAtRef.current.set(char.position.x, char.position.y + 0.8, char.position.z)
    }

    // Slowly rotate camera angle toward "behind character"
    const targetAngle = charRotY + Math.PI
    let diff = THREE.MathUtils.euclideanModulo(targetAngle - camAngleRef.current + Math.PI, Math.PI * 2) - Math.PI
    camAngleRef.current += diff * CAM_ROT_LAG

    const idealX = char.position.x + Math.sin(camAngleRef.current) * CAM_BEHIND
    const idealY = char.position.y + CAM_HEIGHT
    const idealZ = char.position.z + Math.cos(camAngleRef.current) * CAM_BEHIND

    // Smooth lerp position
    state.camera.position.x += (idealX - state.camera.position.x) * CAM_POS_LERP
    state.camera.position.y += (idealY - state.camera.position.y) * CAM_POS_LERP
    state.camera.position.z += (idealZ - state.camera.position.z) * CAM_POS_LERP

    // Lerp lookAt slightly ahead of character
    const lax = char.position.x + Math.sin(charRotY) * CAM_LOOK_AHEAD
    const lay = char.position.y + 0.8
    const laz = char.position.z + Math.cos(charRotY) * CAM_LOOK_AHEAD
    lookAtRef.current.x += (lax - lookAtRef.current.x) * 0.08
    lookAtRef.current.y += (lay - lookAtRef.current.y) * 0.08
    lookAtRef.current.z += (laz - lookAtRef.current.z) * 0.08

    state.camera.lookAt(lookAtRef.current)
  })

  return null
}

// ─── Zone Area ────────────────────────────────────────────────────────────────
// Glowing floor pad + corner pillars + zone-specific central structure + floating label.
function ZoneArea({ position, color, title, name }) {
  const [x, y, z] = position

  const centralStructure = {
    experience: (
      <group>
        {[-1.1, 0, 1.1].map((xOff, i) => (
          <group key={i} position={[xOff, 0, -0.4]}>
            <mesh position={[0, 1.1, 0]} castShadow>
              <boxGeometry args={[0.6, 2.2, 0.3]} />
              <meshStandardMaterial color="#060c14" metalness={0.85} roughness={0.25} />
            </mesh>
            {Array.from({ length: 7 }).map((_, j) => (
              <mesh key={j} position={[0, 0.25 + j * 0.28, 0.16]}>
                <boxGeometry args={[0.5, 0.04, 0.01]} />
                <meshStandardMaterial
                  emissive={j % 3 === 0 ? '#00f3ff' : j % 3 === 1 ? '#00ff44' : '#0055ff'}
                  emissiveIntensity={1.4}
                  color="black"
                />
              </mesh>
            ))}
          </group>
        ))}
      </group>
    ),
    projects: (
      <group>
        {[
          [-0.6, 0.4, 0, 1.0, 0.8, 0.12],
          [-0.6, 1.35, 0, 0.75, 0.55, 0.12],
          [-0.6, 2.0, 0, 0.5, 0.35, 0.12],
          [0.75, 0.5, 0, 0.9, 1.1, 0.12],
          [0.75, 1.7, 0, 0.65, 0.45, 0.12],
        ].map(([px, py, pz, w, h, d], i) => (
          <mesh key={i} position={[px, py, pz]} castShadow>
            <boxGeometry args={[w, h, d]} />
            <meshStandardMaterial color="#030d06" emissive="#00ff88" emissiveIntensity={0.12} metalness={0.6} roughness={0.4} />
          </mesh>
        ))}
      </group>
    ),
    education: (
      <group>
        {[0, 1, 2].map((step) => (
          <mesh key={step} position={[0, step * 0.55, 0]} castShadow>
            <boxGeometry args={[2.2 - step * 0.6, 0.5, 2.2 - step * 0.6]} />
            <meshStandardMaterial color="#090614" metalness={0.75} roughness={0.3} />
          </mesh>
        ))}
        <mesh position={[0, 1.85, 0]}>
          <octahedronGeometry args={[0.32]} />
          <meshStandardMaterial color="#aa44ff" emissive="#aa44ff" emissiveIntensity={2} />
        </mesh>
      </group>
    ),
    techstack: (
      <group>
        {Array.from({ length: 16 }).map((_, i) => {
          const row = Math.floor(i / 4)
          const col = i % 4
          const active = (row + col) % 2 === 0
          const h = active ? 0.55 : 0.22
          return (
            <mesh key={i} position={[-1.5 + col, h / 2, -1.5 + row]} castShadow>
              <boxGeometry args={[0.4, h, 0.4]} />
              <meshStandardMaterial
                color="#140800"
                emissive="#ff8800"
                emissiveIntensity={active ? 0.6 : 0.1}
                metalness={0.65}
                roughness={0.35}
              />
            </mesh>
          )
        })}
      </group>
    ),
  }[name]

  return (
    <group position={[x, y, z]}>
      {/* Glowing floor pad */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.001, 0]}>
        <planeGeometry args={[6, 6]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.04} transparent opacity={0.18} />
      </mesh>

      {/* Outer glow ring */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.002, 0]}>
        <ringGeometry args={[2.6, 3.0, 32]} />
        <meshStandardMaterial emissive={color} emissiveIntensity={1.8} transparent opacity={0.75} color={color} />
      </mesh>

      {/* Corner pillars */}
      {[[2.2, 2.2], [2.2, -2.2], [-2.2, 2.2], [-2.2, -2.2]].map(([px, pz], i) => (
        <group key={i} position={[px, 0, pz]}>
          <mesh position={[0, 1.3, 0]} castShadow>
            <boxGeometry args={[0.09, 2.6, 0.09]} />
            <meshStandardMaterial color="#0c1220" metalness={0.92} roughness={0.08} />
          </mesh>
          <mesh position={[0, 2.66, 0]}>
            <boxGeometry args={[0.16, 0.12, 0.16]} />
            <meshStandardMaterial emissive={color} emissiveIntensity={2.5} color={color} />
          </mesh>
        </group>
      ))}

      {/* Central structure */}
      {centralStructure}

      {/* Floating zone label */}
      <Html position={[0, 3.4, 0]} center distanceFactor={18}>
        <div className="zone-3d-label" style={{ color, borderColor: color, '--glow': color }}>
          {title}
        </div>
      </Html>

      {/* Zone glow light */}
      <pointLight color={color} intensity={1.5} distance={8} decay={2} position={[0, 1, 0]} />
    </group>
  )
}

// ─── Workstation ──────────────────────────────────────────────────────────────
// Visual prop only — the AI terminal is now shown as a 2D panel overlay.
function Workstation() {
  return (
    <group position={[0, 0, 0]}>
      <mesh position={[0, -0.52, 0.7]} receiveShadow castShadow>
        <boxGeometry args={[3.8, 0.055, 2.8]} />
        <meshStandardMaterial color="#06090f" metalness={0.5} roughness={0.75} />
      </mesh>

      <mesh position={[0, -0.48, 0.32]} castShadow receiveShadow>
        <boxGeometry args={[0.95, 0.055, 0.58]} />
        <meshStandardMaterial color="#0c1018" metalness={0.92} roughness={0.18} />
      </mesh>

      <mesh position={[0, 0.1, 0.3]} castShadow>
        <cylinderGeometry args={[0.032, 0.062, 1.25, 14]} />
        <meshStandardMaterial color="#0c1018" metalness={0.95} roughness={0.08} />
      </mesh>

      <mesh position={[0, 0.78, 0]} castShadow receiveShadow>
        <boxGeometry args={[2.38, 1.55, 0.1]} />
        <meshStandardMaterial color="#090d14" metalness={0.88} roughness={0.22} />
      </mesh>

      {/* Screen glass with active glow — terminal running in the panel */}
      <mesh position={[0, 0.78, 0.057]}>
        <boxGeometry args={[2.12, 1.32, 0.008]} />
        <meshStandardMaterial
          color="#001408"
          emissive="#39ff14"
          emissiveIntensity={0.35}
          transparent
          opacity={0.94}
        />
      </mesh>

      {/* Screen glow scanline effect — thin horizontal strips */}
      {Array.from({ length: 8 }).map((_, i) => (
        <mesh key={i} position={[0, 0.14 + i * 0.17, 0.062]}>
          <boxGeometry args={[2.0, 0.025, 0.001]} />
          <meshStandardMaterial emissive="#39ff14" emissiveIntensity={0.15} color="black" />
        </mesh>
      ))}

      <mesh position={[0, 0.78, -0.062]}>
        <boxGeometry args={[2.38, 1.55, 0.012]} />
        <meshStandardMaterial color="#001408" emissive="#39ff14" emissiveIntensity={0.06} />
      </mesh>

      <mesh position={[0, -0.492, 1.12]} castShadow receiveShadow>
        <boxGeometry args={[1.38, 0.038, 0.5]} />
        <meshStandardMaterial color="#07090e" metalness={0.68} roughness={0.42} />
      </mesh>

      {[0, 0.13, 0.26].map((zOff, i) => (
        <mesh key={i} position={[0, -0.468, 0.9 + zOff]} castShadow>
          <boxGeometry args={[1.2, 0.016, 0.062]} />
          <meshStandardMaterial color="#0e1520" emissive="#0044aa" emissiveIntensity={0.07} />
        </mesh>
      ))}

      <mesh position={[0.82, -0.492, 1.12]} receiveShadow>
        <boxGeometry args={[0.52, 0.006, 0.38]} />
        <meshStandardMaterial color="#080b10" roughness={0.95} metalness={0.1} />
      </mesh>

      <mesh position={[0.82, -0.468, 1.1]} castShadow>
        <boxGeometry args={[0.14, 0.04, 0.2]} />
        <meshStandardMaterial color="#0a0d15" metalness={0.6} roughness={0.4} />
      </mesh>
    </group>
  )
}

// ─── Floor Grid ───────────────────────────────────────────────────────────────
function FloorGrid() {
  return (
    <>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1, 0]} receiveShadow>
        <planeGeometry args={[80, 80]} />
        <meshStandardMaterial color="#030608" metalness={0.3} roughness={0.92} />
      </mesh>

      {Array.from({ length: 13 }).map((_, i) => {
        const pos = -6 + i
        return (
          <group key={i}>
            <mesh position={[pos, -0.998, 0]}>
              <boxGeometry args={[0.006, 0.001, 30]} />
              <meshStandardMaterial emissive="#001a33" emissiveIntensity={0.5} color="#000" />
            </mesh>
            <mesh position={[0, -0.998, pos]}>
              <boxGeometry args={[30, 0.001, 0.006]} />
              <meshStandardMaterial emissive="#001a33" emissiveIntensity={0.5} color="#000" />
            </mesh>
          </group>
        )
      })}
    </>
  )
}

// ─── Home Marker ─────────────────────────────────────────────────────────────
function HomeMarker() {
  return (
    <group position={[-2.5, -1, 0]}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.001, 0]}>
        <circleGeometry args={[0.6, 32]} />
        <meshStandardMaterial color="#00f3ff" emissive="#00f3ff" emissiveIntensity={0.08} transparent opacity={0.12} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.002, 0]}>
        <ringGeometry args={[0.56, 0.64, 32]} />
        <meshStandardMaterial emissive="#00f3ff" emissiveIntensity={0.9} transparent opacity={0.5} color="#00f3ff" />
      </mesh>
      <Html position={[0, 2.8, 0]} center distanceFactor={18}>
        <div className="zone-3d-label" style={{ color: '#00f3ff', borderColor: '#00f3ff', fontSize: '11px' }}>
          HQ
        </div>
      </Html>
    </group>
  )
}

// ─── Scene Root ───────────────────────────────────────────────────────────────
export default function Scene({ targetPosition, targetZone, onArrive }) {
  // Shared ref: Character writes position/rotation, FollowCamera reads it
  const characterRef = useRef()

  return (
    <Canvas
      shadows
      gl={{ antialias: true, powerPreference: 'high-performance' }}
      camera={{ position: [-9, 2.5, 0], fov: 62 }}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 1,
      }}
    >
      <color attach="background" args={['#050a0f']} />

      {/* Hemisphere — warm sky top, cool ground bottom */}
      <hemisphereLight skyColor="#1a2d50" groundColor="#080d14" intensity={1.2} />

      {/* Ambient fill — ensures nothing is completely black */}
      <ambientLight color="#2a3a55" intensity={2.0} />

      {/* Primary directional — icy-blue key light */}
      <directionalLight
        color="#b8e8ff"
        intensity={3.2}
        position={[6, 14, 8]}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-near={0.1}
        shadow-camera-far={80}
        shadow-camera-left={-16}
        shadow-camera-right={16}
        shadow-camera-top={16}
        shadow-camera-bottom={-16}
        shadow-bias={-0.001}
      />

      {/* Fill light from front-right — softens shadows */}
      <directionalLight color="#4488cc" intensity={0.8} position={[-4, 6, 10]} />

      {/* Monitor screen bounce — matrix green */}
      <pointLight color="#39ff14" intensity={1.6} position={[0, 0.78, 2.5]} distance={6} decay={2} />

      {/* Character rim — violet backlight */}
      <pointLight color="#4466ff" intensity={0.8} position={[-5, 3, 2]} distance={10} decay={2} />

      <Suspense fallback={null}>
        <Character
          groupRef={characterRef}
          targetPosition={targetPosition}
          targetZone={targetZone}
          onArrive={onArrive}
        />
        <Workstation />
        {ZONE_CONFIG.map((zone) => (
          <ZoneArea key={zone.name} {...zone} />
        ))}
        <Environment preset="city" />
      </Suspense>

      <FloorGrid />
      <HomeMarker />

      {/* FollowCamera after scene so useFrame runs after character moves */}
      <FollowCamera characterRef={characterRef} />
    </Canvas>
  )
}

useGLTF.preload(walkingGlb)
