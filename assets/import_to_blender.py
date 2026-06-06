import bpy
import os

ASSET_DIR = os.path.dirname(os.path.abspath(__file__))
OUT_BLEND = os.path.join(ASSET_DIR, "portfolio_models.blend")

# Files to import, in order. (filename, label)
FILES = [
    ("walking.glb", "walking_glb"),
    ("sample.glb", "sample_glb"),
    ("walking.fbx", "walking_fbx"),
    ("sample.fbx", "sample_fbx"),
    ("standing .fbx", "standing_fbx"),
]

SPACING = 2.5  # meters between each model along X


def clear_scene():
    bpy.ops.object.select_all(action="SELECT")
    bpy.ops.object.delete(use_global=False)
    # also purge orphan data
    bpy.ops.outliner.orphans_purge(do_recursive=True)


def import_file(path):
    ext = os.path.splitext(path)[1].lower()
    if ext == ".glb" or ext == ".gltf":
        bpy.ops.import_scene.gltf(filepath=path)
    elif ext == ".fbx":
        # automatic_bone_orientation keeps Mixamo rigs sane
        bpy.ops.import_scene.fbx(filepath=path, automatic_bone_orientation=True)
    else:
        raise RuntimeError(f"Unsupported file type: {path}")


def main():
    clear_scene()

    x_offset = 0.0
    for fname, label in FILES:
        fpath = os.path.join(ASSET_DIR, fname)
        if not os.path.exists(fpath):
            print(f"!! SKIP (not found): {fpath}")
            continue

        before = set(bpy.data.objects)
        import_file(fpath)
        after = set(bpy.data.objects)
        new_objs = after - before

        # Put each import in its own collection and offset along X
        coll = bpy.data.collections.new(label)
        bpy.context.scene.collection.children.link(coll)

        for obj in new_objs:
            # move root (parentless) objects; children follow
            if obj.parent is None:
                obj.location.x += x_offset
            # relink into the labeled collection
            for c in obj.users_collection:
                c.objects.unlink(obj)
            coll.objects.link(obj)

        print(f"++ Imported {fname}: {len(new_objs)} objects at x={x_offset}")
        x_offset += SPACING

    bpy.ops.wm.save_as_mainfile(filepath=OUT_BLEND)
    print(f"== Saved: {OUT_BLEND}")


main()
