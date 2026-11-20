function svgToDataUri(svg: string): string {
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg.replace(/\s+/g, ' ').trim())}`;
}

export function createAvatarVisual(
  initials: string,
  hueA: string,
  hueB: string,
  pattern: 'orbit' | 'grid' | 'prism' | 'wave' | 'arc' | 'horizon' = 'orbit'
): string {
  const shape =
    pattern === 'orbit'
      ? `<circle cx="96" cy="96" r="56" fill="none" stroke="rgba(255,255,255,0.16)" stroke-width="1.5"/>
         <circle cx="140" cy="54" r="10" fill="${hueB}" opacity="0.85"/>`
      : pattern === 'grid'
      ? `<path d="M24 64 H168 M24 128 H168 M64 24 V168 M128 24 V168" stroke="rgba(255,255,255,0.1)" stroke-width="1"/>`
      : pattern === 'prism'
      ? `<polygon points="96,24 162,148 30,148" fill="none" stroke="rgba(255,255,255,0.16)" stroke-width="1.5"/>`
      : pattern === 'wave'
      ? `<path d="M0 120 Q48 80 96 120 T192 120" fill="none" stroke="rgba(255,255,255,0.22)" stroke-width="2"/>`
      : pattern === 'arc'
      ? `<path d="M32 150 A64 64 0 0 1 160 150" fill="none" stroke="rgba(255,255,255,0.2)" stroke-width="2"/>`
      : `<rect x="34" y="34" width="124" height="124" rx="28" fill="none" stroke="rgba(255,255,255,0.14)" stroke-width="1.5"/>`;

  return svgToDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 192 192" width="192" height="192">
      <defs>
        <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="${hueA}"/>
          <stop offset="100%" stop-color="${hueB}"/>
        </linearGradient>
        <radialGradient id="glow" cx="30%" cy="25%" r="70%">
          <stop offset="0%" stop-color="rgba(255,255,255,0.18)"/>
          <stop offset="100%" stop-color="rgba(9,11,16,0.45)"/>
        </radialGradient>
      </defs>
      <rect width="192" height="192" fill="#0E121A"/>
      <rect width="192" height="192" fill="url(#g)" opacity="0.72"/>
      <rect width="192" height="192" fill="url(#glow)"/>
      ${shape}
      <text x="96" y="109" text-anchor="middle" font-family="Space Grotesk, Inter, system-ui, sans-serif" font-size="52" font-weight="700" letter-spacing="-1" fill="#F8FAFC">${initials}</text>
    </svg>
  `);
}

export function createEditorialPostVisual(
  variant:
    | 'workstation'
    | 'architecture'
    | 'design_system'
    | 'alpine_dusk'
    | 'type_specimen'
    | 'neural_mesh'
    | 'minimal_camera'
    | 'story_evening'
): string {
  if (variant === 'workstation') {
    return svgToDataUri(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 760" width="1200" height="760">
        <defs>
          <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stop-color="#090B10"/>
            <stop offset="55%" stop-color="#111726"/>
            <stop offset="100%" stop-color="#0C141F"/>
          </linearGradient>
          <linearGradient id="screenGlow" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stop-color="#8B5CF6" stop-opacity="0.28"/>
            <stop offset="100%" stop-color="#06B6D4" stop-opacity="0.18"/>
          </linearGradient>
        </defs>
        <rect width="1200" height="760" fill="url(#bg)"/>
        <circle cx="920" cy="180" r="260" fill="#8B5CF6" opacity="0.12"/>
        <circle cx="280" cy="600" r="240" fill="#06B6D4" opacity="0.09"/>
        <!-- Desk Surface -->
        <path d="M0 570 L1200 570 L1200 760 L0 760 Z" fill="#0E121A"/>
        <line x1="0" y1="570" x2="1200" y2="570" stroke="#252D3A" stroke-width="2"/>
        <!-- Ultrawide Monitor Stand -->
        <rect x="574" y="450" width="52" height="120" fill="#1A2230"/>
        <rect x="480" y="562" width="240" height="10" rx="5" fill="#252D3A"/>
        <!-- Monitor Frame -->
        <rect x="210" y="120" width="780" height="350" rx="18" fill="#141A24" stroke="#2D3748" stroke-width="3"/>
        <rect x="228" y="138" width="744" height="314" rx="10" fill="#090B10"/>
        <rect x="228" y="138" width="744" height="314" rx="10" fill="url(#screenGlow)" opacity="0.45"/>
        <!-- Code & Canvas inside Monitor -->
        <rect x="248" y="160" width="160" height="270" rx="8" fill="#141A24" stroke="#252D3A"/>
        <rect x="266" y="182" width="90" height="10" rx="5" fill="#8B5CF6" opacity="0.8"/>
        <rect x="266" y="208" width="118" height="7" rx="3.5" fill="#64748B" opacity="0.6"/>
        <rect x="266" y="226" width="96" height="7" rx="3.5" fill="#64748B" opacity="0.45"/>
        <rect x="266" y="244" width="110" height="7" rx="3.5" fill="#64748B" opacity="0.45"/>
        <rect x="266" y="276" width="80" height="7" rx="3.5" fill="#06B6D4" opacity="0.7"/>
        <rect x="266" y="294" width="104" height="7" rx="3.5" fill="#64748B" opacity="0.4"/>
        <!-- Editor Pane -->
        <rect x="426" y="160" width="524" height="270" rx="8" fill="#0E121A" stroke="#252D3A"/>
        <rect x="450" y="184" width="140" height="10" rx="5" fill="#06B6D4"/>
        <rect x="450" y="212" width="320" height="8" rx="4" fill="#94A3B8" opacity="0.5"/>
        <rect x="476" y="232" width="260" height="8" rx="4" fill="#8B5CF6" opacity="0.75"/>
        <rect x="476" y="252" width="380" height="8" rx="4" fill="#64748B" opacity="0.45"/>
        <rect x="476" y="272" width="220" height="8" rx="4" fill="#06B6D4" opacity="0.65"/>
        <rect x="450" y="302" width="340" height="8" rx="4" fill="#94A3B8" opacity="0.4"/>
        <rect x="450" y="330" width="476" height="78" rx="8" fill="#141A24" stroke="#252D3A"/>
        <path d="M474 388 L540 364 L610 374 L685 348 L760 356 L840 338 L900 344" fill="none" stroke="#8B5CF6" stroke-width="3" stroke-linecap="round"/>
        <!-- Mechanical Keyboard -->
        <rect x="380" y="612" width="440" height="76" rx="12" fill="#1A2230" stroke="#2E3746" stroke-width="2"/>
        <rect x="400" y="628" width="400" height="44" rx="6" fill="#0E121A"/>
        <rect x="412" y="636" width="28" height="12" rx="3" fill="#8B5CF6" opacity="0.8"/>
        <rect x="448" y="636" width="290" height="12" rx="3" fill="#252D3A"/>
        <rect x="746" y="636" width="42" height="12" rx="3" fill="#06B6D4" opacity="0.75"/>
        <rect x="480" y="654" width="220" height="10" rx="3" fill="#252D3A"/>
      </svg>
    `);
  }

  if (variant === 'architecture') {
    return svgToDataUri(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 760" width="1200" height="760">
        <defs>
          <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#090B10"/>
            <stop offset="55%" stop-color="#131B2E"/>
            <stop offset="100%" stop-color="#1A253D"/>
          </linearGradient>
          <linearGradient id="glass" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stop-color="#06B6D4" stop-opacity="0.3"/>
            <stop offset="100%" stop-color="#8B5CF6" stop-opacity="0.1"/>
          </linearGradient>
        </defs>
        <rect width="1200" height="760" fill="url(#sky)"/>
        <!-- Geometric Architectural Towers -->
        <polygon points="180,760 180,140 500,80 500,760" fill="#0E121A" stroke="#252D3A" stroke-width="2"/>
        <polygon points="500,80 680,155 680,760 500,760" fill="#141A24" stroke="#252D3A" stroke-width="2"/>
        <polygon points="620,760 620,210 920,130 920,760" fill="#111722" stroke="#2E384B" stroke-width="2"/>
        <polygon points="920,130 1080,220 1080,760 920,760" fill="url(#glass)" stroke="#252D3A" stroke-width="2"/>
        <!-- Curtain Wall Mullions -->
        <g stroke="#252D3A" stroke-width="1.5">
          <line x1="260" y1="125" x2="260" y2="760"/>
          <line x1="340" y1="110" x2="340" y2="760"/>
          <line x1="420" y1="95" x2="420" y2="760"/>
          <line x1="700" y1="188" x2="700" y2="760"/>
          <line x1="780" y1="167" x2="780" y2="760"/>
          <line x1="860" y1="146" x2="860" y2="760"/>
          <line x1="180" y1="260" x2="500" y2="210"/>
          <line x1="180" y1="380" x2="500" y2="335"/>
          <line x1="180" y1="500" x2="500" y2="460"/>
          <line x1="620" y1="320" x2="920" y2="250"/>
          <line x1="620" y1="440" x2="920" y2="375"/>
          <line x1="620" y1="560" x2="920" y2="500"/>
        </g>
        <!-- Illuminated Atrium Strip -->
        <line x1="500" y1="80" x2="500" y2="760" stroke="#06B6D4" stroke-width="3" opacity="0.65"/>
        <line x1="920" y1="130" x2="920" y2="760" stroke="#8B5CF6" stroke-width="3" opacity="0.65"/>
        <!-- Warm Interior Lights -->
        <rect x="275" y="275" width="48" height="18" fill="#06B6D4" opacity="0.45"/>
        <rect x="355" y="395" width="48" height="18" fill="#8B5CF6" opacity="0.4"/>
        <rect x="715" y="340" width="50" height="20" fill="#F8FAFC" opacity="0.22"/>
        <rect x="795" y="460" width="50" height="20" fill="#06B6D4" opacity="0.35"/>
      </svg>
    `);
  }

  if (variant === 'design_system') {
    return svgToDataUri(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 760" width="1200" height="760">
        <rect width="1200" height="760" fill="#090B10"/>
        <!-- Subtle Coordinate Grid -->
        <g stroke="#1A2230" stroke-width="1">
          <line x1="0" y1="190" x2="1200" y2="190"/>
          <line x1="0" y1="380" x2="1200" y2="380"/>
          <line x1="0" y1="570" x2="1200" y2="570"/>
          <line x1="300" y1="0" x2="300" y2="760"/>
          <line x1="600" y1="0" x2="600" y2="760"/>
          <line x1="900" y1="0" x2="900" y2="760"/>
        </g>
        <!-- Token Swatch Cards -->
        <rect x="110" y="110" width="460" height="540" rx="22" fill="#141A24" stroke="#252D3A" stroke-width="2"/>
        <text x="152" y="172" font-family="Space Grotesk, sans-serif" font-size="28" font-weight="700" fill="#F8FAFC">Surface &amp; Elevation Scale</text>
        <text x="152" y="205" font-family="Inter, sans-serif" font-size="16" fill="#94A3B8">4-tier dark hierarchy · Contrast validated</text>
        <rect x="152" y="246" width="376" height="78" rx="12" fill="#090B10" stroke="#252D3A"/>
        <text x="176" y="292" font-family="JetBrains Mono, monospace" font-size="17" fill="#F8FAFC">01  Canvas Primary      #090B10</text>
        <rect x="152" y="342" width="376" height="78" rx="12" fill="#0E121A" stroke="#252D3A"/>
        <text x="176" y="388" font-family="JetBrains Mono, monospace" font-size="17" fill="#F8FAFC">02  Shell Secondary     #0E121A</text>
        <rect x="152" y="438" width="376" height="78" rx="12" fill="#1A2230" stroke="#2F394A"/>
        <text x="176" y="484" font-family="JetBrains Mono, monospace" font-size="17" fill="#F8FAFC">03  Elevated Layer      #1A2230</text>
        <rect x="152" y="534" width="180" height="74" rx="12" fill="#8B5CF6"/>
        <text x="180" y="578" font-family="JetBrains Mono, monospace" font-size="16" font-weight="600" fill="#F8FAFC">#8B5CF6</text>
        <rect x="348" y="534" width="180" height="74" rx="12" fill="#06B6D4"/>
        <text x="376" y="578" font-family="JetBrains Mono, monospace" font-size="16" font-weight="600" fill="#090B10">#06B6D4</text>
        <!-- Component Specimen -->
        <rect x="620" y="110" width="470" height="254" rx="22" fill="#141A24" stroke="#252D3A" stroke-width="2"/>
        <text x="660" y="168" font-family="Space Grotesk, sans-serif" font-size="42" font-weight="700" fill="#F8FAFC">Aa Bb Cc</text>
        <text x="660" y="210" font-family="Inter, sans-serif" font-size="18" fill="#94A3B8">Space Grotesk Display · Inter Body</text>
        <rect x="660" y="246" width="390" height="78" rx="14" fill="#0E121A" stroke="#252D3A"/>
        <circle cx="704" cy="285" r="20" fill="#8B5CF6"/>
        <rect x="742" y="272" width="180" height="10" rx="5" fill="#F8FAFC"/>
        <rect x="742" y="292" width="110" height="8" rx="4" fill="#64748B"/>
        <!-- Bezier Curve Motion Card -->
        <rect x="620" y="396" width="470" height="254" rx="22" fill="#141A24" stroke="#252D3A" stroke-width="2"/>
        <text x="660" y="450" font-family="Space Grotesk, sans-serif" font-size="22" font-weight="600" fill="#F8FAFC">Motion Curve · 180ms Ease</text>
        <path d="M670 600 C740 600, 760 480, 1030 480" fill="none" stroke="#06B6D4" stroke-width="4" stroke-linecap="round"/>
        <circle cx="670" cy="600" r="7" fill="#8B5CF6"/>
        <circle cx="1030" cy="480" r="7" fill="#06B6D4"/>
      </svg>
    `);
  }

  if (variant === 'alpine_dusk') {
    return svgToDataUri(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 760" width="1200" height="760">
        <defs>
          <linearGradient id="dusk" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#090B10"/>
            <stop offset="48%" stop-color="#191B36"/>
            <stop offset="100%" stop-color="#0F2333"/>
          </linearGradient>
        </defs>
        <rect width="1200" height="760" fill="url(#dusk)"/>
        <circle cx="880" cy="190" r="46" fill="#E2E8F0" opacity="0.88"/>
        <circle cx="880" cy="190" r="95" fill="#8B5CF6" opacity="0.12"/>
        <path d="M0 540 L260 330 L470 460 L740 240 L1020 440 L1200 360 L1200 760 L0 760 Z" fill="#111827"/>
        <path d="M0 600 L310 430 L580 550 L870 370 L1200 540 L1200 760 L0 760 Z" fill="#0B101B"/>
        <path d="M0 660 Q420 590 760 645 T1200 620 L1200 760 L0 760 Z" fill="#090B10"/>
        <line x1="740" y1="240" x2="620" y2="395" stroke="#06B6D4" stroke-width="2" opacity="0.35"/>
      </svg>
    `);
  }

  if (variant === 'story_evening') {
    return svgToDataUri(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 720 1280" width="720" height="1280">
        <defs>
          <linearGradient id="stbg" x1="0" y1="0" x2="0.4" y2="1">
            <stop offset="0%" stop-color="#090B10"/>
            <stop offset="45%" stop-color="#1B1635"/>
            <stop offset="100%" stop-color="#0C2430"/>
          </linearGradient>
        </defs>
        <rect width="720" height="1280" fill="url(#stbg)"/>
        <circle cx="360" cy="460" r="240" fill="#8B5CF6" opacity="0.18"/>
        <circle cx="480" cy="780" r="200" fill="#06B6D4" opacity="0.14"/>
        <rect x="110" y="280" width="500" height="620" rx="28" fill="#0E121A" fill-opacity="0.7" stroke="#2A3447" stroke-width="2"/>
        <path d="M160 720 L290 540 L410 640 L520 470 L560 720 Z" fill="#1A2230" stroke="#06B6D4" stroke-opacity="0.4" stroke-width="2"/>
        <circle cx="240" cy="410" r="34" fill="#8B5CF6" opacity="0.7"/>
      </svg>
    `);
  }

  return svgToDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 760" width="1200" height="760">
      <defs>
        <linearGradient id="mesh" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#0E121A"/>
          <stop offset="50%" stop-color="#1A1838"/>
          <stop offset="100%" stop-color="#0D2533"/>
        </linearGradient>
      </defs>
      <rect width="1200" height="760" fill="url(#mesh)"/>
      <circle cx="380" cy="360" r="220" fill="#8B5CF6" opacity="0.18"/>
      <circle cx="820" cy="420" r="220" fill="#06B6D4" opacity="0.16"/>
      <path d="M160 520 C340 240, 820 620, 1040 240" fill="none" stroke="#8B5CF6" stroke-width="3" opacity="0.65"/>
      <path d="M160 440 C380 620, 780 180, 1040 480" fill="none" stroke="#06B6D4" stroke-width="3" opacity="0.65"/>
      <circle cx="340" cy="360" r="10" fill="#F8FAFC"/>
      <circle cx="620" cy="410" r="10" fill="#8B5CF6"/>
      <circle cx="880" cy="320" r="10" fill="#06B6D4"/>
    </svg>
  `);
}

export function createCoverVisual(accentA: string, accentB: string): string {
  return svgToDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 420" width="1440" height="420">
      <defs>
        <linearGradient id="cov" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#090B10"/>
          <stop offset="55%" stop-color="${accentA}" stop-opacity="0.38"/>
          <stop offset="100%" stop-color="${accentB}" stop-opacity="0.32"/>
        </linearGradient>
      </defs>
      <rect width="1440" height="420" fill="#0E121A"/>
      <rect width="1440" height="420" fill="url(#cov)"/>
      <circle cx="1140" cy="120" r="240" fill="${accentB}" opacity="0.14"/>
      <circle cx="320" cy="340" r="200" fill="${accentA}" opacity="0.14"/>
      <path d="M0 320 Q360 220 720 300 T1440 240" fill="none" stroke="rgba(248,250,252,0.12)" stroke-width="2"/>
    </svg>
  `);
}
