import { useEffect, type RefObject } from 'react';

/* the main container's edge light following the pointer (a control, 23 Oct; the light itself is CSS, profile.css "the edge
   light"). The light stands where the pointer is: its direction from the frame's centre, eased, is written to the frame
   (on the light's own layer, .edge4) as --la (the angle round the rim, 0 up, clockwise, for the conic gradients) and --lx/--ly (the same as a unit vector,
   for the shadows). Off the page, it goes back to the top-left corner. Eased by time, so a slow frame rate settles as
   soon; a frame is written only when the light has moved. */
export function useEdgeLight(frame: RefObject<HTMLElement | null>, layer: RefObject<HTMLElement | null>, on: boolean) {
  useEffect(() => {
    const el = frame.current, ly = layer.current; if (!el || !ly || !on) return;
    const home = () => { const r = el.getBoundingClientRect(), l = Math.hypot(r.width, r.height) || 1; return { x: -r.width / l, y: -r.height / l }; };
    let t = home(), v = { ...t }, prev = performance.now(), raf = 0, last = '';
    const move = (e: PointerEvent) => {
      if (e.pointerType === 'touch') return;
      const r = el.getBoundingClientRect(), dx = e.clientX - (r.left + r.width / 2), dy = e.clientY - (r.top + r.height / 2), l = Math.hypot(dx, dy);
      if (l > 24) t = { x: dx / l, y: dy / l }; /* at the very centre the direction is undecided: keep the last */
    };
    const out = (e: PointerEvent) => { if (!e.relatedTarget) t = home(); };
    const tick = (now: number) => {
      const k = 1 - Math.exp(-(now - prev) / 160); prev = now;
      v.x += (t.x - v.x) * k; v.y += (t.y - v.y) * k;
      const l = Math.hypot(v.x, v.y) || 1, x = v.x / l, y = v.y / l, a = (Math.atan2(x, -y) * 180 / Math.PI + 360) % 360;
      const key = `${x.toFixed(3)},${y.toFixed(3)}`;
      if (key !== last) { last = key; ly.style.setProperty('--lx', x.toFixed(3)); ly.style.setProperty('--ly', y.toFixed(3)); ly.style.setProperty('--la', `${a.toFixed(1)}deg`); }
      raf = requestAnimationFrame(tick);
    };
    addEventListener('pointermove', move); document.addEventListener('pointerout', out); raf = requestAnimationFrame(tick);
    return () => { removeEventListener('pointermove', move); document.removeEventListener('pointerout', out); cancelAnimationFrame(raf); ['--lx', '--ly', '--la'].forEach(p => ly.style.removeProperty(p)); };
  }, [frame, layer, on]);
}
