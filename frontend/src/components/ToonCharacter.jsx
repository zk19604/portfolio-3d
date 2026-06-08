import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { toonGradient } from './toonGradient'

// ─── Roblox-style female avatar — blocky, boxy R6 proportions ─────────────────
const C = {
  skin:    '#ffce99',  // classic Roblox-ish warm skin
  skinHi:  '#ffdcb0',
  hair:    '#5a3a22',
  hairHi:  '#7a5236',
  shirt:   '#ff6fae',  // pink tee
  shirtHi: '#ff8fc0',
  skirt:   '#6a5acd',  // purple skirt
  skirtHi: '#8472e0',
  legs:    '#ffce99',
  shoe:    '#3a3340',
  shoeHi:  '#5a5266',
  glass:   '#2a2a33',  // dark frames
  lens:    '#bfe9ff',  // tinted lens
  eye:     '#2a2030',
  white:   '#ffffff',
  mouth:   '#d84a6a',
  cheek:   '#ff9fb0',
  lash:    '#241820',
}

// Cel-shaded solid block colour
function Toon({ color, ...rest }) {
  return <meshToonMaterial color={color} gradientMap={toonGradient()} {...rest} />
}
// Flat fully-lit colour — face features never fall into shadow
function Flat({ color, ...rest }) {
  return <meshBasicMaterial color={color} {...rest} />
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
    const swing = gait * 0.7

    // blocky robot-like leg/arm swing (pivot at the joint)
    if (legL.current) legL.current.rotation.x = s * swing
    if (legR.current) legR.current.rotation.x = -s * swing
    if (armL.current) armL.current.rotation.x = -s * swing * 0.9
    if (armR.current) armR.current.rotation.x = s * swing * 0.9

    if (upperRef.current) {
      const bob = Math.abs(s) * 0.05 * gait
      const breathe = Math.sin(state.clock.elapsedTime * 1.8) * 0.012 * (1 - gait)
      upperRef.current.position.y = bob + breathe
      upperRef.current.rotation.z = s * 0.025 * gait
      upperRef.current.rotation.y = -s * 0.05 * gait
    }
  })

  const HIP = 0.86  // hip / leg pivot height
  const HZ  = 1.78  // head centre Y

  return (
    <group>
      {/* ─── LEGS ─── blocky pillars, pivot at the hip */}
      {[['L', -0.11, legL], ['R', 0.11, legR]].map(([k, x, ref]) => (
        <group key={k} ref={ref} position={[x, HIP, 0]}>
          <mesh position={[0, -0.37, 0]} castShadow>
            <boxGeometry args={[0.18, 0.74, 0.19]} />
            <Toon color={C.legs} />
          </mesh>
          {/* chunky shoe */}
          <mesh position={[0, -0.77, 0.03]} castShadow>
            <boxGeometry args={[0.2, 0.12, 0.26]} />
            <Toon color={C.shoe} />
          </mesh>
          <mesh position={[0, -0.71, 0.03]} castShadow>
            <boxGeometry args={[0.21, 0.05, 0.27]} />
            <Toon color={C.shoeHi} />
          </mesh>
        </group>
      ))}

      {/* ─── UPPER BODY ─── */}
      <group ref={upperRef}>
        {/* skirt — blocky flared box over the hips */}
        <mesh position={[0, 0.92, 0]} castShadow>
          <boxGeometry args={[0.46, 0.3, 0.32]} />
          <Toon color={C.skirt} />
        </mesh>
        <mesh position={[0, 0.78, 0]} castShadow>
          <boxGeometry args={[0.52, 0.12, 0.36]} />
          <Toon color={C.skirtHi} />
        </mesh>

        {/* torso — boxy Roblox shirt */}
        <mesh position={[0, 1.28, 0]} castShadow>
          <boxGeometry args={[0.42, 0.56, 0.26]} />
          <Toon color={C.shirt} />
        </mesh>
        {/* waist hem highlight */}
        <mesh position={[0, 1.04, 0]} castShadow>
          <boxGeometry args={[0.44, 0.08, 0.28]} />
          <Toon color={C.shirtHi} />
        </mesh>

        {/* neck */}
        <mesh position={[0, 1.59, 0]} castShadow>
          <boxGeometry args={[0.13, 0.1, 0.13]} />
          <Toon color={C.skin} />
        </mesh>

        {/* arms — boxy, pivot at the shoulder */}
        {[['L', -0.3, armL], ['R', 0.3, armR]].map(([k, x, ref]) => (
          <group key={k} ref={ref} position={[x, 1.52, 0]}>
            <mesh position={[0, -0.23, 0]} castShadow>
              <boxGeometry args={[0.15, 0.46, 0.18]} />
              <Toon color={C.shirt} />
            </mesh>
            {/* forearm / hand in skin */}
            <mesh position={[0, -0.52, 0]} castShadow>
              <boxGeometry args={[0.15, 0.16, 0.18]} />
              <Toon color={C.skin} />
            </mesh>
          </group>
        ))}

        {/* ─── HEAD ─── classic blocky Roblox cube head */}
        <group>
          <mesh position={[0, HZ, 0]} castShadow>
            <boxGeometry args={[0.46, 0.46, 0.44]} />
            <Toon color={C.skin} />
          </mesh>

          {/* cheek blush */}
          {[-0.13, 0.13].map((x) => (
            <mesh key={x} position={[x, HZ - 0.07, 0.221]} scale={[0.05, 0.03, 0.001]}>
              <boxGeometry args={[1, 1, 1]} />
              <Flat color={C.cheek} />
            </mesh>
          ))}

          {/* eyes — flat oval whites with dark pupils */}
          {[-0.1, 0.1].map((x) => (
            <group key={x}>
              <mesh position={[x, HZ + 0.02, 0.221]} scale={[0.06, 0.07, 0.001]}>
                <boxGeometry args={[1, 1, 1]} />
                <Flat color={C.white} />
              </mesh>
              <mesh position={[x, HZ + 0.01, 0.223]} scale={[0.04, 0.05, 0.001]}>
                <boxGeometry args={[1, 1, 1]} />
                <Flat color={C.eye} />
              </mesh>
              {/* sparkle */}
              <mesh position={[x + 0.012, HZ + 0.03, 0.225]} scale={[0.014, 0.014, 0.001]}>
                <boxGeometry args={[1, 1, 1]} />
                <Flat color={C.white} />
              </mesh>
              {/* top lash */}
              <mesh position={[x, HZ + 0.07, 0.222]} scale={[0.07, 0.014, 0.001]}>
                <boxGeometry args={[1, 1, 1]} />
                <Flat color={C.lash} />
              </mesh>
            </group>
          ))}

          {/* smile */}
          <mesh position={[0, HZ - 0.12, 0.221]} scale={[0.1, 0.022, 0.001]}>
            <boxGeometry args={[1, 1, 1]} />
            <Flat color={C.mouth} />
          </mesh>
          {[-1, 1].map((sx) => (
            <mesh key={sx} position={[sx * 0.055, HZ - 0.1, 0.221]} scale={[0.025, 0.022, 0.001]}>
              <boxGeometry args={[1, 1, 1]} />
              <Flat color={C.mouth} />
            </mesh>
          ))}

          {/* ─── GLASSES ─── two rims + bridge + temple arms */}
          <group position={[0, HZ + 0.02, 0]}>
            {[-0.1, 0.1].map((x) => (
              <group key={x} position={[x, 0, 0.224]}>
                {/* lens tint */}
                <mesh position={[0, 0, -0.004]} scale={[0.085, 0.085, 0.001]}>
                  <boxGeometry args={[1, 1, 1]} />
                  <Flat color={C.lens} transparent opacity={0.45} />
                </mesh>
                {/* rim — four thin bars around the lens */}
                {[[0, 0.045, 0.1, 0.014], [0, -0.045, 0.1, 0.014],
                  [-0.045, 0, 0.014, 0.105], [0.045, 0, 0.014, 0.105]].map(([rx, ry, w, h], i) => (
                  <mesh key={i} position={[rx, ry, 0]} scale={[w, h, 0.018]}>
                    <boxGeometry args={[1, 1, 1]} />
                    <Toon color={C.glass} />
                  </mesh>
                ))}
              </group>
            ))}
            {/* bridge */}
            <mesh position={[0, 0.01, 0.224]} scale={[0.045, 0.014, 0.018]}>
              <boxGeometry args={[1, 1, 1]} />
              <Toon color={C.glass} />
            </mesh>
            {/* temple arms running back along the head */}
            {[-1, 1].map((sx) => (
              <mesh key={sx} position={[sx * 0.18, 0.01, 0.1]} scale={[0.016, 0.014, 0.18]}>
                <boxGeometry args={[1, 1, 1]} />
                <Toon color={C.glass} />
              </mesh>
            ))}
          </group>

          {/* ─── HAIR ─── blocky cap + long boxy strands down the back */}
          {/* top cap covering the crown */}
          <mesh position={[0, HZ + 0.16, -0.01]} castShadow>
            <boxGeometry args={[0.5, 0.2, 0.48]} />
            <Toon color={C.hair} />
          </mesh>
          {/* fringe / bangs across the forehead */}
          <mesh position={[0, HZ + 0.13, 0.2]} castShadow>
            <boxGeometry args={[0.5, 0.18, 0.1]} />
            <Toon color={C.hairHi} />
          </mesh>
          {/* back slab */}
          <mesh position={[0, HZ - 0.05, -0.23]} castShadow>
            <boxGeometry args={[0.5, 0.5, 0.08]} />
            <Toon color={C.hair} />
          </mesh>
          {/* long side strands framing the face */}
          {[-1, 1].map((sx) => (
            <mesh key={sx} position={[sx * 0.255, HZ - 0.18, 0.02]} castShadow>
              <boxGeometry args={[0.09, 0.6, 0.42]} />
              <Toon color={C.hair} />
            </mesh>
          ))}
          {/* long back hair down past the shoulders */}
          <mesh position={[0, HZ - 0.5, -0.21]} castShadow>
            <boxGeometry args={[0.46, 0.5, 0.1]} />
            <Toon color={C.hair} />
          </mesh>
        </group>
      </group>
    </group>
  )
}
