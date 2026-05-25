import pickle
import pprint
import os

base_dir = r"C:\Users\Poobesh\Downloads\dashboard"

files_to_check = [
    "feature_names.pkl",
    "label_encoders.pkl",
    "categorical_modes.pkl",
    # We can skip full models for a quick look
]

for file in files_to_check:
    path = os.path.join(base_dir, file)
    print(f"\n--- {file} ---")
    try:
        with open(path, "rb") as f:
            data = pickle.load(f)
            if isinstance(data, dict):
                for k, v in data.items():
                    print(f"{k}: {type(v)}")
                    if hasattr(v, 'classes_'):
                        print(f"  Classes: {v.classes_}")
            else:
                pprint.pprint(data)
    except Exception as e:
        print(f"Error loading {file}: {e}")
