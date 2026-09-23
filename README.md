# Shot Stopper

A browser-based goalkeeper arcade game. You face a continuous shooting drill that speeds up the
longer you survive, and it ends when you've let three past you.

**Play it:** https://avshr1.github.io/ShotStopperGame/

Built from scratch with vanilla JavaScript and the HTML Canvas API — no frameworks, no build step.
The whole game is one self-contained `index.html`. Apart from its two fonts, the only thing it
ever downloads is the hand tracker, and only if you choose to play with the camera.

## How to play

| Key | Action |
| --- | --- |
| `A` `D` | Move along your line |
| `W` | Jump — tap for a hop, hold for a full leap |
| `S` | Drop into the splits |
| `SPACE` | Dive |
| `P` | Pause |

On a phone, an on-screen button pad appears instead.

### Or play with one finger

Press **Play with one finger** on the title screen and the game uses your webcam instead of the
keyboard. Point your index finger up at the camera:

| Finger | Action |
| --- | --- |
| Move it left and right | The keeper follows your fingertip |
| Lift it | Jump. Keep it up there for a full leap |
| Bend it down | The splits |
| Flick it sideways, fast | Dive that way. Up-and-across for a top corner |

Hold your finger still wherever it's comfortable and the game kicks off from there. Resting your
elbow on the desk works best: small movements cover the whole goal. The setup screen shows your
hand with the steering finger picked out and the jump and splits lines drawn on it, and a practice
flick shows up as a dive. If it loses sight of your finger mid-game it pauses itself, and it
carries on when your finger is back. `C` re-centres, `P` pauses.

Camera runs keep their own best score, separate from the keyboard one.

The hand tracking is Google's MediaPipe, loaded the first time you use it (about 20 MB, then
cached by the browser). It runs entirely on your device, and the video is never uploaded or
recorded. The camera needs the page served over https or from localhost, so use the GitHub Pages
link or VS Code's Live Server. Some browsers won't allow it for a file opened straight from disk.

The faint ring around the keeper is your reach — if the ball touches it, you've saved it. The inner
ring is the catch zone: hold the ball there and you keep it. Clip the outer edge and you only parry,
and a striker may well follow up on the loose ball.

Each stance covers a different part of the goal. Standing covers the bottom, a leap gets you to the
crossbar, and the splits go wide and low at the cost of all your height. Jumping, diving and holding
the splits all drain stamina, so you can't spam them.

Watch the striker. In his last stride he leans the way he's aiming, so a good read gets you moving
before the ball does.

## Scoring

- Save it on your feet — **1 point**
- Save it with a leap, a dive or the splits — **2 points**
- Ten saves in a row wins back a ball you've let in

Three goals conceded ends the run. Your best score is saved in the browser, and the end screen has a
button to share your score.

## Implementation notes

A few problems that turned out to be more interesting than expected:

**The hitbox is drawn on screen.** An earlier version modelled the keeper's collision as fourteen
capsules following his actual limbs, which meant balls could slip through real gaps between his
legs — and because the shape was invisible and irregular, you could never build any intuition about
it. It's now a single ellipse, rendered on the canvas, that *is* the collision test. What you see is
exactly what stops the ball.

**Jumping is real physics.** A jump is one upward impulse with gravity applied each frame and a
landing. Gravity softens to 46% near the apex, which buys about four tenths of a second of hang time —
enough that a top-corner save is possible, not so much that mistiming the jump is free. Releasing `W`
early cuts the rise short, so tap and hold give different heights.

**Shots are checked for reachability before they're taken.** Targets used to be chosen at random and
independently, which meant the game could ask for the top-left corner and then the bottom-right
400ms later — unsaveable no matter how well you played. Measured across ~1,400 generated shots, 43%
of consecutive pairs were physically impossible.

Every target is now validated against the shots already in the air. The time between two arrivals
has to cover both the run (capped at the keeper's actual top speed, minus the reach he already has
at each end) and the stance change — going from a high ball to a low one means landing out of a leap
before getting down into the splits, which costs about 0.7s before he's moved sideways at all. Shot
types have different flight times, so a rocket struck after a chip can overtake it; shots are
therefore scheduled by when they *land*, with the striker's run-up absorbing the slack. Impossible
pairs went from 43% to zero, with no measurable loss of variety.

**Shadows are real silhouettes.** The sun sits low behind the far stand, so the goal frame and the
keeper cast shadows toward the camera that lengthen into the evening, then split into faint twin
shadows under the floodlights. Each light is an affine ground projection, so the keeper's shadow is
made by drawing him into a small offscreen canvas, flooding it black, and throwing that onto the grass
through a single canvas transform — it always matches his pose, and detaches from his feet when he
leaps.

**Nothing just disappears.** A goal carries on into the net and drops down the back of it, a parry
spins off the gloves, the woodwork sends the ball ricocheting out, and a parry that leads to a
follow-up visibly bounces out to the striker who then shoots it.

**The camera controls are measured in palm-lengths.** The keeper follows the tip of your index
finger, but every distance (how far to move for a post, how far up counts as a jump) is in
multiples of your own palm size, because the palm is the steadiest thing the tracker sees. So the
controls feel the same whether you sit close to the camera or further back. A fingertip wobbles
more than a palm, so a one-euro filter steadies the keeper when your finger is still without adding
lag when it moves.

A flick is harder to spot than it sounds, because at 30 frames a second a quick flick can fall
almost entirely between two frames. So a dive fires on either two fast frames in a row, or one very
fast frame that the finger doesn't snap straight back from. A tracking glitch jumps out and straight
back, so it doesn't count. Tested across 15–60 fps with synthetic hands: no false dives from
ordinary fast movement, glitches or jitter, and every full flick caught at 30 fps.

**Camera runs get time back for the tracking delay.** A webcam and a hand tracker are slower than a
key press. Before kick-off the game measures that delay, from the moment a frame is captured to
the moment the keeper reacts, and every shot in that run gets exactly that much extra time in the
air. The reachability check allows for it too. With a bot playing both ways, camera and keyboard
save rates came out level.

**Everything is generated at runtime.** No image or audio files — the stadium, players and ball are
drawn with canvas paths, and every sound effect is synthesised with the Web Audio API. The static
grass is cached in an offscreen canvas and repainted only when the time of day has visibly shifted,
which cut the pitch's per-frame cost by about 9×.

## Built with

- HTML, CSS, JavaScript
- HTML Canvas API
- Web Audio API
- MediaPipe Hand Landmarker, for camera mode only