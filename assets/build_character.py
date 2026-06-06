"""
Builds a stylized blocky 3D character approximating the reference image:
woman in grey tweed blazer, white tee, black pants, brown crossbody bag,
pearl necklace, dark wavy hair with red flower, white loafers, peach skin.

Run headless:  Blender --background --python build_character.py
Outputs: character.blend  +  character_preview.png
"""
import bpy
import os
from math import radians

ASSET_DIR = os.path.dirname(os.path.abspath(__file__))
OUT_BLEND = os.path.join(ASSET_DIR, "character.blend")
OUT_PNG = os.path.join(ASSET_DIR, "character_preview.png")

# ---- palette (sRGB-ish base colors) -----------------------------------------
SKIN   = (0.93, 0.73, 0.59, 1)
CHEEK  = (0.95, 0.52, 0.47, 1)
HAIR   = (0.045, 0.04, 0.045, 1)
DARK   = (0.05, 0.04, 0.04, 1)   # eyes / brows / sole
BLAZER = (0.56, 0.56, 0.57, 1)   # grey tweed
TEE    = (0.96, 0.96, 0.96, 1)
PANTS  = (0.03, 0.03, 0.035, 1)
BELT   = (0.26, 0.16, 0.10, 1)
BAG    = (0.42, 0.23, 0.13, 1)
BAGFLAP= (0.34, 0.18, 0.10, 1)
PEARL  = (0.96, 0.94, 0.90, 1)
FLOWER = (0.85, 0.11, 0.11, 1)
FLOWERC= (0.95, 0.78, 0.20, 1)
SHOE   = (0.95, 0.94, 0.90, 1)
GOLD   = (0.85, 0.66, 0.20, 1)

_materials = {}


def mat(name, color, rough=0.6, metallic=0.0):
    if name in _materials:
        return _materials[name]
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    bsdf = m.node_tree.nodes.get("Principled BSDF")
    bsdf.inputs["Base Color"].default_value = color
    bsdf.inputs["Roughness"].default_value = rough
    bsdf.inputs["Metallic"].default_value = metallic
    _materials[name] = m
    return m


def _finish(obj, material, smooth=True, subsurf=0):
    obj.data.materials.append(material)
    if smooth:
        for p in obj.data.polygons:
            p.use_smooth = True
    if subsurf:
        s = obj.modifiers.new("sub", "SUBSURF")
        s.levels = subsurf
        s.render_levels = subsurf
    return obj


def sphere(name, loc, scale, material, smooth=True):
    bpy.ops.mesh.primitive_uv_sphere_add(segments=32, ring_count=16, location=loc)
    o = bpy.context.active_object
    o.name = name
    o.scale = scale
    return _finish(o, material, smooth)


def box(name, loc, scale, material, rot=(0, 0, 0), subsurf=2):
    bpy.ops.mesh.primitive_cube_add(location=loc)
    o = bpy.context.active_object
    o.name = name
    o.scale = scale
    o.rotation_euler = [radians(a) for a in rot]
    return _finish(o, material, True, subsurf)


def cyl(name, loc, radius, depth, material, rot=(0, 0, 0)):
    bpy.ops.mesh.primitive_cylinder_add(vertices=24, radius=radius, depth=depth, location=loc)
    o = bpy.context.active_object
    o.name = name
    o.rotation_euler = [radians(a) for a in rot]
    return _finish(o, material, True)


def torus(name, loc, major, minor, material, rot=(0, 0, 0), metallic=0.0):
    bpy.ops.mesh.primitive_torus_add(location=loc, major_radius=major, minor_radius=minor,
                                     major_segments=32, minor_segments=12)
    o = bpy.context.active_object
    o.name = name
    o.rotation_euler = [radians(a) for a in rot]
    return _finish(o, material, True)


def clear():
    bpy.ops.object.select_all(action="SELECT")
    bpy.ops.object.delete(use_global=False)
    for block in (bpy.data.meshes, bpy.data.materials):
        for b in list(block):
            block.remove(b)


# =============================================================================
def build():
    clear()
    m_skin = mat("skin", SKIN, 0.5)
    m_hair = mat("hair", HAIR, 0.35)
    m_blazer = mat("blazer", BLAZER, 0.8)
    m_tee = mat("tee", TEE, 0.7)
    m_pants = mat("pants", PANTS, 0.6)
    m_belt = mat("belt", BELT, 0.4)
    m_bag = mat("bag", BAG, 0.45)
    m_pearl = mat("pearl", PEARL, 0.15, 0.3)
    m_dark = mat("dark", DARK, 0.4)

    import math
    # Proportions: feet at z=0, total height ~1.95, head ~1/7 of body.
    # ----- HEAD ----- (center 1.72)
    HZ = 1.72
    sphere("head", (0, 0, HZ), (0.185, 0.175, 0.205), m_skin)
    # cheeks (subtle blush, out to the sides)
    m_cheek = mat("cheek", (0.94, 0.62, 0.56, 1), 0.6)
    sphere("cheekL", (-0.125, -0.13, HZ - 0.055), (0.032, 0.022, 0.028), m_cheek)
    sphere("cheekR", (0.125, -0.13, HZ - 0.055), (0.032, 0.022, 0.028), m_cheek)
    # eyes
    sphere("eyeL", (-0.065, -0.175, HZ + 0.01), (0.022, 0.016, 0.028), m_dark)
    sphere("eyeR", (0.065, -0.175, HZ + 0.01), (0.022, 0.016, 0.028), m_dark)
    # brows
    box("browL", (-0.065, -0.18, HZ + 0.06), (0.035, 0.01, 0.006), m_hair, subsurf=1)
    box("browR", (0.065, -0.18, HZ + 0.06), (0.035, 0.01, 0.006), m_hair, subsurf=1)
    # nose
    sphere("nose", (0, -0.19, HZ - 0.025), (0.017, 0.017, 0.015), m_skin)
    # smile
    sphere("mouth", (0, -0.175, HZ - 0.075), (0.04, 0.016, 0.016),
           mat("mouth", (0.78, 0.35, 0.33, 1), 0.5))

    # ----- HAIR ----- (back mass + top + wavy side strands down to chest)
    sphere("hair_back", (0, 0.055, HZ), (0.235, 0.225, 0.255), m_hair)
    sphere("hair_top", (0, -0.03, HZ + 0.07), (0.205, 0.205, 0.16), m_hair)
    for sx in (-1, 1):
        for i, (zz, r) in enumerate([(HZ - 0.16, 0.095), (HZ - 0.33, 0.09),
                                     (HZ - 0.48, 0.075), (HZ - 0.61, 0.055)]):
            off = 0.015 * (1 if i % 2 == 0 else -1)
            sphere(f"wave{sx}_{i}", (sx * (0.20 + off), 0.05, zz), (r, r, 0.10), m_hair)

    # ----- FLOWER ----- (character's right temple = screen left)
    fc = (0.165, -0.115, HZ + 0.07)
    sphere("flower_c", fc, (0.024, 0.024, 0.024), mat("flowerc", FLOWERC, 0.4))
    for k in range(5):
        a = k * (2 * math.pi / 5)
        sphere(f"petal{k}", (fc[0] + 0.038 * math.cos(a), fc[1] - 0.008,
                             fc[2] + 0.038 * math.sin(a)), (0.026, 0.015, 0.026),
               mat("flower", FLOWER, 0.4))

    # ----- NECK -----
    cyl("neck", (0, 0, HZ - 0.20), 0.058, 0.12, m_skin)

    # ----- TORSO ----- shoulders ~1.42, waist ~0.97
    # white tee base (shorter, sits under the blazer)
    box("tee", (0, 0, 1.16), (0.16, 0.11, 0.225), m_tee, subsurf=2)
    # grey blazer shell over it (taller, covers shoulders)
    box("blazer", (0, 0.008, 1.21), (0.20, 0.135, 0.25), m_blazer, subsurf=2)
    # open front: white tee triangle showing through
    box("tee_front", (0, -0.115, 1.26), (0.05, 0.025, 0.12), m_tee, subsurf=1)
    # lapels framing the V
    box("lapelL", (-0.07, -0.125, 1.30), (0.03, 0.018, 0.12), m_blazer, rot=(0, 9, 0), subsurf=1)
    box("lapelR", (0.07, -0.125, 1.30), (0.03, 0.018, 0.12), m_blazer, rot=(0, -9, 0), subsurf=1)
    # buttons
    sphere("btn1", (0.02, -0.14, 1.13), (0.011, 0.007, 0.011), m_dark)
    sphere("btn2", (0.02, -0.14, 1.05), (0.011, 0.007, 0.011), m_dark)

    # ----- PEARL NECKLACE (double strand) -----
    torus("pearl1", (0, -0.04, 1.40), 0.075, 0.011, m_pearl, rot=(80, 0, 0))
    torus("pearl2", (0, -0.03, 1.37), 0.088, 0.011, m_pearl, rot=(78, 0, 0))

    # ----- ARMS ----- straight down at the sides (grey sleeves + skin hands)
    for sx in (-1, 1):
        cyl(f"sleeve{sx}", (sx * 0.225, 0.0, 1.12), 0.058, 0.60, m_blazer)
        sphere(f"hand{sx}", (sx * 0.225, -0.005, 0.79), (0.05, 0.05, 0.065), m_skin)

    # ----- BELT -----
    torus("belt", (0, 0, 0.99), 0.175, 0.02, m_belt)
    box("buckle", (0, -0.17, 0.99), (0.022, 0.011, 0.018),
        mat("buckle", (0.5, 0.4, 0.3, 1), 0.3, 0.6), subsurf=1)

    # ----- PELVIS + LEGS (black pants) ----- hip ~0.95 down to ankle ~0.06
    box("pelvis", (0, 0, 0.92), (0.165, 0.115, 0.10), m_pants, subsurf=2)
    for sx in (-1, 1):
        cyl(f"leg{sx}", (sx * 0.085, 0, 0.50), 0.072, 0.92, m_pants)

    # ----- SHOES (white loafers + dark sole) -----
    for sx in (-1, 1):
        box(f"shoe{sx}", (sx * 0.085, -0.035, 0.05), (0.062, 0.115, 0.04),
            mat("shoe", SHOE, 0.4), subsurf=2)
        box(f"sole{sx}", (sx * 0.085, -0.035, 0.013), (0.064, 0.12, 0.012), m_dark, subsurf=1)

    # ----- CROSSBODY BAG (brown, on character's left / screen right) -----
    box("bag_body", (0.255, -0.07, 0.98), (0.075, 0.04, 0.075), m_bag, subsurf=2)
    box("bag_flap", (0.255, -0.105, 1.02), (0.078, 0.018, 0.045),
        mat("bagflap", BAGFLAP, 0.45), subsurf=2)
    sphere("bag_clasp", (0.255, -0.115, 0.98), (0.011, 0.011, 0.011),
           mat("gold", GOLD, 0.3, 0.7))
    # strap from left shoulder diagonally across chest to bag
    cyl("strap", (0.07, -0.06, 1.20), 0.011, 0.66, m_bag, rot=(18, -22, 0))

    # group everything
    coll = bpy.data.collections.new("Character")
    bpy.context.scene.collection.children.link(coll)
    for o in list(bpy.context.scene.collection.objects):
        bpy.context.scene.collection.objects.unlink(o)
        coll.objects.link(o)


def setup_scene():
    # ground
    bpy.ops.mesh.primitive_plane_add(size=20, location=(0, 0, 0))
    g = bpy.context.active_object
    _finish(g, mat("ground", (0.92, 0.92, 0.92, 1), 0.9), smooth=False)

    # world light grey
    w = bpy.data.worlds["World"]
    w.use_nodes = True
    w.node_tree.nodes["Background"].inputs[0].default_value = (0.9, 0.9, 0.91, 1)
    w.node_tree.nodes["Background"].inputs[1].default_value = 0.5

    # key + fill lights
    bpy.ops.object.light_add(type="AREA", location=(-2.5, -3, 3))
    bpy.context.active_object.data.energy = 160
    bpy.context.active_object.data.size = 6
    bpy.ops.object.light_add(type="AREA", location=(3, -2, 2))
    bpy.context.active_object.data.energy = 70
    bpy.context.active_object.data.size = 6

    # camera front view
    bpy.ops.object.camera_add(location=(0, -4.2, 1.05), rotation=(radians(89), 0, 0))
    cam = bpy.context.active_object
    cam.data.lens = 70
    bpy.context.scene.camera = cam

    sc = bpy.context.scene
    sc.render.engine = "BLENDER_EEVEE_NEXT" if hasattr(bpy.types, "RenderEngineEevee") else "BLENDER_EEVEE"
    try:
        sc.render.engine = "BLENDER_EEVEE_NEXT"
    except Exception:
        sc.render.engine = "BLENDER_EEVEE"
    sc.render.resolution_x = 700
    sc.render.resolution_y = 1100
    sc.render.filepath = OUT_PNG
    # Standard view transform so base colors render true (not AgX-desaturated)
    try:
        sc.view_settings.view_transform = "Standard"
    except Exception:
        pass


def main():
    build()
    setup_scene()
    bpy.ops.wm.save_as_mainfile(filepath=OUT_BLEND)
    print("== Saved blend:", OUT_BLEND)
    bpy.ops.render.render(write_still=True)
    print("== Saved preview:", OUT_PNG)


main()
