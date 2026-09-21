# Shot Stopper

A browser-based goalkeeper arcade game. You face a continuous shooting drill that speeds up the
longer you survive, and it ends when you've let three past you.

**Play it:** https://avshr1.github.io/ShotStopperGame/

Built from scratch with vanilla JavaScript and the HTML Canvas API.

## How to play

| Key | Action |
| --- | --- |
| `A` `D` | Move along your line |
| `W` | Jump — tap for a hop, hold for a full leap |
| `S` | Drop into the splits |
| `SPACE` | Dive |
| `P` | Pause |

On a phone, an on-screen button pad appears instead.

The faint ring around the keeper is your reach — if the ball touches it, you've saved it. The inner
ring is the catch zone: hold the ball there and you keep it. Clip the outer edge and you only parry,
and a striker may well follow up on the loose ball.

Each stance covers a different part of the goal. Standing covers the bottom, a leap gets you to the
crossbar, and the splits go wide and low at the cost of all your height. Jumping, diving and holding
the splits all drain stamina, so you can't spam them.

## Scoring

- Save it on your feet — **1 point**
- Save it with a leap, a dive or the splits — **2 points**

Three goals conceded ends the run. Your best score is saved in the browser.

## Implementation notes

A few problems that turned out to be more interesting than expected:

**The hitbox is drawn on screen.** An earlier version modelled the keeper's collision as fourteen
capsules following his actual limbs, which meant balls could slip through real gaps between his
legs — and because the shape was invisible and irregular, you could never build any intuition about
it. It's now a single ellipse, rendered on the canvas, that *is* the collision test. What you see is
exactly what stops the ball.

**Jumping is real physics.** Holding `W` used to raise a target position the keeper followed, so he
would hover in the air indefinitely. Now a jump is one upward impulse with gravity applied each
frame and a landing. Gravity softens to 46% near the apex, which buys about four tenths of a second
of hang time — enough that a top-corner save is possible, not so much that mistiming the jump is
free. Releasing `W` early cuts the rise short, so tap and hold give different heights.

**Shots are checked for reachability before they're taken.** Targets used to be chosen at random and
independently, which meant the game could ask for the top-left corner and then the bottom-right
400ms later — unsaveable no matter how well you played. Measured across ~1,400 generated shots,
43% of consecutive pairs were physically impossible.

Every target is now validated against the shots already in the air. The time between two arrivals
has to cover both the run (capped at the keeper's actual top speed, minus the reach he already has
at each end) and the stance change — going from a high ball to a low one means landing out of a leap
before getting down into the splits, which costs about 0.7s before he's moved sideways at all. A
target that doesn't fit is re-rolled.

The subtler half of that bug: shot types have different flight times, so a rocket struck *after* a
chip can overtake it and land on top of it. Arrival order wasn't spawn order. Shots are now scheduled
by when they land, with the striker's run-up absorbing the slack. Impossible pairs went from 43% to
zero, with no measurable loss of variety.

**Everything else is generated at runtime.** No image or audio files — the stadium, keeper, strikers
and ball are drawn with canvas paths, and every sound effect is synthesised with the Web Audio API.

## Built with

- HTML, CSS, JavaScript
- HTML Canvas API
- Web Audio API