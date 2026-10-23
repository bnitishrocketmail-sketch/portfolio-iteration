set -e
python3 s3_final.py && python3 fixdesk.py .78 save && python3 s6_refine.py && python3 s7_him.py && python3 s5_plate.py && python3 s4_layers.py | grep -v piece && python3 s8_face.py save
