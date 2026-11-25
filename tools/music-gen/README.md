# Music generator

The Python scripts (numpy, scipy) that made the recorded songs in `music/`, by Ron with Opus 5.5. `engine.py` and
`lib2.py` are the shared synth; each `s_*.py` makes one story's songs (`s_menus.py` the menus). The transitions'
recordings (`s_trans.py`) weren't used: the transitions keep their built-in jingles.

After making new `.ogg` files, make the AAC copies the iPad needs, next to them:

    cd music && for f in */*.ogg; do ffmpeg -y -i "$f" -c:a aac -b:a 112k -movflags +faststart "${f%.ogg}.m4a"; done

A song's file names are listed in `MUS_FILES` in `js/audio.js`.
