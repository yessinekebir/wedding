/* ==========================================================================
   Full-bleed envelope intro gate
   Geometry and layer notes live in css/animations.css.

   GSAP property names: `rotationX` and `z`, not `rotateX` and `translateZ`.
   ========================================================================== */

export const initEnvelope = () => {
  const gate = document.getElementById("intro-gate");
  const mainContent = document.getElementById("main-content");
  if (!mainContent) return;

  const html = document.documentElement;

  // Reveal the page with no transition at all. Used for the second visit, the
  // GSAP-missing path, and as the tail of every animated route.
  const showContent = () => {
    mainContent.removeAttribute("inert");
    mainContent.removeAttribute("aria-hidden");
    mainContent.style.opacity = "1";
    mainContent.style.visibility = "visible";
    html.classList.remove("gate-open");
  };

  // GSAP blocked or offline. CSS `.no-js` already hides the gate; belt and
  // braces in case the class was not applied.
  if (typeof gsap === "undefined") {
    if (gate) gate.remove();
    showContent();
    return;
  }

  if (!gate) {
    showContent();
    return;
  }

  // Second visit: no gate at all. js/animations.js reads the same flag and
  // fires triggerSiteEntrance() itself, so do not dispatch `site-entered` here
  // or the hero timeline runs twice.
  if (sessionStorage.getItem("introShown")) {
    gate.remove();
    showContent();
    return;
  }

  const q = (sel) => gate.querySelector(sel);
  const lens = q(".gate-lens");
  const scene = q(".gate-scene");
  const back = q(".gate-back");
  const interior = q(".gate-interior");
  const flapShadow = q(".gate-flap-shadow");
  const flap = q(".gate-flap");
  const faces = gate.querySelectorAll(".gate-face");
  const pocket = q(".gate-pocket");
  const glow = q(".gate-glow");
  const slot = q(".gate-seal-slot");
  const ring = q(".gate-seal-ring");
  const breath = q(".gate-seal-breath");
  const seal = q(".gate-seal");
  const glint = q(".gate-seal-glint");
  const wash = q(".gate-wash");
  const music = document.getElementById("bg-music");

  // GSAP does not read media queries, so every branch is taken here in JS
  // BEFORE any timeline is built.
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  // Fullscreen blur costs 30+ ms/frame on low-end Android.
  const allowBlur = window.matchMedia(
    "(min-width: 900px) and (pointer: fine)",
  ).matches;

  /* ----------------------------------------------------------------------
     Base state. Depth is real translateZ, not z-index: inside preserve-3d
     the browser depth-sorts by geometry and z-index does not arbitrate.
     Set from JS so GSAP owns the transform channel and never has to recover
     these values by parsing a computed matrix3d.
     ---------------------------------------------------------------------- */
  gsap.set(back, { z: -40 });
  gsap.set(flapShadow, { z: -28, transformOrigin: "50% 0" });
  gsap.set(flap, { z: 8, transformOrigin: "50% 0" });
  gsap.set(pocket, { z: 24 });
  gsap.set(glow, { z: 30 });
  // No z on the seal slot — it lives outside .gate-stage (see index.html) so it
  // is not part of the scene's 3D context at all.

  // Modal semantics while the gate is up.
  html.classList.add("gate-open");
  mainContent.setAttribute("inert", "");
  mainContent.setAttribute("aria-hidden", "true");

  const idleTweens = [];
  let entranceTl = null;
  let openTl = null;
  let opened = false;
  let revealed = false;

  const focusSeal = () => {
    try {
      seal.focus({ preventScroll: true });
    } catch (e) {
      seal.focus();
    }
  };

  /* ----------------------------------------------------------------------
     Handoff. Idempotent — Escape and the full sequence both land here.
     ---------------------------------------------------------------------- */
  const revealSite = () => {
    if (revealed) return;
    revealed = true;

    sessionStorage.setItem("introShown", "true");
    // Drop the fullscreen GPU texture the moment it stops being visible.
    lens.style.display = "none";
    gate.classList.remove("is-opening");

    document.removeEventListener("keydown", onKeyDown, true);
    showContent();
    window.dispatchEvent(new CustomEvent("site-entered"));
  };

  const teardown = () => {
    gate.remove();
  };

  /* ----------------------------------------------------------------------
     Idle affordance — three stacked cues, no text.
     ---------------------------------------------------------------------- */
  const startIdle = () => {
    idleTweens.push(
      gsap.fromTo(
        ring,
        { scale: 0.92, opacity: 0.5 },
        {
          scale: 1.78,
          opacity: 0,
          duration: 2.2,
          ease: "power2.out",
          repeat: -1,
          repeatDelay: 1.5,
        },
      ),
    );
    idleTweens.push(
      gsap.fromTo(
        glint,
        { xPercent: -145 },
        {
          xPercent: 145,
          duration: 1.5,
          ease: "power2.inOut",
          repeat: -1,
          repeatDelay: 2.6,
        },
      ),
    );
    idleTweens.push(
      gsap.to(breath, {
        scale: 1.032,
        duration: 2.4,
        ease: "sine.inOut",
        repeat: -1,
        yoyo: true,
      }),
    );
  };

  const stopIdle = () => {
    idleTweens.forEach((t) => t.kill());
    idleTweens.length = 0;
    gsap.set(breath, { scale: 1 });
    gsap.set(ring, { opacity: 0 });
  };

  /* ----------------------------------------------------------------------
     Entrance — a mini reverse-dolly, so entrance and exit share one camera.
     ---------------------------------------------------------------------- */
  if (reduced) {
    gsap.set(scene, { z: 0, rotationX: 0 });
    gsap.set(flapShadow, { scaleY: 1, opacity: 1 });
    gsap.set(seal, { opacity: 1, scale: 1, y: 0 });
    gsap.set(ring, { opacity: 0.22, scale: 1.12 }); // static ring, no pulse
    focusSeal();
  } else {
    gsap.set(seal, { opacity: 0 });
    entranceTl = gsap.timeline();
    entranceTl
      // A mini reverse-dolly, so entrance and exit share one camera. Kept
      // shallow: the flap and pocket clip-paths are relative to their own
      // boxes, so they cannot be overscanned to compensate, and a deeper start
      // leaves a visible ivory margin around the sheet on the first frames.
      .fromTo(
        scene,
        { z: -180, rotationX: 2.4 },
        { z: 0, rotationX: 0, duration: 1.3, ease: "power3.out" },
        0,
      )
      .fromTo(
        flapShadow,
        { scaleY: 0.5, opacity: 0 },
        { scaleY: 1, opacity: 1, duration: 1, ease: "power2.out" },
        0.18,
      )
      // A wax stamp landing: the drop, then a squash and an elastic settle.
      .fromTo(
        seal,
        { opacity: 0, scale: 0.25, y: -70 },
        {
          opacity: 1,
          scale: 1,
          y: 0,
          duration: 0.62,
          ease: "back.out(1.8)",
        },
        0.6,
      )
      .to(
        seal,
        { scaleX: 1.09, scaleY: 0.9, duration: 0.09, ease: "power2.in" },
        1.22,
      )
      .to(
        seal,
        {
          scaleX: 1,
          scaleY: 1,
          duration: 0.95,
          ease: "elastic.out(1, 0.55)",
        },
        1.31,
      )
      .call(() => {
        startIdle();
        focusSeal();
      }, null, 1.35);
  }

  /* ----------------------------------------------------------------------
     Open
     ---------------------------------------------------------------------- */
  const buildOpenTimeline = () => {
    const tl = gsap.timeline();

    tl.to(seal, { scale: 0.86, y: 3, duration: 0.13, ease: "power2.in" }, 0)
      .to(seal, { scale: 1.08, y: -10, duration: 0.22, ease: "power3.out" }, 0.13)
      // POSITIVE 180, not negative. Either sign lifts the flap above its hinge
      // past 90 degrees, but the sign decides which way it travels in z:
      //   -180 sends it AWAY (z = 8 - y*sin), so by ~11 degrees its lower half
      //         has already crossed the cast-shadow plane at z -28 and
      //         .gate-back at z -40, and those planes depth-sort in front of
      //         it — a hard horizontal edge sweeps down the flap with a dark
      //         band below it, exactly the artifact rule 2 warns about.
      //   +180 brings it TOWARD the camera (z = 8 + y*sin, max 546 at 90deg),
      //         so it stays in front of every other layer for the whole swing
      //         and reads as the lid opening at you before it lifts away.
      .to(flap, { rotationX: 180, duration: 1.05, ease: "power2.inOut" }, 0.3)
      .to(flapShadow, { scaleY: 0, duration: 0.75, ease: "power2.in" }, 0.3)
      .to(
        seal,
        {
          y: -92,
          rotation: 24,
          scale: 1.3,
          opacity: 0,
          duration: 0.5,
          ease: "power2.in",
        },
        0.32,
      )
      .to(interior, { opacity: 1, duration: 0.7, ease: "power1.out" }, 0.55)
      .to(glow, { opacity: 1, duration: 0.85, ease: "power2.out" }, 0.7)
      // Crossover insurance, derived not guessed: for power2.inOut, output
      // 100/180 = 0.556 occurs at input 1 - sqrt(0.444/2) = 0.529, so
      // 0.30 + 0.529 x 1.05 = 0.86. Applied to the FACES, not to .gate-flap —
      // opacity < 1 on the flap would flatten its preserve-3d children.
      .to(faces, { opacity: 0, duration: 0.24, ease: "none" }, 0.86)
      // Camera push: a dolly on the preserve-3d scene under a fixed
      // perspective of 1200 (apparent scale p/(p-z) = 5.5x; keep z <= 0.85p or
      // it explodes and inverts). Not scale() on a wrapper, and not an
      // animated `perspective` — that is a lens zoom, non-composited, and it
      // eases badly.
      //
      // The pocket and back deliberately do NOT get their own z tweens. Moving
      // them relative to the scene does produce real perspective divergence,
      // but because each panel is projected about the shared apex at a
      // different scale, the seams unweld: the pocket's V climbs away from the
      // flap's V and the side wedges shear off behind it. The sheet has to stay
      // rigid — the flap is the only thing that moves, everything else is
      // carried by the camera.
      .to(scene, { z: 982, duration: 1.3, ease: "power2.in" }, 1.0)
      // The wash overlaps the dolly on purpose: composited layers rasterize
      // once at creation scale, so the peak 5.5x frame is a stretched 1x
      // bitmap. At t=1.55 it is ~90% washed out by the time that frame lands.
      .to(wash, { opacity: 1, duration: 0.72, ease: "power2.in" }, 1.55);

    if (allowBlur) {
      // Reads as motion blur, and makes raster blur indistinguishable from
      // intent. Set as a `from` so no filter sits on the lens during idle.
      tl.fromTo(
        lens,
        { filter: "blur(0px)" },
        { filter: "blur(7px)", duration: 0.55, ease: "power2.in" },
        1.7,
      );
    }

    // The 0.65s dissolve deliberately overlaps triggerSiteEntrance(), so the
    // hero is already animating as the ivory lifts.
    tl.call(revealSite, null, 2.27).to(
      gate,
      { opacity: 0, duration: 0.65, ease: "power2.out", onComplete: teardown },
      2.3,
    );

    return tl;
  };

  const buildReducedTimeline = () =>
    gsap
      .timeline()
      .to(wash, { opacity: 1, duration: 0.3, ease: "none" }, 0)
      .call(revealSite, null, 0.3)
      .to(
        gate,
        { opacity: 0, duration: 0.3, ease: "none", onComplete: teardown },
        0.3,
      );

  const openGate = () => {
    if (opened) return;
    opened = true;

    // Must be called synchronously inside the click handler. A GSAP onStart or
    // .call() is a separate task and Safari rejects it as non-user-initiated.
    // (#bg-music does not exist yet; the null guard keeps the hook alive.)
    if (music) {
      const played = music.play();
      if (played && typeof played.catch === "function") {
        played.catch(() => {});
      }
    }

    if (entranceTl) {
      // Clicking mid-entrance would otherwise leave the seal frozen part-way
      // through its drop, so the press and lift would play on an invisible or
      // half-scaled seal. Snap it to its resting state first.
      const unfinished = entranceTl.progress() < 1;
      entranceTl.kill();
      if (unfinished) {
        gsap.set(seal, { opacity: 1, scale: 1, scaleX: 1, scaleY: 1, y: 0 });
        gsap.set(scene, { z: 0, rotationX: 0 });
        gsap.set(flapShadow, { scaleY: 1, opacity: 1 });
      }
    }
    stopIdle();
    gate.classList.add("is-opening");

    openTl = reduced ? buildReducedTimeline() : buildOpenTimeline();
  };

  // Escape skips instantly — this replaces the removed "Salta Intro" button.
  const skipGate = () => {
    opened = true;
    if (entranceTl) entranceTl.kill();
    if (openTl) openTl.kill();
    stopIdle();
    revealSite();
    teardown();
  };

  function onKeyDown(e) {
    if (e.key === "Escape") {
      e.preventDefault();
      skipGate();
      return;
    }
    // Focus is trapped on the seal for as long as the gate is up.
    if (e.key === "Tab") {
      e.preventDefault();
      if (!opened) focusSeal();
      return;
    }
    if (opened) return;
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    if (["Shift", "Control", "Alt", "Meta", "CapsLock"].includes(e.key)) return;
    // Enter and Space on the focused button already synthesise a click; letting
    // them through here as well would open twice.
    if ((e.key === "Enter" || e.key === " ") && document.activeElement === seal) {
      return;
    }
    openGate();
  }

  // Clicking anywhere opens; the seal's own click bubbles up to here, so the
  // button needs no separate listener.
  gate.addEventListener("click", openGate);
  document.addEventListener("keydown", onKeyDown, true);
};
