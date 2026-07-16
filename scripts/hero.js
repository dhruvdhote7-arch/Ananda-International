document.addEventListener("DOMContentLoaded", () => {
  /* =========================================================
     DEPENDENCY CHECK
     ========================================================= */

  if (
    typeof gsap === "undefined" ||
    typeof ScrollTrigger === "undefined"
  ) {
    console.error(
      "ANANDA: GSAP or ScrollTrigger is missing. Check the CDN script tags."
    );

    return;
  }

  gsap.registerPlugin(ScrollTrigger);


  /* =========================================================
     REDUCED MOTION
     ========================================================= */

  const reducedMotion =
    window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;


  /* =========================================================
     1. PHOTO FAN CONTROLS
     ========================================================= */

  const FAN_CONTROLS = {
    /*
     * FAN POSITION
     *
     * 0.50 = centre
     * lower = move left
     * higher = move right
     */
    horizontalPosition: 0.50,


    /*
     * Lower = move fan upward
     * Higher = move fan downward
     */
    verticalPosition: 0.43,


    /*
     * FAN OPENING ANGLES
     */
    desktopOpenStart: -106,
    desktopOpenEnd: 106,

    laptopOpenStart: -100,
    laptopOpenEnd: 100,

    tabletOpenStart: -90,
    tabletOpenEnd: 90,

    mobileOpenStart: -74,
    mobileOpenEnd: 74,


    /*
     * CLOSED STACK
     */
    closedCardSpacing: 1.20,


    /*
     * CARD LIFT WHILE OPENING
     */
    activeLiftY: 18,

    activeLiftZ: 64,


    /*
     * SEQUENTIAL CARD OPENING
     */
    stagger: 0.78
  };


  /* =========================================================
     2. GEAR SPEED CONTROLS
     ========================================================= */

  /*
   * MAIN GEAR SPEED CONTROL
   *
   * Each fully opened card advances
   * the mechanism by this many degrees.
   *
   * 12 = extremely slow
   * 18 = luxury slow
   * 24 = slow
   * 28 = slightly more visible
   */
  const GEAR_DEGREES_PER_CARD = 18;


  /*
   * GEAR ROTATION RATIOS
   *
   * Positive = clockwise
   * Negative = anticlockwise
   *
   * Outer = complete PNG gear
   * Inner = clipped inner calibre
   */
  const GEAR_MOTION = {
    /* GEAR A — gb1 */
    a: {
      outer: 0.55,
      inner: -1.20
    },


    /* GEAR B — gb2 */
    b: {
      outer: -0.48,
      inner: 1.30
    },


    /* GEAR C — gb3 */
    c: {
      outer: 0.44,
      inner: -1.15
    },


    /* GEAR D — gb4 */
    d: {
      outer: -0.50,
      inner: 1.35
    },


    /* GEAR E — gs5 */
    e: {
      outer: 0.68,
      inner: -1.55
    },


    /* GEAR F — gs6 */
    f: {
      outer: -0.78,
      inner: 1.80
    },


    /* GEAR G — gs7 */
    g: {
      outer: 0.86,
      inner: -2.00
    }
  };


  /* =========================================================
     3. BACKFLOW SMOKE CONTROLS
     ========================================================= */

  const SMOKE_CONTROLS = {
    /*
     * NORMALISED SMOKE PATH
     *
     * x:
     * 0 = left
     * 1 = right
     *
     * y:
     * 0 = top
     * 1 = bottom
     */
    path: [
      {
        x: 0.505,
        y: 0.112
      },

      {
        x: 0.510,
        y: 0.180
      },

      {
        x: 0.545,
        y: 0.255
      },

      {
        x: 0.595,
        y: 0.340
      },

      {
        x: 0.660,
        y: 0.425
      },

      {
        x: 0.725,
        y: 0.510
      },

      {
        x: 0.770,
        y: 0.590
      },

      {
        x: 0.790,
        y: 0.660
      },

      {
        x: 0.780,
        y: 0.720
      },

      {
        x: 0.735,
        y: 0.770
      },

      {
        x: 0.665,
        y: 0.810
      },

      {
        x: 0.590,
        y: 0.845
      },

      {
        x: 0.535,
        y: 0.875
      }
    ],


    /* SMOKE EMITTER */
    emitterX: 0.505,

    emitterY: 0.112,


    /* FLOW SPEED */
    flowSpeed: 18,


    /* DOWNWARD WEIGHT */
    gravity: 4.8,


    /* CURVE FOLLOWING */
    pathAttraction: 18,


    /* ORGANIC MOVEMENT */
    turbulence: 0.08,

    sideSway: 0.08,


    /* VISCOSITY */
    drag: 0.991,


    /* DENSITY */
    emissionRate: 21,

    maxStreamParticles: 220,


    /* LIFETIME */
    lifeMin: 8.5,

    lifeMax: 11.5,


    /* PARTICLE SIZE */
    startSizeMin: 7.5,

    startSizeMax: 14,

    endSizeMin: 50,

    endSizeMax: 60,


    /* SMOKE COLOUR */
    smokeCore: {
      r: 255,
      g: 255,
      b: 253
    },


    smokeMid: {
      r: 248,
      g: 246,
      b: 242
    },


    smokeEdge: {
      r: 224,
      g: 220,
      b: 215
    },


    /* STREAM VISIBILITY */
    streamAlphaStart: 0.85,

    streamAlphaEnd: 0.99,


    /* BASIN POSITION */
    poolCenterX: 0.50,

    poolY: 0.885,

    poolWidth: 0.46,

    poolHeight: 0.038,


    /* BASIN FOG */
    poolSpawnPerArrival: 3,

    maxPoolParticles: 320,


    poolSizeMin: 28,

    poolSizeMax: 82,


    poolAlphaMin: 0.018,

    poolAlphaMax: 0.25,


    poolGrowthPerSecond: 0.045,

    poolViscosity: 0.935,

    poolSettleStrength: 4.5,

    poolDrift: 0.025,


    /* CURVE QUALITY */
    splineSamplesPerSegment: 22
  };


  /* =========================================================
     4. PHOTO DATA
     ========================================================= */

  const photos = [
    [
      "https://picsum.photos/seed/ananda-premium-01/900/1200",
      "Mountain memory",
      "the beginning"
    ],

    [
      "https://picsum.photos/seed/ananda-premium-02/900/1200",
      "Travel memory",
      "moments worth keeping"
    ],

    [
      "https://picsum.photos/seed/ananda-premium-03/900/1200",
      "Nature memory",
      "together always"
    ],

    [
      "https://picsum.photos/seed/ananda-premium-04/900/1200",
      "Scenic memory",
      "stories in motion"
    ],

    [
      "https://picsum.photos/seed/ananda-premium-05/900/1200",
      "Warm memory",
      "golden afternoons"
    ],

    [
      "https://picsum.photos/seed/ananda-premium-06/900/1200",
      "Premium memory",
      "our favourite chapter"
    ],

    [
      "https://picsum.photos/seed/ananda-premium-07/900/1200",
      "Cinematic memory",
      "beautifully remembered"
    ],

    [
      "https://picsum.photos/seed/ananda-premium-08/900/1200",
      "Joyful memory",
      "joy in every frame"
    ],

    [
      "https://picsum.photos/seed/ananda-premium-09/900/1200",
      "Final memory",
      "the best is yet to come"
    ],

    [
      "https://picsum.photos/seed/ananda-premium-10/900/1200",
      "Celebration memory",
      "made to remember"
    ],

    [
      "https://picsum.photos/seed/ananda-premium-11/900/1200",
      "Forever memory",
      "always ananda"
    ]
  ];


  /* =========================================================
     5. REQUIRED DOM ELEMENTS
     ========================================================= */

  const section =
    document.querySelector(
      "[data-fan-section]"
    );


  const stage =
    document.querySelector(
      "[data-stage]"
    );


  const root =
    document.querySelector(
      "[data-fan-root]"
    );


  const pin =
    document.querySelector(
      "[data-fan-pin]"
    );


  const counter =
    document.querySelector(
      "[data-counter-current]"
    );


  const total =
    document.querySelector(
      "[data-counter-total]"
    );


  if (
    !section ||
    !stage ||
    !root ||
    !pin ||
    !counter ||
    !total
  ) {
    console.error(
      "ANANDA: required fan HTML elements are missing."
    );

    return;
  }


  total.textContent =
    `/ ${String(
      photos.length
    ).padStart(
      2,
      "0"
    )}`;


  /* =========================================================
     6. LENIS SMOOTH SCROLL
     ========================================================= */

  let lenis = null;


  if (
    !reducedMotion &&
    typeof Lenis !== "undefined"
  ) {
    lenis =
      new Lenis({
        lerp: 0.08,

        smoothWheel: true,

        wheelMultiplier: 0.85,

        touchMultiplier: 1.05,

        syncTouch: false
      });


    lenis.on(
      "scroll",
      ScrollTrigger.update
    );


    gsap.ticker.add(
      (
        time
      ) => {
        lenis.raf(
          time * 1000
        );
      }
    );


    gsap.ticker.lagSmoothing(
      0
    );
  }


  /* =========================================================
     7. CREATE PHOTO CARDS
     ========================================================= */

  const cards =
    photos.map(
      (
        [
          src,
          alt,
          caption
        ],

        index
      ) => {
        const card =
          document.createElement(
            "article"
          );


        card.className =
          "fan-card";


        card.dataset.index =
          String(
            index
          );


        card.innerHTML = `
          <div class="fan-card-inner">

            <div class="fan-photo">

              <img
                src="${src}"
                alt="${alt}"
                decoding="async"
                fetchpriority="${
                  index === 0
                    ? "high"
                    : "auto"
                }"
              >

            </div>


            <span class="fan-caption">
              ${caption}
            </span>


            <span
              class="fan-rivet"
              aria-hidden="true"
            ></span>

          </div>
        `;


        root.appendChild(
          card
        );


        return card;
      }
    );


  /* =========================================================
     8. GET ONE PNG GEAR
     ========================================================= */

  function getGear(
    selector
  ) {
    const element =
      document.querySelector(
        selector
      );


    if (
      !element
    ) {
      return null;
    }


    return {
      element,

      outer:
        element.querySelector(
          ".gear-outer"
        ),

      inner:
        element.querySelector(
          ".gear-inner-rotor"
        )
    };
  }


  /* =========================================================
     9. ONLY 7 GEARS
     ========================================================= */

  const gears = {
    a:
      getGear(
        "[data-gear-a]"
      ),


    b:
      getGear(
        "[data-gear-b]"
      ),


    c:
      getGear(
        "[data-gear-c]"
      ),


    d:
      getGear(
        "[data-gear-d]"
      ),


    e:
      getGear(
        "[data-gear-e]"
      ),


    f:
      getGear(
        "[data-gear-f]"
      ),


    g:
      getGear(
        "[data-gear-g]"
      )
  };


  /* =========================================================
     BALANCE + LEVER
     ========================================================= */

  const balance =
    document.querySelector(
      "[data-balance]"
    );


  const lever =
    document.querySelector(
      "[data-lever]"
    );


  /* =========================================================
     10. HELPERS
     ========================================================= */

  const clamp =
    gsap.utils.clamp;


  function smoother(
    value
  ) {
    const x =
      clamp(
        0,
        1,
        value
      );


    return (
      x *
      x *
      x *
      (
        x *
        (
          x * 6 -
          15
        ) +
        10
      )
    );
  }


  /* =========================================================
     11. ROTATE ONE GEAR
     ========================================================= */

  function rotateGear(
    key,
    baseRotation
  ) {
    const gear =
      gears[
        key
      ];


    const motion =
      GEAR_MOTION[
        key
      ];


    if (
      !gear ||
      !motion
    ) {
      return;
    }


    /* MAIN PNG GEAR */

    if (
      gear.outer
    ) {
      gsap.set(
        gear.outer,
        {
          rotation:
            baseRotation *
            motion.outer,


          transformOrigin:
            "50% 50%",


          force3D:
            true
        }
      );
    }


    /* INNER CALIBRE */

    if (
      gear.inner
    ) {
      gsap.set(
        gear.inner,
        {
          rotation:
            baseRotation *
            motion.inner,


          transformOrigin:
            "50% 50%",


          force3D:
            true
        }
      );
    }
  }


  /* =========================================================
     12. RESPONSIVE FAN LAYOUT
     ========================================================= */

  function getLayout() {
    const width =
      stage.clientWidth;


    const height =
      stage.clientHeight;


    /* LARGE DESKTOP */

    if (
      width >= 1400
    ) {
      return {
        cardWidth: 180,

        cardHeight: 235,


        pivotX:
          width *
          FAN_CONTROLS
            .horizontalPosition,


        pivotY:
          height *
          FAN_CONTROLS
            .verticalPosition,


        closedAngle: -6,


        closedStep:
          FAN_CONTROLS
            .closedCardSpacing,


        openStart:
          FAN_CONTROLS
            .desktopOpenStart,


        openEnd:
          FAN_CONTROLS
            .desktopOpenEnd,


        liftZ:
          FAN_CONTROLS
            .activeLiftZ,


        liftY:
          FAN_CONTROLS
            .activeLiftY,


        horizontalSpread: 6
      };
    }


    /* LAPTOP */

    if (
      width >= 1024
    ) {
      return {
        cardWidth: 150,

        cardHeight: 198,


        pivotX:
          width *
          FAN_CONTROLS
            .horizontalPosition,


        pivotY:
          height *
          (
            FAN_CONTROLS
              .verticalPosition +
            0.01
          ),


        closedAngle: -5,


        closedStep:
          FAN_CONTROLS
            .closedCardSpacing *
          0.95,


        openStart:
          FAN_CONTROLS
            .laptopOpenStart,


        openEnd:
          FAN_CONTROLS
            .laptopOpenEnd,


        liftZ:
          FAN_CONTROLS
            .activeLiftZ *
          0.85,


        liftY:
          FAN_CONTROLS
            .activeLiftY *
          0.85,


        horizontalSpread: 5
      };
    }


    /* TABLET */

    if (
      width >= 700
    ) {
      return {
        cardWidth: 132,

        cardHeight: 176,


        pivotX:
          width *
          FAN_CONTROLS
            .horizontalPosition,


        pivotY:
          height *
          (
            FAN_CONTROLS
              .verticalPosition +
            0.015
          ),


        closedAngle: -4,


        closedStep:
          FAN_CONTROLS
            .closedCardSpacing *
          0.85,


        openStart:
          FAN_CONTROLS
            .tabletOpenStart,


        openEnd:
          FAN_CONTROLS
            .tabletOpenEnd,


        liftZ:
          FAN_CONTROLS
            .activeLiftZ *
          0.67,


        liftY:
          FAN_CONTROLS
            .activeLiftY *
          0.67,


        horizontalSpread: 4
      };
    }


    /* MOBILE */

    return {
      cardWidth: 104,

      cardHeight: 142,


      pivotX:
        width *
        FAN_CONTROLS
          .horizontalPosition,


      pivotY:
        height *
        (
          FAN_CONTROLS
            .verticalPosition +
          0.025
        ),


      closedAngle: -3,


      closedStep:
        FAN_CONTROLS
          .closedCardSpacing *
        0.70,


      openStart:
        FAN_CONTROLS
          .mobileOpenStart,


      openEnd:
        FAN_CONTROLS
          .mobileOpenEnd,


      liftZ:
        FAN_CONTROLS
          .activeLiftZ *
        0.45,


      liftY:
        FAN_CONTROLS
          .activeLiftY *
        0.45,


      horizontalSpread: 2.5
    };
  }


  let layout =
    getLayout();


  /* =========================================================
     13. CARD ANGLES
     ========================================================= */

  function closedAngle(
    index
  ) {
    return (
      layout.closedAngle +
      index *
      layout.closedStep
    );
  }


  function openAngle(
    index
  ) {
    if (
      cards.length <= 1
    ) {
      return 0;
    }


    return (
      gsap.utils.interpolate(
        layout.openStart,

        layout.openEnd,

        index /
        (
          cards.length -
          1
        )
      )
    );
  }


  /* =========================================================
     14. APPLY FAN LAYOUT
     ========================================================= */

  function applyLayout() {
    layout =
      getLayout();


    document.documentElement
      .style
      .setProperty(
        "--card-w",
        `${layout.cardWidth}px`
      );


    document.documentElement
      .style
      .setProperty(
        "--card-h",
        `${layout.cardHeight}px`
      );


    const originX =
      Math.max(
        14,

        layout.cardWidth *
        0.10
      );


    const originY =
      layout.cardHeight -
      Math.max(
        14,

        layout.cardHeight *
        0.08
      );


    cards.forEach(
      (
        card,
        index
      ) => {
        gsap.set(
          card,
          {
            left:
              layout.pivotX -
              originX,


            top:
              layout.pivotY -
              originY,


            transformOrigin:
              `${originX}px ${originY}px`,


            rotation:
              closedAngle(
                index
              ),


            x:
              index *
              layout
                .horizontalSpread,


            y:
              index *
              0.65,


            z:
              -index *
              1.2,


            force3D:
              true
          }
        );


        card.style.zIndex =
          String(
            1000 -
            index
          );
      }
    );


    gsap.set(
      pin,
      {
        left:
          layout.pivotX -
          26,


        top:
          layout.pivotY -
          26
      }
    );
  }


  /* =========================================================
     15. FAN TIMING
     ========================================================= */

  const cardStagger =
    FAN_CONTROLS
      .stagger;


  const totalFanTime =
    1 +
    (
      cards.length -
      1
    ) *
    cardStagger;


  let lastCounter =
    -1;


  /* =========================================================
     16. RENDER FAN + 7 GEAR MECHANISM
     ========================================================= */

  function renderFanAndMechanism(
    progress
  ) {
    const safeProgress =
      clamp(
        0,
        1,
        progress
      );


    const time =
      safeProgress *
      totalFanTime;


    /*
     * GEAR DRIVE IS BUILT FROM
     * ACTUAL CARD OPENING PROGRESS.
     */
    let mechanicalDrive =
      0;


    /* =====================================================
       PHOTO CARDS
       ===================================================== */

    cards.forEach(
      (
        card,
        index
      ) => {
        const local =
          clamp(
            0,
            1,

            time -
            index *
            cardStagger
          );


        const eased =
          smoother(
            local
          );


        /*
         * ADD THIS CARD'S OPENING
         * TO THE GEAR TRAIN.
         */
        mechanicalDrive +=
          eased;


        /*
         * CARD LIFT
         */
        const lift =
          Math.sin(
            eased *
            Math.PI
          );


        /*
         * CARD ANGLE
         */
        const rotation =
          gsap.utils.interpolate(
            closedAngle(
              index
            ),

            openAngle(
              index
            ),

            eased
          );


        /*
         * SMALL SETTLING MOTION
         */
        const settle =
          Math.sin(
            eased *
            Math.PI *
            2
          ) *
          (
            1 -
            eased
          ) *
          1.5;


        gsap.set(
          card,
          {
            rotation:
              rotation +
              settle,


            x:
              index *
              layout
                .horizontalSpread +
              lift *
              5,


            y:
              index *
              0.65 -
              lift *
              layout
                .liftY,


            z:
              lift *
              layout
                .liftZ,


            rotationX:
              -lift *
              2.1,


            rotationY:
              (
                index %
                2
                  ? -1
                  : 1
              ) *
              lift *
              1.05,


            scale:
              1 +
              lift *
              0.022,


            force3D:
              true
          }
        );


        /* CARD STACKING */

        if (
          local <= 0
        ) {
          card.style.zIndex =
            String(
              1000 -
              index
            );
        }

        else if (
          local < 1
        ) {
          card.style.zIndex =
            String(
              2200 +
              index
            );
        }

        else {
          card.style.zIndex =
            String(
              200 +
              index
            );
        }


        /* CARD SHADOW */

        card.style.filter = `
          drop-shadow(
            ${lift * 6}px
            ${13 + lift * 15}px
            ${18 + lift * 20}px
            rgba(
              54,
              35,
              22,
              ${0.12 + lift * 0.12}
            )
          )
        `;
      }
    );


    /* =====================================================
       COUNTER
       ===================================================== */

    const activeIndex =
      clamp(
        0,

        cards.length -
        1,

        Math.floor(
          time /
          cardStagger
        )
      );


    if (
      activeIndex !==
      lastCounter
    ) {
      counter.textContent =
        String(
          activeIndex +
          1
        ).padStart(
          2,
          "0"
        );


      lastCounter =
        activeIndex;
    }


    /* =====================================================
       SLOW CARD-DRIVEN GEAR MOVEMENT
       ===================================================== */

    const gearRotation =
      mechanicalDrive *
      GEAR_DEGREES_PER_CARD;


    /* GEAR A */
    rotateGear(
      "a",
      gearRotation
    );


    /* GEAR B */
    rotateGear(
      "b",
      gearRotation
    );


    /* GEAR C */
    rotateGear(
      "c",
      gearRotation
    );


    /* GEAR D */
    rotateGear(
      "d",
      gearRotation
    );


    /* GEAR E */
    rotateGear(
      "e",
      gearRotation
    );


    /* GEAR F */
    rotateGear(
      "f",
      gearRotation
    );


    /* GEAR G */
    rotateGear(
      "g",
      gearRotation
    );


    /* =====================================================
       BALANCE WHEEL
       ===================================================== */

    const tick =
      Math.sin(
        mechanicalDrive *
        Math.PI *
        2.2
      );


    if (
      balance
    ) {
      gsap.set(
        balance,
        {
          rotation:
            tick *
            9,


          force3D:
            true
        }
      );
    }


    /* =====================================================
       LEVER
       ===================================================== */

    if (
      lever
    ) {
      gsap.set(
        lever,
        {
          rotation:
            -12 +
            tick *
            7,


          force3D:
            true
        }
      );
    }
  }


  /* =========================================================
     17. INITIAL FAN STATE
     ========================================================= */

  applyLayout();


  renderFanAndMechanism(
    reducedMotion
      ? 1
      : 0
  );


  /* =========================================================
     18. SCROLLTRIGGER
     ========================================================= */

  let fanTrigger =
    null;


  if (
    !reducedMotion
  ) {
    fanTrigger =
      ScrollTrigger.create({
        trigger:
          section,


        start:
          "top top",


        end:
          "bottom bottom",


        scrub:
          1,


        invalidateOnRefresh:
          true,


        onUpdate:
          (
            self
          ) => {
            renderFanAndMechanism(
              self.progress
            );
          }
      });
  }


  /* =========================================================
     19. BACKFLOW SMOKE
     ========================================================= */

  function initBackflowSmoke() {
    const canvas =
      document.querySelector(
        "[data-backflow-smoke]"
      );


    const artwork =
      document.querySelector(
        "[data-backflow-art]"
      );


    if (
      !canvas ||
      !artwork
    ) {
      console.warn(
        "ANANDA smoke: canvas or lotus artwork not found."
      );

      return null;
    }


    const ctx =
      canvas.getContext(
        "2d",
        {
          alpha: true
        }
      );


    if (
      !ctx
    ) {
      return null;
    }


    const smoke =
      SMOKE_CONTROLS;


    /* =====================================================
       INTERNAL STATE
       ===================================================== */

    let width =
      1;


    let height =
      1;


    let dpr =
      1;


    let smoothPath =
      [];


    let running =
      true;


    let lastFrameTime =
      performance.now();


    let simulationTime =
      0;


    let emissionAccumulator =
      0;


    const streamParticles =
      [];


    const poolParticles =
      [];


    /* =====================================================
       HELPERS
       ===================================================== */

    function random(
      min,
      max
    ) {
      return (
        min +
        Math.random() *
        (
          max -
          min
        )
      );
    }


    function lerp(
      a,
      b,
      t
    ) {
      return (
        a +
        (
          b -
          a
        ) *
        t
      );
    }


    function clampValue(
      value,
      min,
      max
    ) {
      return Math.max(
        min,

        Math.min(
          max,
          value
        )
      );
    }


    /* =====================================================
       CATMULL-ROM
       ===================================================== */

    function catmullRom(
      p0,
      p1,
      p2,
      p3,
      t
    ) {
      const t2 =
        t *
        t;


      const t3 =
        t2 *
        t;


      return {
        x:
          0.5 *
          (
            2 *
            p1.x +

            (
              -p0.x +
              p2.x
            ) *
            t +

            (
              2 *
              p0.x -
              5 *
              p1.x +
              4 *
              p2.x -
              p3.x
            ) *
            t2 +

            (
              -p0.x +
              3 *
              p1.x -
              3 *
              p2.x +
              p3.x
            ) *
            t3
          ),


        y:
          0.5 *
          (
            2 *
            p1.y +

            (
              -p0.y +
              p2.y
            ) *
            t +

            (
              2 *
              p0.y -
              5 *
              p1.y +
              4 *
              p2.y -
              p3.y
            ) *
            t2 +

            (
              -p0.y +
              3 *
              p1.y -
              3 *
              p2.y +
              p3.y
            ) *
            t3
          )
      };
    }


    /* =====================================================
       BUILD SMOOTH SMOKE PATH
       ===================================================== */

    function buildSmoothPath() {
      const sourcePoints =
        smoke.path.map(
          (
            point
          ) => {
            return {
              x:
                point.x *
                width,


              y:
                point.y *
                height
            };
          }
        );


      const result =
        [];


      const samples =
        smoke
          .splineSamplesPerSegment;


      for (
        let i = 0;

        i <
        sourcePoints.length -
        1;

        i += 1
      ) {
        const p0 =
          sourcePoints[
            Math.max(
              0,
              i -
              1
            )
          ];


        const p1 =
          sourcePoints[
            i
          ];


        const p2 =
          sourcePoints[
            i +
            1
          ];


        const p3 =
          sourcePoints[
            Math.min(
              sourcePoints.length -
              1,

              i +
              2
            )
          ];


        for (
          let step = 0;

          step <
          samples;

          step += 1
        ) {
          const t =
            step /
            samples;


          result.push(
            catmullRom(
              p0,
              p1,
              p2,
              p3,
              t
            )
          );
        }
      }


      result.push(
        sourcePoints[
          sourcePoints.length -
          1
        ]
      );


      smoothPath =
        result;
    }


    /* =====================================================
       CREATE SMOKE SPRITE
       ===================================================== */

    function createSmokeSprite() {
      const size =
        200;


      const sprite =
        document.createElement(
          "canvas"
        );


      sprite.width =
        size;


      sprite.height =
        size;


      const spriteCtx =
        sprite.getContext(
          "2d"
        );


      const gradient =
        spriteCtx.createRadialGradient(
          size * 0.5,

          size * 0.5,

          2,


          size * 0.5,

          size * 0.5,

          size * 0.5
        );


      const core =
        smoke.smokeCore;


      const mid =
        smoke.smokeMid;


      const edge =
        smoke.smokeEdge;


      gradient.addColorStop(
        0,

        `rgba(
          ${core.r},
          ${core.g},
          ${core.b},
          1
        )`
      );


      gradient.addColorStop(
        0.20,

        `rgba(
          ${core.r},
          ${core.g},
          ${core.b},
          0.94
        )`
      );


      gradient.addColorStop(
        0.43,

        `rgba(
          ${mid.r},
          ${mid.g},
          ${mid.b},
          0.70
        )`
      );


      gradient.addColorStop(
        0.70,

        `rgba(
          ${edge.r},
          ${edge.g},
          ${edge.b},
          0.25
        )`
      );


      gradient.addColorStop(
        1,

        `rgba(
          ${edge.r},
          ${edge.g},
          ${edge.b},
          0
        )`
      );


      spriteCtx.fillStyle =
        gradient;


      spriteCtx.fillRect(
        0,
        0,
        size,
        size
      );


      return sprite;
    }


    const smokeSprite =
      createSmokeSprite();


    /* =====================================================
       RESIZE CANVAS
       ===================================================== */

    function resizeCanvas() {
      const rect =
        artwork
          .getBoundingClientRect();


      width =
        Math.max(
          1,
          rect.width
        );


      height =
        Math.max(
          1,
          rect.height
        );


      dpr =
        Math.min(
          window.devicePixelRatio ||
          1,

          2
        );


      canvas.width =
        Math.round(
          width *
          dpr
        );


      canvas.height =
        Math.round(
          height *
          dpr
        );


      canvas.style.width =
        `${width}px`;


      canvas.style.height =
        `${height}px`;


      ctx.setTransform(
        dpr,
        0,
        0,
        dpr,
        0,
        0
      );


      buildSmoothPath();


      streamParticles.length =
        0;


      poolParticles.length =
        0;


      emissionAccumulator =
        0;
    }


    /* =====================================================
       FIND NEAREST FLOW POINT
       ===================================================== */

    function nearestFlowPoint(
      x,
      y
    ) {
      let bestDistance =
        Infinity;


      let bestIndex =
        0;


      for (
        let i = 0;

        i <
        smoothPath.length;

        i += 1
      ) {
        const point =
          smoothPath[
            i
          ];


        const dx =
          point.x -
          x;


        const dy =
          point.y -
          y;


        const distance =
          dx *
          dx +
          dy *
          dy;


        if (
          distance <
          bestDistance
        ) {
          bestDistance =
            distance;


          bestIndex =
            i;
        }
      }


      const previous =
        smoothPath[
          Math.max(
            0,
            bestIndex -
            1
          )
        ];


      const current =
        smoothPath[
          bestIndex
        ];


      const next =
        smoothPath[
          Math.min(
            smoothPath.length -
            1,

            bestIndex +
            1
          )
        ];


      const tangentX =
        next.x -
        previous.x;


      const tangentY =
        next.y -
        previous.y;


      const tangentLength =
        Math.sqrt(
          tangentX *
          tangentX +
          tangentY *
          tangentY
        ) ||
        1;


      return {
        x:
          current.x,


        y:
          current.y,


        tangentX:
          tangentX /
          tangentLength,


        tangentY:
          tangentY /
          tangentLength,


        progress:
          bestIndex /
          Math.max(
            1,

            smoothPath.length -
            1
          )
      };
    }


    /* =====================================================
       CREATE STREAM PARTICLE
       ===================================================== */

    function createStreamParticle() {
      return {
        x:
          smoke.emitterX *
          width +
          random(
            -1,
            1
          ),


        y:
          smoke.emitterY *
          height +
          random(
            -0.8,
            0.8
          ),


        vx:
          random(
            -0.05,
            0.05
          ),


        vy:
          random(
            0.08,
            0.25
          ),


        age:
          0,


        life:
          random(
            smoke.lifeMin,
            smoke.lifeMax
          ),


        phase:
          random(
            0,

            Math.PI *
            2
          ),


        progress:
          0,


        startSize:
          random(
            smoke.startSizeMin,
            smoke.startSizeMax
          ),


        endSize:
          random(
            smoke.endSizeMin,
            smoke.endSizeMax
          ),


        size:
          smoke.startSizeMin,


        alpha:
          smoke.streamAlphaStart
      };
    }


    /* =====================================================
       CREATE BASIN FOG PARTICLE
       ===================================================== */

    function createPoolParticle(
      arrivalX
    ) {
      const centerX =
        smoke.poolCenterX *
        width;


      const halfWidth =
        (
          smoke.poolWidth *
          width
        ) /
        2;


      return {
        x:
          clampValue(
            arrivalX +
            random(
              -halfWidth *
              0.15,

              halfWidth *
              0.15
            ),

            centerX -
            halfWidth,

            centerX +
            halfWidth
          ),


        y:
          smoke.poolY *
          height +
          random(
            -2,
            2
          ),


        vx:
          random(
            -0.035,
            0.035
          ),


        vy:
          random(
            -0.01,
            0.01
          ),


        size:
          random(
            smoke.poolSizeMin,
            smoke.poolSizeMax
          ),


        alpha:
          smoke.poolAlphaMin,


        maxAlpha:
          random(
            smoke.poolAlphaMax *
            0.55,

            smoke.poolAlphaMax
          ),


        phase:
          random(
            0,

            Math.PI *
            2
          )
      };
    }


    /* =====================================================
       SMOKE REACHES BASIN
       ===================================================== */

    function streamArrivesAtPool(
      particle
    ) {
      for (
        let i = 0;

        i <
        smoke.poolSpawnPerArrival;

        i += 1
      ) {
        if (
          poolParticles.length >=
          smoke.maxPoolParticles
        ) {
          break;
        }


        poolParticles.push(
          createPoolParticle(
            particle.x
          )
        );
      }
    }


    /* =====================================================
       UPDATE STREAM PARTICLE
       ===================================================== */

    function updateStreamParticle(
      particle,
      dt
    ) {
      const flow =
        nearestFlowPoint(
          particle.x,
          particle.y
        );


      particle.progress =
        Math.max(
          particle.progress,
          flow.progress
        );


      const pullX =
        flow.x -
        particle.x;


      const pullY =
        flow.y -
        particle.y;


      /* FOLLOW PATH */

      particle.vx +=
        pullX *
        smoke.pathAttraction *
        dt;


      particle.vy +=
        pullY *
        smoke.pathAttraction *
        dt;


      /* FLOW ALONG PATH */

      particle.vx +=
        flow.tangentX *
        smoke.flowSpeed *
        dt;


      particle.vy +=
        flow.tangentY *
        smoke.flowSpeed *
        dt;


      /* DOWNWARD WEIGHT */

      particle.vy +=
        smoke.gravity *
        dt;


      /* ORGANIC SWAY */

      particle.vx +=
        Math.sin(
          simulationTime *
          0.45 +
          particle.phase +
          particle.progress *
          4
        ) *
        smoke.sideSway *
        dt;


      particle.vx +=
        Math.sin(
          simulationTime *
          0.27 +
          particle.phase
        ) *
        smoke.turbulence *
        dt;


      /* VISCOSITY */

      const drag =
        Math.pow(
          smoke.drag,

          dt *
          60
        );


      particle.vx *=
        drag;


      particle.vy *=
        drag;


      /* POSITION */

      particle.x +=
        particle.vx *
        dt;


      particle.y +=
        particle.vy *
        dt;


      particle.age +=
        dt;


      /* THIN -> WIDE */

      const widthProgress =
        Math.pow(
          particle.progress,
          1.20
        );


      particle.size =
        lerp(
          particle.startSize,

          particle.endSize,

          widthProgress
        );


      /* LIGHT -> DENSE */

      particle.alpha =
        lerp(
          smoke.streamAlphaStart,

          smoke.streamAlphaEnd,

          Math.pow(
            particle.progress,
            1.08
          )
        );


      /* REACHED BASIN */

      if (
        particle.progress >=
        0.987
      ) {
        streamArrivesAtPool(
          particle
        );


        return false;
      }


      /* END OF LIFE */

      if (
        particle.age >=
        particle.life
      ) {
        return false;
      }


      return true;
    }


    /* =====================================================
       UPDATE BASIN FOG
       ===================================================== */

    function updatePoolParticle(
      particle,
      dt
    ) {
      const centerX =
        smoke.poolCenterX *
        width;


      const halfWidth =
        (
          smoke.poolWidth *
          width
        ) /
        2;


      const normalizedX =
        (
          particle.x -
          centerX
        ) /
        halfWidth;


      const targetY =
        smoke.poolY *
        height +

        Math.pow(
          normalizedX,
          2
        ) *

        (
          smoke.poolHeight *
          height *
          0.45
        );


      /* SETTLE */

      particle.vy +=
        (
          targetY -
          particle.y
        ) *
        smoke.poolSettleStrength *
        dt;


      /* SLIGHT DRIFT */

      particle.vx +=
        Math.sin(
          simulationTime *
          0.18 +
          particle.phase
        ) *
        smoke.poolDrift *
        dt;


      /* VISCOSITY */

      const viscosity =
        Math.pow(
          smoke.poolViscosity,

          dt *
          60
        );


      particle.vx *=
        viscosity;


      particle.vy *=
        viscosity;


      particle.x +=
        particle.vx *
        dt;


      particle.y +=
        particle.vy *
        dt;


      /* KEEP IN BASIN */

      particle.x =
        clampValue(
          particle.x,

          centerX -
          halfWidth,

          centerX +
          halfWidth
        );


      /* BUILD DENSITY */

      particle.alpha =
        Math.min(
          particle.maxAlpha,

          particle.alpha +
          smoke.poolGrowthPerSecond *
          dt
        );
    }


    /* =====================================================
       DRAW PARTICLE
       ===================================================== */

    function drawParticle(
      particle,
      alphaMultiplier = 1
    ) {
      const size =
        particle.size;


      ctx.globalAlpha =
        particle.alpha *
        alphaMultiplier;


      ctx.drawImage(
        smokeSprite,

        particle.x -
        size /
        2,

        particle.y -
        size /
        2,

        size,

        size
      );
    }


    /* =====================================================
       SMOKE ANIMATION LOOP
       ===================================================== */

    function animateSmoke(
      now
    ) {
      if (
        !running
      ) {
        return;
      }


      const rawDt =
        (
          now -
          lastFrameTime
        ) /
        1000;


      const dt =
        Math.min(
          0.033,

          Math.max(
            0.001,
            rawDt
          )
        );


      lastFrameTime =
        now;


      simulationTime +=
        dt;


      /* EMISSION */

      emissionAccumulator +=
        smoke.emissionRate *
        dt;


      while (
        emissionAccumulator >=
        1
      ) {
        emissionAccumulator -=
          1;


        if (
          streamParticles.length <
          smoke.maxStreamParticles
        ) {
          streamParticles.push(
            createStreamParticle()
          );
        }
      }


      /* UPDATE STREAM */

      for (
        let i =
          streamParticles.length -
          1;

        i >= 0;

        i -= 1
      ) {
        const alive =
          updateStreamParticle(
            streamParticles[
              i
            ],

            dt
          );


        if (
          !alive
        ) {
          streamParticles.splice(
            i,
            1
          );
        }
      }


      /* UPDATE POOL */

      poolParticles.forEach(
        (
          particle
        ) => {
          updatePoolParticle(
            particle,
            dt
          );
        }
      );


      /* CLEAR */

      ctx.clearRect(
        0,
        0,
        width,
        height
      );


      ctx.globalCompositeOperation =
        "source-over";


      /* DRAW BASIN */

      poolParticles.forEach(
        (
          particle
        ) => {
          drawParticle(
            particle,
            0.75
          );
        }
      );


      /* DRAW STREAM */

      streamParticles.forEach(
        (
          particle
        ) => {
          drawParticle(
            particle,
            1
          );
        }
      );


      ctx.globalAlpha =
        1;


      requestAnimationFrame(
        animateSmoke
      );
    }


    /* =====================================================
       RESIZE OBSERVER
       ===================================================== */

    const resizeObserver =
      new ResizeObserver(
        () => {
          resizeCanvas();
        }
      );


    resizeObserver.observe(
      artwork
    );


    resizeCanvas();


    requestAnimationFrame(
      animateSmoke
    );


    /* =====================================================
       CLEANUP
       ===================================================== */

    return () => {
      running =
        false;


      resizeObserver.disconnect();
    };
  }


  /* =========================================================
     20. START SMOKE
     ========================================================= */

  let destroySmoke =
    null;


  if (
    !reducedMotion
  ) {
    destroySmoke =
      initBackflowSmoke();
  }


  /* =========================================================
     21. WINDOW RESIZE
     ========================================================= */

  let resizeTimer =
    null;


  function handleResize() {
    clearTimeout(
      resizeTimer
    );


    resizeTimer =
      setTimeout(
        () => {
          applyLayout();


          if (
            fanTrigger
          ) {
            renderFanAndMechanism(
              fanTrigger.progress
            );
          }


          ScrollTrigger.refresh();
        },

        120
      );
  }


  window.addEventListener(
    "resize",
    handleResize,
    {
      passive: true
    }
  );


  /* =========================================================
     22. REFRESH AFTER GEAR PNGS LOAD
     ========================================================= */

  const mechanismImages =
    document.querySelectorAll(
      ".gear img"
    );


  mechanismImages.forEach(
    (
      image
    ) => {
      if (
        image.complete
      ) {
        return;
      }


      image.addEventListener(
        "load",
        () => {
          ScrollTrigger.refresh();
        },

        {
          once: true
        }
      );
    }
  );


  /* =========================================================
     23. FINAL LOAD REFRESH
     ========================================================= */

  window.addEventListener(
    "load",
    () => {
      applyLayout();


      ScrollTrigger.refresh();


      if (
        fanTrigger
      ) {
        renderFanAndMechanism(
          fanTrigger.progress
        );
      }
    },

    {
      once: true
    }
  );


  /* =========================================================
     24. CLEANUP
     ========================================================= */

  window.addEventListener(
    "pagehide",
    () => {
      if (
        fanTrigger
      ) {
        fanTrigger.kill();
      }


      if (
        lenis
      ) {
        lenis.destroy();
      }


      if (
        typeof destroySmoke ===
        "function"
      ) {
        destroySmoke();
      }
    },

    {
      once: true
    }
  );
});
