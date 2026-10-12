# s02a smoke test of the collection layer (not a real scene)

The scene is the template with illustrative content (BTC/USDT plate, "50x volume" tag, z-score board), used to test HOST / SIGN / LAB / TR.

Round 1: hosts too small at s 0.8, lab props collided with the hosts, plate title hidden by the tag, chalkboard covered the plate, bench props beside Pico. Fixed: default s 0.95, props moved right, template layout (plate y 400, tag at the plate's right, board y 690).
Round 2: checked chapter sign, wave in (leaf curtain), point, carry L (flask) and R (seed), reactions surprise / worry / jump / magnifier / think, close-up side -1 at s 1.5. `HOST.owlPose` / `picoPose` crashed on a null ctx (stage drawn before the poseOnly return): fixed in `46_duo.js`.
Round 3: re-snapped after the fixes, no console errors; jump leaves the ground, glove carries upright items under the fingers.
