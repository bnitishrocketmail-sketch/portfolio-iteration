/* the site's light / dark switch (28 Oct, Nitish: "a normal… switch… the inside of it should look like it is engraved in…
   the corners… smooth beveled… iOS rim lighting around, and inside shadows… The ellipse over it, the main switch, the
   white one, or the black one based on whatever… version the website is in… a little accent… lighting… so that it looks a
   little real… the dark word is written on the right side… once it is light, it's written light"). The track is cut into
   the surface it sits on (a step darker than it, shadowed from above inside, its lower lip catching the light, the rim lit
   top and bottom); the knob is a lit bead — white in light, black in dark — that slides to the right for dark. A switch
   to assistive tech (role switch, checked when dark). Its look is in profile.css (.ts4) */
export default function ThemeSwitch04({ dark, toggle }: { dark: boolean; toggle: () => void }) {
  return (
    <button type="button" role="switch" aria-checked={dark} aria-label="Dark mode" className={`ts4${dark ? ' on' : ''}`} onClick={toggle}>
      <span className="ts4-track" aria-hidden="true"><span className="ts4-knob" /></span>
      <span className="ts4-label" aria-hidden="true">{dark ? 'Dark' : 'Light'}</span>
    </button>
  );
}
