import * as THREE from 'three'

// Single shared 4-band gradient ramp used by every MeshToonMaterial in the
// scene. Cel shading = sampling lighting through this stepped grayscale ramp.
let _tex = null
export function toonGradient() {
  if (_tex) return _tex
  // RGBA ramp: 4 pixels, one per band. Provide RGB channels to avoid
  // single-channel sampling issues and ensure correct color/lightness.
  const data = new Uint8Array([
    110, 110, 110, 255,
    170, 170, 170, 255,
    220, 220, 220, 255,
    255, 255, 255, 255,
  ])
  _tex = new THREE.DataTexture(data, 4, 1, THREE.RGBAFormat)
  _tex.minFilter = THREE.NearestFilter
  _tex.magFilter = THREE.NearestFilter
  _tex.generateMipmaps = false
  _tex.encoding = THREE.sRGBEncoding
  _tex.needsUpdate = true
  return _tex
}
