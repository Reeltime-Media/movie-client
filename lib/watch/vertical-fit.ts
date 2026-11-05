/** Every Short Series episode is a 9:16 picture centred in a 16:9 frame with black bars left and right. */
const PICTURE_ASPECT = 9 / 16;
const FRAME_ASPECT = 16 / 9;

/**
 * Size of the 16:9 video frame that makes the 9:16 picture inside it as large as
 * the player allows (never cropped). Centre the frame in the player and let the
 * player clip the empty bars. Null while the player has no size yet.
 *
 * Phone portrait (591 x 1280): the picture is 591 wide instead of the 186 a plain
 * 16:9 fit leaves. A landscape player gets the plain fit back (frame = player height).
 */
export function fitVerticalPicture(
  playerWidth: number,
  playerHeight: number,
): { w: number; h: number } | null {
  if (!(playerWidth > 0) || !(playerHeight > 0)) return null;
  const h = Math.round(Math.min(playerHeight, playerWidth / PICTURE_ASPECT));
  return { w: Math.round(h * FRAME_ASPECT), h };
}
