import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { toonGradient } from './toonGradient'

// ─── Palette — matched closely to reference render ─────────────────────────────
const C = {
  skin:       '#f5cead',
  skin2:      '#edba97',
  cheek:      '#ef9e8c',
  hair:       '#231719',
  hair2:      '#3a2728',
  hairhi:     '#6b4546',
  blazer:     '#9e9ea8',
  blazer2:    '#8a8a94',
  blazerDark: '#787882',
  tee:        '#f8f8f8',
  pants:      '#141418',
  belt:       '#4e2f1a',
  belthi:     '#6b3f22',
  bag:        '#7a3820',
  baghi:      '#5e2c18',
  bagflap:    '#6a3018',
  pearl:      '#f0ede4',
  pearlhi:    '#ffffff',
  flower:     '#d42e2e',
  flowerhi:   '#e84444',
  fcenter:    '#ffcc3a',
  shoe:       '#f6f4ef',
  shoehi:     '#ffffff',
  shoesole:   '#c8c4b4',
  gold:       '#c9933a',
  goldhi:     '#e8b84a',
  eye:        '#1e1519',
  iris:       '#4a3028',
  white:      '#ffffff',
  mouth:      '#c06c62',
  liplower:   '#d07a70',
  green:      '#4a7a3a',
}

function Toon({ color, ...rest }) {
  return <meshToonMaterial color={color} gradientMap={toonGradient()} {...rest} />
}
function Shiny({ color, metalness = 0.6, roughness = 0.25 }) {
  return <meshStandardMaterial color={color} metalness={metalness} roughness={roughness} />
}

// Wavy hair lock built from overlapping spheres
function makeLock(key, { sx = 1, x0 = 0, y0 = 0, z0 = 0, len = 0.9, segs = 8, r0 = 0.09, taper = 0.6, amp = 0.05, freq = 2.2, rot = 0 }) {
  return Array.from({ length: segs }).map((_, i) => {
    const t = i / (segs - 1)
    const y = y0 - t * len
    const x = sx * (x0 + Math.sin(t * Math.PI * freq + rot) * amp)
    const z = z0 + Math.sin(t * Math.PI * 0.9) * 0.06
    const r = r0 * (1 - t * taper)
    const c = i % 4 === 0 ? C.hairhi : i % 3 === 0 ? C.hair2 : C.hair
    return (
      <mesh key={`${key}-${i}`} position={[x, y, z]} scale={[r, 0.115, r]} castShadow>
        <sphereGeometry args={[1, 20, 16]} />
        <Toon color={c} />
      </mesh>
    )
  })
}

export default function ToonCharacter({ gaitRef }) {
  const upperRef = useRef()
  const legL = useRef()
  const legR = useRef()
  const armL = useRef()
  const armR = useRef()
  const phase = useRef(0)

  useFrame((state, delta) => {
    const gait = THREE.MathUtils.clamp(gaitRef?.current ?? 0, 0, 1)
    phase.current += delta * (3.0 + gait * 7.0)
    const p = phase.current
    const s = Math.sin(p)
    const swing = gait * 0.66

    if (legL.current) { legL.current.rotation.x = s * swing;  legL.current.position.y = 0.93 + Math.max(0, s) * 0.05 * gait }
    if (legR.current) { legR.current.rotation.x = -s * swing; legR.current.position.y = 0.93 + Math.max(0, -s) * 0.05 * gait }
    if (armL.current) armL.current.rotation.x = -s * swing * 0.85
    if (armR.current) armR.current.rotation.x = s * swing * 0.85

    if (upperRef.current) {
      const bob = Math.abs(s) * 0.06 * gait
      const breathe = Math.sin(state.clock.elapsedTime * 1.8) * 0.012 * (1 - gait)
      upperRef.current.position.y = bob + breathe
      upperRef.current.rotation.z = s * 0.03 * gait
      upperRef.current.rotation.y = -s * 0.06 * gait
      upperRef.current.rotation.x = 0.06 * gait
    }
  })

  const HZ = 1.74 // head centre Y

  return (
    <group>
      {/* ─── LEGS ─── */}
      {[['L', -0.088, legL], ['R', 0.088, legR]].map(([k, x, ref]) => (
        <group key={k} ref={ref} position={[x, 0.93, 0]}>
          {/* upper leg */}
          <mesh position={[0, -0.22, 0]} castShadow>
            <cylinderGeometry args={[0.08, 0.075, 0.46, 22]} />
            <Toon color={C.pants} />
          </mesh>
          {/* lower leg */}
          <mesh position={[0, -0.55, 0]} castShadow>
            <cylinderGeometry args={[0.073, 0.065, 0.48, 22]} />
            <Toon color={C.pants} />
          </mesh>
          {/* shoe — cream loafer body */}
          <mesh position={[0, -0.85, 0.028]} castShadow>
            <boxGeometry args={[0.135, 0.075, 0.265]} />
            <Toon color={C.shoe} />
          </mesh>
          {/* toe cap rounder */}
          <mesh position={[0, -0.853, 0.145]} scale={[0.068, 0.035, 0.06]} castShadow>
            <sphereGeometry args={[1, 20, 16]} />
            <Toon color={C.shoehi} />
          </mesh>
          {/* sole */}
          <mesh position={[0, -0.896, 0.028]} castShadow>
            <boxGeometry args={[0.138, 0.025, 0.268]} />
            <Toon color={C.shoesole} />
          </mesh>
          {/* gold horsebit bar */}
          <mesh position={[0, -0.84, 0.045]} rotation={[0, 0, Math.PI / 2]} castShadow>
            <cylinderGeometry args={[0.012, 0.012, 0.11, 10]} />
            <Shiny color={C.gold} metalness={0.7} roughness={0.2} />
          </mesh>
          {/* gold bit rings */}
          {[-0.048, 0.048].map((bx) => (
            <mesh key={bx} position={[bx, -0.84, 0.045]} rotation={[Math.PI / 2, 0, 0]} castShadow>
              <torusGeometry args={[0.013, 0.005, 8, 16]} />
              <Shiny color={C.goldhi} metalness={0.8} roughness={0.15} />
            </mesh>
          ))}
        </group>
      ))}

      {/* ─── UPPER BODY ─── */}
      <group ref={upperRef}>

        {/* hips */}
        <mesh position={[0, 0.92, 0]} castShadow>
          <cylinderGeometry args={[0.205, 0.175, 0.32, 24]} />
          <Toon color={C.pants} />
        </mesh>

        {/* belt */}
        <mesh position={[0, 1.0, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow>
          <torusGeometry args={[0.192, 0.022, 10, 32]} />
          <Toon color={C.belt} />
        </mesh>
        <mesh position={[0, 1.0, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.192, 0.009, 8, 32]} />
          <Toon color={C.belthi} />
        </mesh>
        {/* buckle */}
        <mesh position={[0, 1.0, 0.194]} castShadow>
          <boxGeometry args={[0.065, 0.038, 0.02]} />
          <Shiny color={C.gold} metalness={0.65} roughness={0.3} />
        </mesh>
        <mesh position={[0, 1.0, 0.205]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.005, 0.005, 0.05, 8]} />
          <Shiny color={C.goldhi} metalness={0.8} roughness={0.2} />
        </mesh>

        {/* white tee */}
        <mesh position={[0, 1.19, 0]} castShadow>
          <cylinderGeometry args={[0.195, 0.172, 0.44, 26]} />
          <Toon color={C.tee} />
        </mesh>

        {/* blazer body */}
        <mesh position={[0, 1.21, 0.008]} castShadow>
          <cylinderGeometry args={[0.232, 0.24, 0.52, 26]} />
          <Toon color={C.blazer} />
        </mesh>
        {/* shoulders */}
        <mesh position={[0, 1.44, 0]} scale={[1.02, 0.58, 0.92]} castShadow>
          <sphereGeometry args={[0.226, 26, 18]} />
          <Toon color={C.blazer} />
        </mesh>
        {/* back hem */}
        <mesh position={[0, 0.93, -0.04]} castShadow>
          <cylinderGeometry args={[0.235, 0.228, 0.18, 20]} />
          <Toon color={C.blazerDark} />
        </mesh>

        {/* lapels */}
        {[['L', -0.08, 0.19, 0.175], ['R', 0.08, -0.19, 0.175]].map(([k, x, rz, z]) => (
          <mesh key={k} position={[x, 1.32, z]} rotation={[0.12, 0, rz]} castShadow>
            <boxGeometry args={[0.065, 0.28, 0.038]} />
            <Toon color={C.blazer2} />
          </mesh>
        ))}

        {/* tee V between lapels */}
        <mesh position={[0, 1.27, 0.168]}>
          <boxGeometry args={[0.09, 0.27, 0.04]} />
          <Toon color={C.tee} />
        </mesh>

        {/* front buttons */}
        {[1.16, 1.06].map((y) => (
          <mesh key={y} position={[0.018, y, 0.203]}>
            <sphereGeometry args={[0.013, 12, 12]} />
            <Toon color={C.blazerDark} />
          </mesh>
        ))}

        {/* pocket flaps */}
        {[['L', -0.115], ['R', 0.115]].map(([k, x]) => (
          <group key={k}>
            <mesh position={[x, 1.06, 0.198]} castShadow>
              <boxGeometry args={[0.1, 0.028, 0.022]} />
              <Toon color={C.blazer2} />
            </mesh>
            <mesh position={[x, 1.044, 0.198]}>
              <boxGeometry args={[0.102, 0.008, 0.022]} />
              <Toon color={C.blazerDark} />
            </mesh>
          </group>
        ))}

        {/* pearl necklace — double strand */}
        {[
          { y: 1.43, r: 0.082, tilt: 1.22 },
          { y: 1.408, r: 0.096, tilt: 1.28 },
        ].map(({ y, r, tilt }, i) => (
          <group key={i}>
            {Array.from({ length: 18 }).map((_, j) => {
              const a = (j / 18) * Math.PI * 2
              const px = Math.cos(a) * r
              const py = y + Math.sin(a) * r * 0.18
              const pz = 0.055 + Math.sin(a) * r * 0.72
              return (
                <mesh key={j} position={[px, py, pz]} scale={[0.014, 0.014, 0.014]}>
                  <sphereGeometry args={[1, 10, 10]} />
                  <Shiny color={j % 3 === 0 ? C.pearlhi : C.pearl} metalness={0.3} roughness={0.08} />
                </mesh>
              )
            })}
          </group>
        ))}

        {/* neck */}
        <mesh position={[0, 1.55, 0]} castShadow>
          <cylinderGeometry args={[0.056, 0.062, 0.14, 18]} />
          <Toon color={C.skin} />
        </mesh>

        {/* arms */}
        {[['L', -0.242, armL], ['R', 0.242, armR]].map(([k, x, ref]) => (
          <group key={k} ref={ref} position={[x, 1.38, 0]}>
            <mesh position={[0, -0.18, 0]} castShadow>
              <cylinderGeometry args={[0.067, 0.06, 0.38, 18]} />
              <Toon color={C.blazer} />
            </mesh>
            <mesh position={[0, -0.46, 0]} castShadow>
              <cylinderGeometry args={[0.058, 0.052, 0.34, 18]} />
              <Toon color={C.blazer} />
            </mesh>
            <mesh position={[0, -0.62, 0]} castShadow>
              <cylinderGeometry args={[0.054, 0.054, 0.04, 16]} />
              <Toon color={C.blazer2} />
            </mesh>
            <mesh position={[0, -0.67, 0]} scale={[0.06, 0.065, 0.055]} castShadow>
              <sphereGeometry args={[1, 18, 16]} />
              <Toon color={C.skin} />
            </mesh>
            {[-0.025, 0, 0.025].map((fx) => (
              <mesh key={fx} position={[fx, -0.72, 0]} scale={[0.018, 0.036, 0.018]}>
                <sphereGeometry args={[1, 10, 10]} />
                <Toon color={C.skin2} />
              </mesh>
            ))}
          </group>
        ))}

        {/* ─── HEAD ─── */}
        <group>
          <mesh position={[0, HZ, 0]} scale={[0.205, 0.232, 0.21]} castShadow>
            <sphereGeometry args={[1, 44, 36]} />
            <Toon color={C.skin} />
          </mesh>
          {/* chin */}
          <mesh position={[0, HZ - 0.148, 0.018]} scale={[0.136, 0.098, 0.124]} castShadow>
            <sphereGeometry args={[1, 28, 22]} />
            <Toon color={C.skin} />
          </mesh>
          {/* ears + pearl earrings */}
          {[-0.198, 0.198].map((x) => (
            <group key={x}>
              <mesh position={[x, HZ - 0.018, 0.0]} scale={[0.033, 0.055, 0.033]}>
                <sphereGeometry args={[1, 14, 14]} />
                <Toon color={C.skin2} />
              </mesh>
              <mesh position={[x * 1.04, HZ - 0.075, 0.02]} scale={[0.016, 0.016, 0.016]}>
                <sphereGeometry args={[1, 10, 10]} />
                <Shiny color={C.pearlhi} metalness={0.3} roughness={0.1} />
              </mesh>
            </group>
          ))}

          {/* cheek blush */}
          {[-0.122, 0.122].map((x) => (
            <mesh key={x} position={[x, HZ - 0.072, 0.156]} scale={[0.046, 0.03, 0.02]}>
              <sphereGeometry args={[1, 18, 18]} />
              <Toon color={C.cheek} />
            </mesh>
          ))}

          {/* eyes */}
          {[-0.075, 0.075].map((x) => (
            <group key={x}>
              <mesh position={[x, HZ + 0.008, 0.175]} scale={[0.038, 0.05, 0.022]}>
                <sphereGeometry args={[1, 24, 24]} />
                <meshBasicMaterial color={C.white} />
              </mesh>
              <mesh position={[x, HZ + 0.002, 0.189]} scale={[0.029, 0.038, 0.018]}>
                <sphereGeometry args={[1, 22, 22]} />
                <Toon color={C.iris} />
              </mesh>
              <mesh position={[x, HZ + 0.002, 0.2]} scale={[0.015, 0.02, 0.012]}>
                <sphereGeometry args={[1, 18, 18]} />
                <meshBasicMaterial color={C.eye} />
              </mesh>
              <mesh position={[x + 0.012, HZ + 0.024, 0.204]}>
                <sphereGeometry args={[0.009, 10, 10]} />
                <meshBasicMaterial color={C.white} />
              </mesh>
              {/* upper lash */}
              <mesh position={[x, HZ + 0.046, 0.184]} scale={[0.049, 0.014, 0.015]}>
                <sphereGeometry args={[1, 18, 14]} />
                <Toon color={C.hair} />
              </mesh>
              {/* outer lash */}
              <mesh position={[x * 1.34, HZ + 0.038, 0.18]} rotation={[0, 0, x < 0 ? 0.4 : -0.4]} scale={[0.014, 0.02, 0.012]}>
                <sphereGeometry args={[1, 12, 12]} />
                <Toon color={C.hair} />
              </mesh>
            </group>
          ))}

          {/* brows */}
          {[-0.075, 0.075].map((x) => (
            <mesh key={x} position={[x, HZ + 0.082, 0.18]} rotation={[0, 0, x < 0 ? 0.14 : -0.14]}>
              <boxGeometry args={[0.052, 0.012, 0.013]} />
              <Toon color={C.hair} />
            </mesh>
          ))}

          {/* nose */}
          <mesh position={[0, HZ - 0.034, 0.208]}>
            <sphereGeometry args={[0.017, 14, 14]} />
            <Toon color={C.skin2} />
          </mesh>
          {[-0.018, 0.018].map((nx) => (
            <mesh key={nx} position={[nx, HZ - 0.044, 0.204]} scale={[0.009, 0.007, 0.007]}>
              <sphereGeometry args={[1, 10, 10]} />
              <Toon color={C.skin2} />
            </mesh>
          ))}

          {/* mouth */}
          <mesh position={[0, HZ - 0.088, 0.192]} scale={[0.046, 0.016, 0.014]}>
            <sphereGeometry args={[1, 18, 14]} />
            <Toon color={C.mouth} />
          </mesh>
          <mesh position={[0, HZ - 0.104, 0.195]} scale={[0.042, 0.02, 0.016]}>
            <sphereGeometry args={[1, 18, 14]} />
            <Toon color={C.liplower} />
          </mesh>

          {/* ─── HAIR ─── */}
          {/* back mass */}
          <mesh position={[0, HZ - 0.015, -0.068]} scale={[0.305, 0.345, 0.29]} castShadow>
            <sphereGeometry args={[1, 44, 32]} />
            <Toon color={C.hair} />
          </mesh>
          <mesh position={[0, HZ - 0.38, -0.09]} scale={[0.285, 0.31, 0.215]} castShadow>
            <sphereGeometry args={[1, 36, 26]} />
            <Toon color={C.hair} />
          </mesh>
          <mesh position={[0, HZ - 0.64, -0.065]} scale={[0.255, 0.24, 0.185]} castShadow>
            <sphereGeometry args={[1, 30, 22]} />
            <Toon color={C.hair} />
          </mesh>
          {/* crown */}
          <mesh position={[0, HZ + 0.11, -0.01]} scale={[0.248, 0.225, 0.248]} castShadow>
            <sphereGeometry args={[1, 44, 32]} />
            <Toon color={C.hair} />
          </mesh>
          {/* highlight */}
          <mesh position={[0, HZ + 0.228, 0.045]} scale={[0.14, 0.08, 0.135]}>
            <sphereGeometry args={[1, 26, 18]} />
            <Toon color={C.hairhi} />
          </mesh>
          {/* front sweeps */}
          {[-1, 1].map((sx) => (
            <group key={sx}>
              <mesh position={[sx * 0.09, HZ + 0.128, 0.142]} scale={[0.138, 0.108, 0.1]} rotation={[0.3, 0, sx * 0.52]} castShadow>
                <sphereGeometry args={[1, 28, 22]} />
                <Toon color={C.hair} />
              </mesh>
              <mesh position={[sx * 0.14, HZ + 0.06, 0.148]} scale={[0.09, 0.085, 0.075]} rotation={[0.15, 0, sx * 0.3]} castShadow>
                <sphereGeometry args={[1, 22, 18]} />
                <Toon color={C.hair2} />
              </mesh>
            </group>
          ))}
          {/* side framing locks */}
          {[-1, 1].map((sx) => (
            <mesh key={sx} position={[sx * 0.212, HZ - 0.065, 0.072]} scale={[0.082, 0.205, 0.098]} rotation={[0, 0, sx * 0.12]} castShadow>
              <sphereGeometry args={[1, 26, 20]} />
              <Toon color={C.hair} />
            </mesh>
          ))}
          {/* wavy front locks */}
          {[-1, 1].map((sx) => makeLock(`f${sx}`, { sx, x0: 0.22, y0: HZ - 0.17, z0: 0.0, len: 1.1, segs: 11, r0: 0.1, taper: 0.64, amp: 0.058, freq: 2.6 }))}
          {[-1, 1].map((sx) => makeLock(`fi${sx}`, { sx, x0: 0.14, y0: HZ - 0.22, z0: 0.02, len: 0.85, segs: 8, r0: 0.082, taper: 0.55, amp: 0.04, freq: 2.0, rot: 0.8 }))}
          {[-1, 1].map((sx) => makeLock(`b${sx}`, { sx, x0: 0.13, y0: HZ - 0.24, z0: -0.14, len: 0.9, segs: 7, r0: 0.1, taper: 0.52, amp: 0.032, freq: 1.8 }))}

          {/* ─── RED FLOWER ─── */}
          <group position={[0.21, HZ + 0.082, 0.065]}>
            <mesh position={[-0.018, -0.02, -0.008]} rotation={[0, 0, 0.7]} scale={[0.025, 0.04, 0.01]}>
              <sphereGeometry args={[1, 10, 10]} />
              <Toon color={C.green} />
            </mesh>
            <mesh>
              <sphereGeometry args={[0.026, 14, 14]} />
              <Toon color={C.fcenter} />
            </mesh>
            {[0, 1, 2, 3, 4].map((n) => {
              const a = (n * Math.PI * 2) / 5
              return (
                <mesh key={n} position={[Math.cos(a) * 0.046, Math.sin(a) * 0.046, 0.008]} scale={[0.03, 0.03, 0.017]}>
                  <sphereGeometry args={[1, 14, 14]} />
                  <Toon color={n % 2 === 0 ? C.flower : C.flowerhi} />
                </mesh>
              )
            })}
            {[0, 1, 2, 3, 4].map((n) => {
              const a = (n * Math.PI * 2) / 5 + Math.PI / 5
              return (
                <mesh key={`b${n}`} position={[Math.cos(a) * 0.038, Math.sin(a) * 0.038, -0.005]} scale={[0.024, 0.024, 0.013]}>
                  <sphereGeometry args={[1, 12, 12]} />
                  <Toon color={C.flower} />
                </mesh>
              )
            })}
          </group>
        </group>

        {/* ─── CROSSBODY BAG ─── */}
        <mesh position={[0.29, 0.97, 0.065]} castShadow>
          <boxGeometry args={[0.155, 0.148, 0.085]} />
          <Toon color={C.bag} />
        </mesh>
        <mesh position={[0.29, 0.97, 0.108]}>
          <boxGeometry args={[0.158, 0.151, 0.008]} />
          <Toon color={C.baghi} />
        </mesh>
        <mesh position={[0.29, 1.015, 0.109]} castShadow>
          <boxGeometry args={[0.158, 0.055, 0.032]} />
          <Toon color={C.bagflap} />
        </mesh>
        <mesh position={[0.29, 0.988, 0.112]} scale={[0.08, 0.025, 0.02]} castShadow>
          <sphereGeometry args={[1, 14, 10]} />
          <Toon color={C.bagflap} />
        </mesh>
        {/* gold clasp */}
        <mesh position={[0.29, 0.988, 0.118]}>
          <boxGeometry args={[0.026, 0.016, 0.014]} />
          <Shiny color={C.gold} metalness={0.7} roughness={0.2} />
        </mesh>
        {/* corner studs */}
        {[[-0.055, -0.062, 0.042], [0.055, -0.062, 0.042], [-0.055, -0.062, -0.035], [0.055, -0.062, -0.035]].map(([bx, by, bz], i) => (
          <mesh key={i} position={[0.29 + bx, 0.97 + by, 0.065 + bz]}>
            <sphereGeometry args={[0.01, 8, 8]} />
            <Shiny color={C.goldhi} metalness={0.8} roughness={0.15} />
          </mesh>
        ))}
        {/* strap */}
        <mesh position={[0.108, 1.23, 0.075]} rotation={[0.3, 0, 0.44]} castShadow>
          <cylinderGeometry args={[0.012, 0.012, 0.74, 12]} />
          <Toon color={C.bag} />
        </mesh>
      </group>
    </group>
  )
}