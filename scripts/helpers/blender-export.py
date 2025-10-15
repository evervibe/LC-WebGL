import bpy
import sys
from pathlib import Path

# Argumente: blender --python blender-export.py -- <input> <output>
argv = sys.argv
argv = argv[argv.index('--') + 1 :]

if len(argv) < 2:
    print("Usage: blender-export.py <input> <output>")
    sys.exit(1)

input_path = Path(argv[0]).resolve()
output_path = Path(argv[1]).resolve()

print(f"[blender-export] Lade {input_path}")
bpy.ops.wm.read_homefile(use_empty=True)
bpy.ops.import_scene.fbx(filepath=str(input_path))

print(f"[blender-export] Exportiere {output_path}")
bpy.ops.export_scene.gltf(
    filepath=str(output_path),
    export_format='GLB',
    export_skins=True,
    export_morph=True,
    export_animations=True,
    export_yup=True,
    export_apply=True,
)

print("[blender-export] Fertig")
