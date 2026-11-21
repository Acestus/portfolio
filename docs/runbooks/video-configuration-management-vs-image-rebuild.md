# Configuration management versus rebuilding the image

From the portfolio root, create the demo repo under `/tmp/acestus-video-demos/`. Run the remaining commands from the new repo, or open its README in Neovim.

~~~fish
python3 scripts/seed_video_demo.py configuration-management-vs-image-rebuild-demo
~~~


[Read the portfolio guide](https://acestus.com/docs/video-configuration-management-vs-image-rebuild/).

Use Python 3 and temporary local files as stand-ins for a host and images. Run one line at a time in fish.

## 1. Converge an existing host

Apply the same desired setting twice and show that only the first run changes the file.

~~~fish
python3 converge_an_existing_host.py
~~~

## 2. Build a replacement image

Create a new artifact and keep the previous one available.

~~~fish
python3 build_a_replacement_image.py
~~~

## 3. Compare recovery paths

Show the same expected setting after convergence or image rollback.

~~~fish
python3 compare_recovery_paths.py
~~~
