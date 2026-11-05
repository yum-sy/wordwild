# Public beta

Play: https://yum-sy.github.io/wordwild/

Feedback: https://github.com/yum-sy/wordwild/issues

This beta saves progress in this browser only. Clearing site data may erase progress. Please report your device, browser, stage, what happened, and what you expected. Do not include children’s names or personal information.

Updates to main run checks and publish automatically with GitHub Pages. Run `BASE_PATH=/wordwild/ npm run build` to build the project site, or `npm run build` for root-domain hosting. Only runtime files from dist are deployed.

---

# Wordwild — 영어 학습 몬스터 로그라이크

6세 영어 입문자를 위한 쉬운 영어 UI의 터치/마우스 게임. 영어 4지선다를 풀며 100스테이지를 탐험합니다. 

## 실행

Node.js 22 이상에서 별도 패키지 설치 없이 실행합니다.

```sh
npm run dev
```

브라우저에서 http://127.0.0.1:5173 을 엽니다. 다른 포트는 `PORT=5174 npm run dev`로 지정합니다.

```sh
npm test
npm run check
```

## 구성

- `src/learning.js`: 10구간 커리큘럼, 어휘, 검증된 문장 문제, 누적 복습, 중복 회피, 그림 렌더링. 몬스터와 독립된 데이터입니다.
- `src/balance.js`: 콤보 배율, 포획 확률, 특별 보상 확률, 야생 진화, 계승 정책.
- `src/game.js`: 정수 예산 배분, 전투 상태, 보스, 포획, 보상과 진화. UI와 독립적으로 테스트합니다.
- `src/monsters.js`: 종족 데이터 및 픽셀 스타일 몬스터 7종. 종족별 기본 스프라이트 한 장을 모든 진화 단계에서 재사용하며 크기·색감·오라만 변경합니다.
- `src/app.js`, `src/style.css`: 반응형 UI. 음성·타이머·계정 없음.
- `tests/game.test.js`: 명세서 핵심 불변 조건과 100스테이지 완주 시뮬레이션.

## 구현 정책 및 현재 범위

- 명예의 전당과 계승 친구만 localStorage에 저장합니다. 진행 중 도전은 새로고침하면 초기화됩니다.
- 계승은 종족과 진화 단계를 유지하며 능력치는 1스테이지 예산으로 초기화합니다. 진화 횟수도 유지됩니다.
- 최초 능력치는 예산의 15% 하한, 85~100% 사용률을 만족하는 정수 후보에서 선택합니다. 전투 길이 조정용 적 HP 하한은 별도 적용하고 포획 후에도 유지합니다. 일반 적 HP 하한은 `ceil(3 + stage × .28)`, 보스는 2배입니다. 능력치 극단 배분을 허용하므로 실제 전투 길이는 달라집니다.
- 포획하면 HP는 완전 회복하며 남아 있는 실드 상태는 유지합니다. 획득 능력치·진화는 유지합니다.
- 회복형은 2콤보부터 `(콤보−1) × 최대 HP의 5%`만큼 올림 회복합니다. 성장형은 해당 능력을 가진 친구가 달성한 최고 콤보를 기록합니다.
- 여러 진화 조건이 동시에 충족되면 HP → 공격 → 실드 순으로 한 번만 판정합니다. 광역 공격 보상은 각 친구별로 최대 한 번 진화합니다.
- 수치 보상은 성장 배율을 적용해 올림하며 완전 회복과 포획 부적은 고정 효과입니다.
- 학습용 그림은 SVG와 운영체제 이모지를 사용합니다. 기기에 따라 이모지 모양은 다릅니다. 자동 검증은 구조와 유일 선택지를 확인하며 교육적 타당성을 대신하지 않습니다. 출시 전 유아 대상 이해도 테스트와 교육 전문가 검토가 필요합니다.
- Google Fonts는 선택적으로 로드하며 연결되지 않으면 시스템 글꼴을 사용합니다. 이미지·게임 로직은 로컬에서 동작합니다.
- 개발 서버는 로컬 전용이며 배포용 서버가 아닙니다. 배포 시 `index.html`, `src/`, `assets/`를 정적 호스팅하면 됩니다.

실제 어린이 플레이 테스트와 장기 성장 밸런스 조정은 아직 수행하지 않았습니다.

## Visual refresh

- Dark pixel RPG UI, a local forest battle background, diagonal battle positions, HP panels and a four-choice attack window.
- All game UI, feedback and accessible labels are English-only. The original Korean specification remains unchanged as a development reference.
- Evolution uses one base image per species. There are no alternate evolution sprites or new evolution names in the game. Scaling, tint and aura communicate growth.
- Sprite artwork and its generation prompt are documented in `assets/README.md`.
- `tests/presentation.test.js` guards English-only text and base-sprite reuse across evolution levels and routes.

## Battle feedback

- A 2.2-second presentation sequence links each answer to its attack: 400 ms answer/charge, 550 ms projectile, 600 ms impact/HP, 650 ms settle.
- Correct answers advance automatically after the effect, including victory. Wrong answers show the correct choice and wait for GOT IT after the effect.
- Inputs are locked during the sequence. Hidden-tab time pauses the sequence. Reduced-motion preferences remove movement while preserving feedback and pacing.
- Timing lives in `src/battle-sequence.js`; fake-clock tests cover ordering, duplicate-start prevention, pause/resume and cancellation.

## Reading-first layout

`src/readable.css` sets the child-friendly type scale and layout. Questions are 44–48px; answer text is 22–24px; main instructions and buttons are 20–24px. Secondary text never shrinks below 16px. Standard letterforms replace pixel text for reading. On narrow screens, starter, reward and learning cards stack instead of shrinking their text. Pixel monster art, the green YOU/red ENEMY distinction and attack timing are preserved.

### Random loot
Each victory rolls three independent rewards once, with duplicates allowed. Each normal slot rolls Common 50%, Uncommon 30%, Rare 15%, or Epic 5%, then chooses uniformly within that rarity. All 20 rewards remain eligible even at full resources, preserving per-item probabilities: 10%, 5%, 3%, and 1.25% respectively. Backing out of target selection preserves the roll; only one card is claimed.

- Common (5): HP +2, one shield piece, half HP heal, restore one shield, catch chance +10 percentage points.
- Uncommon (6): HP +3, two shield pieces, full individual HP heal, restore two shields, catch chance +20 percentage points, attack +1.
- Rare (5): full team HP heal, add one permanent shield, HP +5, full team shield repair, team attack +1.
- Epic (4): attack +2, add one permanent shield to each teammate, full team HP/shield restoration, Golden Net.

The existing bonus-slot rule remains: 15% chance, guaranteed at Grow combo 5, with Rare 90% / Epic 10%. Growth multipliers apply to permanent HP/attack/shield/piece gains. Healing and shield charging retain their stated amounts and cannot exceed caps. Charging never adds maximum shields. Catch charms retain the cumulative +50 percentage-point run cap and ordinary catches remain capped at 95%. Each Golden Net guarantees the next valid capture attempt, including bosses, consumes one stored net, and bypasses the ordinary chance cap. Unused nets carry forward; repeated Golden Net rewards add charges.

### Tablet layout
`src/tablet.css` supplies portrait and landscape tablet layouts. Portrait stacks the arena above a question/answer panel; landscape places battle and questions side by side. The active game uses dynamic viewport height and safe-area padding, with touch targets and no forced orientation or zoom restriction. Starter selection fits within the tablet viewport too. Layout checks covered 768×900, 820×1060, 1024×650, and 1180×700 CSS pixels, including reduced height for browser chrome. These are browser viewport checks, not physical iPad Chrome verification.

### Fixed screens and menu paging
`src/screens.css` unifies every route into the viewport. Gameplay uses two persistent regions: monster/battle scene and choices, stacked in portrait and side by side in landscape. Capture animations stay in the scene while rewards, swaps and camp choices occupy the action region. Team, curriculum and history use Previous/Next buttons rather than scrolling. Browser layout checks cover 768×900, 1024×650 and 390×844, including all non-battle phases and menu routes; physical-device validation remains outstanding.

### Expanded monster roster
The roster now contains 64 distinct base species (54 wild, 10 dragon bosses). Three transparent 4×4 atlases add 48 original bodies. Stages 1/11/21/31 unlock wild pools of 25/39/48/54 species. Recent three species are avoided on regular encounters where alternatives exist. A fourth atlas provides ten dragon bosses at stages 10–100; the final boss retains the saved `boss` identity. Starter identities remain; evolution still uses one body per species. Palette variants are reserved for a later update, not counted as new species now.

Battle sprites now size to the arena with container-relative limits; HUDs sit higher to keep larger characters visible. `src/monster-frames.js` defines per-species CSS atlas windows and clipping (source pixels are untouched). Recalculate these windows with `python3 scripts/measure-monster-frames.py` if replacing an atlas; it requires Pillow. Art prompts and full roster are documented under `assets/`.

## Learning and battle v2

Wrong answers stay locked on the same question until a correct choice is made. All enemies use a third-miss power hit with a 90% current-HP damage floor, while shields still block one hit. Learning history persists locally across runs, distinguishing first-try success from assisted retries. The curriculum has 2,140 templated items, with grammar at stages 61–80 and stories/useful expressions at 81–100. See [implementation and comparison](docs/curriculum/v2-implemented.md), [original snapshot](docs/curriculum/v1-snapshot.json), and [simulation audit](docs/curriculum/v2-audit.json). These rules supersede earlier learning-flow descriptions.

## Accidental input protection

The game surface blocks text selection, native image dragging, long-press menus and page scrolling. A pointer gesture that travels more than 18 CSS pixels, lasts 700 ms or more, uses multiple fingers, is cancelled, or ends on another control cannot activate a button. Accepted actions have a 350 ms follow-through guard across rerenders. Keyboard activation remains supported; browser pinch zoom is retained. Dialogs block background actions. During a live run, supported browsers warn before unloading; operating-system navigation and all mobile reload paths cannot be guaranteed by a web page.

Input guard tests and browser verification cover normal taps, dragging on a button without activation, and subsequent normal activation. Real iPad touch/OS gestures still need device testing.

### Ten-region journey
Each group of ten stages uses its own generated environment, from Sun Meadow to Dragon Crown. The region persists through battle, catching, rewards and camp; stage 10 keeps region one and stage 11 enters region two. Bright natural early areas transition to colorful luminous twilight sanctuaries without horror imagery. Definitions: `src/regions.js`; images and preview: `assets/regions/`; generation prompts: `assets/region-prompts.md`. Existing monsters and battle rules are unchanged.

### Attack effect variety
Four answer positions map to slash, wave, lightning and star/crystal families, with four distinct SVG silhouettes each (16 total). A position avoids its last effect; selection occurs once after an accepted answer, never during rerenders. Both player attacks and enemy counters use the selected cosmetic effect, with reversed direction, a larger power-hit treatment, and an explicit shield block. No damage, reward, correctness or turn-duration changes. Reduced-motion preferences remove effect travel/spin and combat lunge. Source: `src/attack-effects.js`, `src/attack-effects.css`; shape preview: `assets/attack-effects-preview.html`.

### Rare finds and lucky stages
- Encounter appearance is cosmetic and mutually exclusive: Total rare chance 1%. The original Giant : Silver : Gold ratio stays 6 : 2 : 1: Giant ≈0.666667%, Silver ≈0.222222%, Gold ≈0.111111%; ordinary 99%. Normal enemies and dragon bosses can have these appearances; starters only inherit them from a chosen hero. Giant rendering is 15% larger. Stats and capture odds are unchanged.
- Capturing a rare appearance registers its species/form in the local `wordwild-rare-collection`, even if a full-party capture is then released. The paged Rare finds menu is available on the start screen. It is a record, not permanent access to every captured monster. Chosen-hero inheritance retains the appearance.
- Each non-boss stage, including stage 1, rolls a 0.75% lucky event on entry. An event replaces that stage's battle: no question generation, answer counts, or learning exposure. Gift choices are equally likely: Golden Net; Team Shield; Magic Spring (full team HP/shields plus a Golden Net). Take the gift once, then continue through camp. Boss stages always battle. Rewards and claimed state survive reload; no reroll on resume. Existing saved runs remain supported.
- Tests include rare-form boundaries, capture/evolution/inheritance, collection deduplication, boss exclusion, no question exposure, all gifts, and save/resume claim-once behavior. Probability values are initial tuning, not validated retention or learning outcomes.

## Music

Six approved instrumental tracks cover the home screen, stages 1–30 / 31–60 / 61–100, dragon bosses and the final boss. Victory, successful capture and awakening have short cues. Audio starts only after a tap, fades between tracks, pauses while hidden, and remembers the ♪ On/Off preference on this browser. AAC assets are loaded on demand. Original audition WAV files remain local and are not published.
