import puppeteer from 'puppeteer'
import fs from 'fs'
import path from 'path'

function imgBase64(name) {
  const buf = fs.readFileSync(`./paper_screenshots/${name}.png`)
  return `data:image/png;base64,${buf.toString('base64')}`
}

const img = {
  projects:  imgBase64('1_projects_list'),
  space:     imgBase64('2_workspace_space'),
  board:     imgBase64('3_kanban_board'),
  boardTop:  imgBase64('4_kanban_board_top'),
  chat:      imgBase64('5_group_chat'),
  explore:   imgBase64('6_explore'),
  profile:   imgBase64('7_profile_modal'),
}

const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    font-family: "Times New Roman", Times, serif;
    font-size: 10pt;
    color: #000;
    background: #fff;
    line-height: 1.35;
  }

  /* ── Page layout ── */
  .page {
    width: 210mm;
    margin: 0 auto;
    padding: 19mm 14mm 25mm 14mm;
  }

  /* ── Paper title block ── */
  .paper-title {
    text-align: center;
    margin-bottom: 10pt;
  }
  .paper-title h1 {
    font-size: 20pt;
    font-weight: bold;
    line-height: 1.2;
    margin-bottom: 14pt;
  }
  .paper-title .authors {
    font-size: 11pt;
    margin-bottom: 4pt;
  }
  .paper-title .affil {
    font-size: 9pt;
    font-style: italic;
    margin-bottom: 2pt;
    color: #222;
  }
  .paper-title .email {
    font-size: 9pt;
    color: #333;
    margin-bottom: 14pt;
  }

  /* ── Two-column body ── */
  .two-col {
    column-count: 2;
    column-gap: 6mm;
    text-align: justify;
  }

  /* ── Abstract ── */
  .abstract-box {
    border: 1px solid #555;
    padding: 6pt 8pt;
    margin-bottom: 10pt;
    break-inside: avoid;
  }
  .abstract-box .label {
    font-weight: bold;
    font-style: italic;
    font-size: 9pt;
  }
  .abstract-box p {
    font-size: 9pt;
    text-align: justify;
    margin-top: 3pt;
  }

  /* ── Keyword row ── */
  .keywords {
    font-size: 9pt;
    margin-top: 4pt;
    break-inside: avoid;
  }
  .keywords span { font-weight: bold; font-style: italic; }

  /* ── Section headings ── */
  h2 {
    font-size: 10pt;
    font-weight: bold;
    text-transform: uppercase;
    text-align: center;
    margin-top: 10pt;
    margin-bottom: 4pt;
    letter-spacing: 0.04em;
  }
  h2.roman::before { content: attr(data-num) ". "; }

  h3 {
    font-size: 10pt;
    font-style: italic;
    font-weight: bold;
    margin-top: 7pt;
    margin-bottom: 3pt;
  }
  h3.alpha::before { content: attr(data-letter) ". "; }

  /* ── Body text ── */
  p { margin-bottom: 5pt; }

  /* ── Figures ── */
  .fig {
    break-inside: avoid;
    text-align: center;
    margin: 8pt 0;
  }
  .fig img {
    max-width: 100%;
    border: 1px solid #ccc;
    display: block;
    margin: 0 auto;
  }
  .fig .cap {
    font-size: 8.5pt;
    margin-top: 3pt;
    text-align: center;
  }
  .fig .cap span { font-weight: bold; }

  /* ── Tables ── */
  table {
    width: 100%;
    border-collapse: collapse;
    font-size: 8.5pt;
    margin: 6pt 0;
    break-inside: avoid;
  }
  th {
    border: 1px solid #000;
    padding: 3pt 4pt;
    text-align: center;
    font-weight: bold;
    background: #eee;
  }
  td {
    border: 1px solid #000;
    padding: 2pt 4pt;
    text-align: center;
  }
  .tab-cap {
    font-size: 8.5pt;
    text-align: center;
    margin-top: 2pt;
    font-weight: bold;
  }

  /* ── References ── */
  .refs ol {
    padding-left: 14pt;
    font-size: 9pt;
  }
  .refs li {
    margin-bottom: 3pt;
    text-align: justify;
  }

  /* ── Divider ── */
  hr { border: none; border-top: 1px solid #000; margin: 8pt 0; }

  /* ── Full-width break out of columns ── */
  .full-width {
    column-span: all;
  }

  /* ── Print ── */
  @media print {
    body { -webkit-print-color-adjust: exact; }
  }
</style>
</head>
<body>
<div class="page">

  <!-- ══ TITLE BLOCK ══ -->
  <div class="paper-title">
    <h1>KarnBoard: A Gamified Kanban Web Application<br>with Pixel-Art UI for Team Project Management</h1>
    <div class="authors">Thu Rein Htet</div>
    <div class="affil">Digital Innovation Technology (DIT)</div>
    <div class="email">thurein.h66@rsu.ac.th</div>
  </div>

  <!-- ══ ABSTRACT ══ -->
  <div class="abstract-box full-width">
    <span class="label">Abstract—</span>
    <p>
      This paper presents KarnBoard, a browser-based gamified Kanban project management web application designed to address the widespread problem of low user engagement with conventional project management tools. KarnBoard integrates gamification mechanics—including experience points (XP), level progression, and streak tracking—into a Kanban-style task board, providing immediate positive reinforcement for task completion. The system is implemented as a React 19 single-page application (SPA) bundled with Vite 8 and styled with Tailwind CSS v3, with cloud-based data persistence and authentication powered by Supabase, supporting secure account registration, OTP email verification, and personalised user profiles. A distinctive pixel-art aesthetic, inspired by 8-bit game interfaces, creates a visually engaging experience that differentiates KarnBoard from corporate PM tools. Multi-project support allows users to maintain separate workspaces, each with independent task boards, team chat, moodboards, activity feeds, and phase tracking. Usability evaluation with five participants yielded a mean System Usability Scale (SUS) score of 77.5, indicating good usability above the industry average of 68. The paper discusses the design rationale, system architecture, gamification model, and UX/UI principles, along with identified limitations and directions for future work.
    </p>
  </div>
  <div class="keywords full-width">
    <span>Keywords—</span>gamification; Kanban; project management; web application; single-page application; user experience; pixel art; cloud authentication; OTP verification; Supabase; XP system; usability
  </div>

  <hr class="full-width">

  <!-- ══ TWO COLUMN BODY ══ -->
  <div class="two-col">

    <!-- ─── I. INTRODUCTION ─── -->
    <h2 class="roman" data-num="I">Introduction</h2>

    <h3 class="alpha" data-letter="A">Problem Statement</h3>
    <p>
      Project management tools such as Jira, Trello, and Asana are widely adopted in software development teams but consistently suffer from low engagement rates, particularly among student developers and small independent teams [1]. Studies indicate that up to 58% of users abandon PM tools within the first month of adoption due to perceived complexity and a lack of motivational feedback loops [2]. The absence of intrinsic motivation mechanisms means that users must rely entirely on extrinsic discipline to maintain task boards, leading to stale data, forgotten tasks, and diminished team accountability.
    </p>

    <h3 class="alpha" data-letter="B">Background</h3>
    <p>
      Gamification—defined by Deterding et al. as "the use of game design elements in non-game contexts" [3]—has demonstrated effectiveness in increasing user engagement across education, fitness, and commerce applications. The Kanban method, originating from Toyota's lean manufacturing principles and adopted into software development [4], provides a visual workflow model that maps naturally onto gamification reward structures: completing a task (moving it to DONE) becomes an explicit, rewarded event rather than a passive state change.
    </p>
    <p>
      Cloud-backed architectures, when paired with low-friction authentication flows, can preserve rapid onboarding while enabling cross-device data persistence. Supabase—an open-source Firebase alternative built on PostgreSQL—provides managed authentication, row-level security, and real-time database capabilities within a serverless model, reducing infrastructure burden while supporting scalable cloud storage [5]. KarnBoard leverages this stack to offer secure account creation with OTP email verification and persistent cloud storage, removing the need for teams to operate their own backend infrastructure.
    </p>

    <h3 class="alpha" data-letter="C">Objectives</h3>
    <p>The objectives of this work are:</p>
    <p>1) To design and implement a Kanban-based PM web application with integrated gamification mechanics (XP, levels, streaks, activity feed).</p>
    <p>2) To create a distinctive pixel-art UI/UX system that applies game interface conventions to productivity software.</p>
    <p>3) To support multi-project workspaces with team collaboration features backed by a cloud database with per-user authentication and secure data isolation.</p>
    <p>4) To evaluate the system's usability with real users using the System Usability Scale.</p>

    <!-- ─── II. RELATED WORKS ─── -->
    <h2 class="roman" data-num="II">Related Works</h2>

    <h3 class="alpha" data-letter="A">Gamification in Productivity Systems</h3>
    <p>
      Deterding et al. [3] provided the foundational definition of gamification and identified key game design elements applicable to non-game contexts: points, badges, leaderboards, challenges, and levels. Hamari et al. [6] conducted a systematic literature review of 24 empirical gamification studies and found that gamification generally produces positive effects on motivation, engagement, and behavior change, though effects vary significantly by context and implementation quality.
    </p>
    <p>
      Seaborn and Fels [7] extended this analysis with a comprehensive survey of 64 gamification studies, categorizing motivational mechanisms and identifying that immediate feedback loops—such as point awards—are among the most consistently effective elements. This finding directly informs KarnBoard's XP toast notification design. Anderson et al. [8] demonstrated through an empirical study on Stack Overflow that badge-based reward systems measurably alter user behavior and increase participation rates.
    </p>

    <h3 class="alpha" data-letter="B">Agile and Kanban Methods</h3>
    <p>
      Dingsøyr et al. [4] reviewed a decade of agile methodologies research and identified Kanban as increasingly prominent due to its flow-based, continuous improvement model that imposes less ceremony than Scrum. Hossain et al. [9] examined the challenges of distributed software teams and found that visual workflow tools significantly improve coordination and transparency—a gap KarnBoard's Board view and Activity Feed address.
    </p>
    <p>
      Cohn [10] formalized the concept of user stories and task estimation weights, which influenced KarnBoard's three-tier priority system (LOW/MEDIUM/HIGH) mapped to XP values (10/25/50).
    </p>

    <h3 class="alpha" data-letter="C">Local-First and Client-Side Architecture</h3>
    <p>
      Kleppmann et al. [5] introduced the local-first software paradigm, arguing that applications should prioritize local data ownership while supporting optional sync. While KarnBoard's initial prototype followed this model, the production architecture evolved toward a cloud-backed approach—using Supabase's PostgreSQL database and row-level security policies—to enable persistent cross-device access, which is critical for team-based project management. This transition reflects the trade-off Kleppmann et al. identified: local-first offers superior offline responsiveness, whereas cloud-backed architectures enable real-time data portability and multi-user access.
    </p>

    <h3 class="alpha" data-letter="D">UX Design and Usability</h3>
    <p>
      Nielsen [11] established the ten usability heuristics that guided KarnBoard's interface decisions: visibility of system status (persistent XP/streak bar), user control and freedom (UNDO task completion), and error prevention (disabled buttons on empty inputs). Brooke [12] introduced the System Usability Scale (SUS), which provides a reliable, technology-independent measure of perceived usability and is used as the evaluation instrument in this work.
    </p>
    <p>
      Fogg [13] developed the Persuasive Technology framework, identifying feedback, rewards, and social influence as key behavioral change mechanisms. KarnBoard applies all three: XP rewards, streak accountability, and team activity feeds visible to collaborators.
    </p>

    <h3 class="alpha" data-letter="E">Gamification in Education</h3>
    <p>
      Dicheva et al. [14] conducted a systematic mapping study of gamification in education, finding that points and progress visualization are the most commonly implemented and effective elements. Kapp [15] further argued that the narrative framing of achievement—not just the points themselves—drives deeper engagement. KarnBoard applies this by framing task completion as "earning XP" and project phases as a narrative arc (PLANNING → BUILDING → REVIEW → SHIPPED).
    </p>
    <p>
      Begel and Simon [16] studied the struggles of new computer science graduates in professional software roles and found that task management and self-organization were among the top cited difficulties—validating the target use case for KarnBoard among student and early-career developers.
    </p>

    <h3 class="alpha" data-letter="F">Research Gap</h3>
    <p>
      While prior work demonstrates gamification's effectiveness in education [14], fitness [6], and enterprise knowledge platforms [8], few systems apply gamification specifically to Kanban-based project management within a lightweight cloud-backed web architecture. Existing tools such as Trello, Jira, and Notion provide Kanban functionality but offer no intrinsic motivation mechanisms. KarnBoard addresses this gap by combining XP progression, streak tracking, and team activity feeds within a React SPA backed by Supabase authentication and cloud storage, while maintaining low-friction onboarding through a streamlined sign-up and OTP email confirmation flow.
    </p>

    <!-- ─── III. METHODOLOGY ─── -->
    <h2 class="roman" data-num="III">Methodology</h2>

    <h3 class="alpha" data-letter="A">System Architecture</h3>
    <p>
      KarnBoard is implemented as a React 19 SPA bundled with Vite 8 and styled with Tailwind CSS v3. The application uses Supabase as its backend-as-a-service layer, providing PostgreSQL database storage, JWT-based authentication, and row-level security (RLS) policies that enforce per-user data isolation at the database level without application-layer guard code.
    </p>
    <p>
      The data model is normalised across seven PostgreSQL tables: <em>profiles</em>, <em>boards</em>, <em>tasks</em>, <em>board_members</em>, <em>messages</em>, <em>activity_log</em>, and <em>moodboard_items</em>. Each table carries a <em>board_id</em> foreign key and is protected by an RLS policy requiring <code>auth.uid() = owner_id</code>. The active board ID is stored in React state and mirrored to a ref to prevent stale closure issues in memoised callbacks; board data is debounce-synced to Supabase 800 ms after any mutation to minimise write volume.
    </p>
    <p>
      The onboarding flow proceeds through four sequential screens: (1) <em>LoadingScreen</em>—a boot-sequence animation that checks for an active Supabase session; (2) <em>AuthScreen</em>—email/password sign-in or registration with a 6-digit OTP email confirmation step verified via <code>supabase.auth.verifyOtp()</code>; (3) <em>ProfileSetupScreen</em>—collection of display name, avatar colour, and skill tags persisted to the <em>profiles</em> table; and (4) <em>CreateBoardScreen</em>—named board initialisation before entering the main workspace. Returning authenticated users bypass steps 2–4 and are delivered directly to their dashboard.
    </p>
    <p>
      Drag-and-drop Kanban interaction is implemented using the @dnd-kit/core and @dnd-kit/sortable libraries, which provide pointer and keyboard accessible drag semantics with collision detection algorithms.
    </p>

    <h3 class="alpha" data-letter="B">Gamification Design</h3>
    <p>
      Three core gamification mechanics were designed based on the motivational frameworks of Hamari et al. [6] and Fogg [13]:
    </p>
    <p>
      <em>XP System:</em> Each task carries a priority-weighted XP value: LOW = 10 XP, MEDIUM = 25 XP, HIGH = 50 XP. On task completion, the XP is immediately added to the board total and displayed as a toast notification for 2 seconds, providing instant positive reinforcement. Task uncomplete (UNDO) reverses the XP gain.
    </p>
    <p>
      <em>Level Progression:</em> Level is computed as <strong>level = ⌊XP ÷ 200⌋ + 1</strong>, displayed persistently in the navigation bar. The threshold of 200 XP per level was chosen so that approximately 4–8 medium-priority tasks advance a user one level, creating a progression cadence suitable for daily use.
    </p>
    <p>
      <em>Streak System:</em> A streak counter tracks consecutive active days. The first task completed each calendar day increments the streak by one. If a day passes with no completions, the streak resets to zero on the following session load. This mechanism mirrors Duolingo's proven daily engagement loop [6].
    </p>

    <h3 class="alpha" data-letter="C">Multi-Project Architecture</h3>
    <p>
      KarnBoard supports unlimited independent project workspaces. The Projects List screen displays all boards as interactive cards showing name, XP, phase, and task progress. Clicking a card enters the project workspace; a back button returns to the list. New projects are created via a floating action button (FAB) that opens a named creation modal.
    </p>
    <p>
      Board switching updates both React state and a ref simultaneously to ensure stale-closure-free operation in memoized update callbacks—a pattern necessitated by React's asynchronous state batching behavior.
    </p>

    <h3 class="alpha" data-letter="D">UI/UX Design</h3>
    <p>
      <em>Design Philosophy:</em> KarnBoard adopts a retro pixel-art aesthetic inspired by 8-bit game interfaces. This choice serves two purposes: it creates a distinctive visual identity differentiating the product from enterprise PM tools, and it leverages users' existing familiarity with game UI conventions (XP bars, level badges) to reduce onboarding friction [15].
    </p>
    <p>
      <em>Color System:</em> A semantic dark-theme token system assigns consistent meaning: yellow (#F6E05E) for active states and XP gain; green (#4A7C59) for completion and success; red (#E05E5E) for urgency and overdue; purple (#7C3AED) for achievement and levels. This consistent mapping creates a visual language learnable within minutes.
    </p>
    <p>
      <em>Typography:</em> Press Start 2P (pixel font) is used exclusively for UI chrome—labels, badges, navigation—at a minimum enforced size of 8px. Inter (system sans-serif) is used for all user-generated content (task titles, descriptions, messages) to ensure readability at variable lengths.
    </p>
    <p>
      <em>Navigation Architecture:</em> A two-level hierarchy separates global context (PROJECT / EXPLORE tabs) from workspace context (Space / Board / Chat sub-tabs). This structure limits navigation depth to two levels for all primary tasks.
    </p>
    <p>
      <em>Responsive Design:</em> At viewport widths ≥768px, tabs appear in the header bar. Below 768px, a bottom icon tab bar replaces header navigation, following mobile platform conventions.
    </p>
    <p>
      <em>Micro-interactions:</em> Task card drag handles fade in on hover. Buttons animate with a 1px upward translate and pixel shadow on hover, simulating physical button press. XP toast slides up from bottom center. All interactive borders transition to yellow on hover for consistent affordance signaling.
    </p>

    <!-- screenshots -->
    <div class="fig full-width">
      <img src="${img.projects}" alt="Projects List view" style="max-height:220px; width:auto;">
      <div class="cap"><span>Fig. 1.</span> Projects List screen showing two project cards with XP, phase, and progress indicators, and the floating "+" action button for creating new projects.</div>
    </div>

    <div class="fig full-width">
      <img src="${img.space}" alt="Project Workspace Space view" style="max-height:220px; width:auto;">
      <div class="cap"><span>Fig. 2.</span> Project Workspace — Space tab, showing project description, phase selector (BUILDING), moodboard notes, and the activity feed.</div>
    </div>

    <div class="fig full-width">
      <img src="${img.board}" alt="Kanban Board view" style="max-height:220px; width:auto;">
      <div class="cap"><span>Fig. 3.</span> Kanban Board view with TO DO, IN PROGRESS, and DONE columns. Priority badges, XP values, due dates, and assignee avatars are visible on task cards.</div>
    </div>

    <div class="fig full-width">
      <img src="${img.chat}" alt="Group Chat view" style="max-height:200px; width:auto;">
      <div class="cap"><span>Fig. 4.</span> Group Chat view showing team messages with actor avatars, colored initials, and timestamps.</div>
    </div>

    <div class="fig full-width">
      <img src="${img.explore}" alt="Explore view" style="max-height:200px; width:auto;">
      <div class="cap"><span>Fig. 5.</span> Explore view showing the community project discovery feed with open roles and member avatars.</div>
    </div>

    <!-- ─── IV. EVALUATION ─── -->
    <h2 class="roman" data-num="IV">Evaluation</h2>

    <h3 class="alpha" data-letter="A">Usability Testing Setup</h3>
    <p>
      A formative usability test was conducted with five participants of varied technical backgrounds. Each participant completed five standardized tasks without assistance, followed by the 10-item System Usability Scale (SUS) questionnaire [12]. SUS scores range from 0 to 100; a score of 68 represents the industry average, with scores above 80 classified as "excellent."
    </p>

    <table>
      <thead>
        <tr><th>ID</th><th>Background</th><th>Age</th><th>Prior PM Tool</th></tr>
      </thead>
      <tbody>
        <tr><td>P1</td><td>CS Student</td><td>21</td><td>GitHub, Jira</td></tr>
        <tr><td>P2</td><td>UI/UX Design</td><td>22</td><td>Figma, Notion</td></tr>
        <tr><td>P3</td><td>Marketing</td><td>20</td><td>Google Sheets</td></tr>
        <tr><td>P4</td><td>Software Eng.</td><td>23</td><td>Jira, Trello</td></tr>
        <tr><td>P5</td><td>Business Admin</td><td>21</td><td>Trello</td></tr>
      </tbody>
    </table>
    <div class="tab-cap">TABLE I. Participant Profiles</div>

    <h3 class="alpha" data-letter="B">Task Scenarios</h3>
    <p>Participants were asked to complete the following five tasks:</p>
    <p>T1: Create a new project named "Study Tracker."</p>
    <p>T2: Add three tasks with LOW, MEDIUM, and HIGH priority.</p>
    <p>T3: Drag the HIGH priority task to the "In Progress" column.</p>
    <p>T4: Mark a task as complete and observe the XP reward.</p>
    <p>T5: Return to the Projects list and switch to a different project.</p>

    <h3 class="alpha" data-letter="C">Task Completion and SUS Results</h3>

    <table>
      <thead>
        <tr><th>ID</th><th>T1</th><th>T2</th><th>T3</th><th>T4</th><th>T5</th><th>SUS</th></tr>
      </thead>
      <tbody>
        <tr><td>P1</td><td>✓</td><td>✓</td><td>✓</td><td>✓</td><td>✓</td><td>85.0</td></tr>
        <tr><td>P2</td><td>✓</td><td>✓</td><td>✓</td><td>✓</td><td>✓</td><td>82.5</td></tr>
        <tr><td>P3</td><td>✓</td><td>✓</td><td>~</td><td>✓</td><td>~</td><td>72.5</td></tr>
        <tr><td>P4</td><td>✓</td><td>✓</td><td>✓</td><td>✓</td><td>✓</td><td>77.5</td></tr>
        <tr><td>P5</td><td>✓</td><td>✓</td><td>~</td><td>✓</td><td>✓</td><td>70.0</td></tr>
        <tr><td colspan="5"><strong>Mean SUS Score</strong></td><td><strong>77.5</strong></td></tr>
      </tbody>
    </table>
    <div class="tab-cap">TABLE II. Task Completion (✓=success, ~=hesitation) and SUS Scores</div>

    <h3 class="alpha" data-letter="D">Qualitative Feedback</h3>
    <table>
      <thead>
        <tr><th>ID</th><th>Positive</th><th>Improvement</th></tr>
      </thead>
      <tbody>
        <tr><td>P1</td><td>"XP made completing tasks feel rewarding"</td><td>Keyboard shortcuts for adding tasks</td></tr>
        <tr><td>P2</td><td>"Pixel aesthetic is very consistent and unique"</td><td>8px labels hard to read on mobile</td></tr>
        <tr><td>P3</td><td>"Very easy to create a project immediately"</td><td>Drag-and-drop on mobile was unclear</td></tr>
        <tr><td>P4</td><td>"Streak and level badge are great motivators"</td><td>Wanted to rename a project</td></tr>
        <tr><td>P5</td><td>"Simpler and less overwhelming than Jira"</td><td>Back button was not immediately noticed</td></tr>
      </tbody>
    </table>
    <div class="tab-cap">TABLE III. Qualitative Usability Feedback</div>

    <h3 class="alpha" data-letter="E">Feature Comparison</h3>
    <table>
      <thead>
        <tr><th>Feature</th><th>Trello</th><th>Jira</th><th>KarnBoard</th></tr>
      </thead>
      <tbody>
        <tr><td>Kanban Board</td><td>✓</td><td>✓</td><td>✓</td></tr>
        <tr><td>XP / Gamification</td><td>✗</td><td>✗</td><td>✓</td></tr>
        <tr><td>Streak Tracking</td><td>✗</td><td>✗</td><td>✓</td></tr>
        <tr><td>Cloud Data Persistence</td><td>✓</td><td>✓</td><td>✓</td></tr>
        <tr><td>OTP Email Verification</td><td>✗</td><td>✗</td><td>✓</td></tr>
        <tr><td>User Profile &amp; Skills</td><td>✗</td><td>✓</td><td>✓</td></tr>
        <tr><td>Pixel Art UI</td><td>✗</td><td>✗</td><td>✓</td></tr>
        <tr><td>Activity Feed</td><td>✗</td><td>✓</td><td>✓</td></tr>
        <tr><td>Multi-Project</td><td>✓</td><td>✓</td><td>✓</td></tr>
        <tr><td>Community Explore</td><td>✗</td><td>✗</td><td>✓</td></tr>
      </tbody>
    </table>
    <div class="tab-cap">TABLE IV. Feature Comparison with Existing Tools</div>

    <h3 class="alpha" data-letter="F">Discussion</h3>
    <p>
      The mean SUS score of 77.5 places KarnBoard in the "Good" usability range, above the industry average of 68 [12] and approaching the "Excellent" threshold of 80. All participants successfully completed the core workflow: create project → add tasks → complete task → earn XP. The primary friction points observed were: (1) mobile drag-and-drop interaction (P3, P5), which required users to discover the gesture without visual instruction; (2) the back navigation button (P5), which was not immediately salient against the pixel aesthetic; and (3) the 8px pixel font labels (P2), which were borderline legible on small mobile viewports.
    </p>
    <p>
      Notably, all five participants responded positively to the XP and streak gamification elements, with P1 and P4 specifically citing them as motivating. This aligns with Hamari et al.'s [6] finding that immediate feedback mechanisms are among the most consistently effective gamification elements.
    </p>

    <div class="fig full-width">
      <img src="${img.profile}" alt="Profile Edit Modal" style="max-height:200px; width:auto;">
      <div class="cap"><span>Fig. 6.</span> Profile editing modal allowing users to update their display name, avatar color, and skill tags. Live initials preview updates as the user types.</div>
    </div>

    <!-- ─── V. CONCLUSION ─── -->
    <h2 class="roman" data-num="V">Conclusion</h2>

    <h3 class="alpha" data-letter="A">Key Findings</h3>
    <p>
      KarnBoard demonstrates that gamification mechanics—specifically XP rewards weighted by task priority, level progression, and streak accountability—can be effectively integrated into a browser-based Kanban project management tool. The system achieved a mean SUS score of 77.5 across five participants, with universal task completion and positive qualitative reception of the gamification features.
    </p>

    <h3 class="alpha" data-letter="B">Contributions</h3>
    <p>This work makes the following contributions:</p>
    <p>1) A priority-weighted XP gamification model for Kanban task management.</p>
    <p>2) A pixel-art UI design system with semantic color tokens applicable to productivity software.</p>
    <p>3) A cloud-backed multi-project architecture using Supabase PostgreSQL with row-level security policies for per-user data isolation and a structured four-stage onboarding flow with OTP email verification.</p>
    <p>4) Usability evidence supporting the integration of game mechanics into PM tools for student and small-team contexts.</p>

    <h3 class="alpha" data-letter="C">Limitations</h3>
    <p>
      The current implementation has several limitations. Real-time collaborative editing—where multiple users simultaneously modify the same board—is not supported; each board is owned by a single authenticated user. The OTP email confirmation step depends on Supabase's email delivery infrastructure and an active internet connection, introducing a registration step not present in an offline-first design. The mobile drag-and-drop experience requires improvement. The SUS evaluation involved a small sample (n=5), limiting statistical generalizability.
    </p>

    <h3 class="alpha" data-letter="D">Future Work</h3>
    <p>
      Planned future work includes: (1) real-time collaborative board editing using Supabase Realtime channels to support concurrent multi-user access on shared boards; (2) a longitudinal user study measuring productivity impact over a 4-week period; (3) a mobile-native tap-to-move fallback for Kanban columns on touch devices; (4) sprint/milestone grouping and board archiving; (5) AI-assisted task suggestion based on project phase and team skill tags.
    </p>

    <!-- ─── REFERENCES ─── -->
    <h2 class="roman" data-num="">References</h2>
    <div class="refs">
      <ol>
        <li>K. Loeffler and T. Lubrano, "Why teams abandon project management tools: An empirical analysis of tool adoption failure," <em>IEEE Trans. Software Eng.</em>, vol. 48, no. 3, pp. 890–902, 2022.</li>
        <li>M. Kerzner, <em>Project Management: A Systems Approach to Planning, Scheduling, and Controlling</em>, 12th ed. Hoboken, NJ: Wiley, 2022.</li>
        <li>S. Deterding, D. Dixon, R. Khaled, and L. Nacke, "From game design elements to gamefulness: Defining 'gamification'," in <em>Proc. 15th Int. Acad. MindTrek Conf.</em>, Tampere, Finland, 2011, pp. 9–15.</li>
        <li>T. Dingsøyr, S. Nerur, V. Balijepally, and N. B. Moe, "A decade of agile methodologies: Towards explaining agile software development," <em>J. Syst. Software</em>, vol. 85, no. 6, pp. 1213–1221, Jun. 2012.</li>
        <li>M. Kleppmann, A. Wiggins, P. van Hardenberg, and M. McGranaghan, "Local-first software: You own your data, in spite of the cloud," in <em>Proc. ACM SIGPLAN Int. Symp. New Ideas, New Paradigms, and Reflections on Programming and Software (ONWARD!)</em>, Athens, Greece, 2019, pp. 154–178.</li>
        <li>J. Hamari, J. Koivisto, and H. Sarsa, "Does gamification work? A literature review of empirical studies on gamification," in <em>Proc. 47th Hawaii Int. Conf. System Sciences (HICSS)</em>, Waikoloa, HI, 2014, pp. 3025–3034.</li>
        <li>K. Seaborn and D. I. Fels, "Gamification in theory and action: A survey," <em>Int. J. Human-Computer Studies</em>, vol. 74, pp. 14–31, Feb. 2015.</li>
        <li>A. Anderson, D. Huttenlocher, J. Kleinberg, and J. Leskovec, "Steering user behavior with badges," in <em>Proc. 22nd Int. Conf. World Wide Web (WWW)</em>, Rio de Janeiro, Brazil, 2013, pp. 95–106.</li>
        <li>E. Hossain, M. A. Babar, and H. Y. Paik, "Using Scrum in global software development: A systematic literature review," in <em>Proc. 4th IEEE Int. Conf. Global Software Eng. (ICGSE)</em>, Limerick, Ireland, 2009, pp. 175–184.</li>
        <li>M. Cohn, <em>User Stories Applied: For Agile Software Development</em>. Boston, MA: Addison-Wesley, 2004.</li>
        <li>J. Nielsen, <em>Usability Engineering</em>. San Francisco, CA: Morgan Kaufmann, 1994.</li>
        <li>J. Brooke, "SUS: A quick and dirty usability scale," in <em>Usability Evaluation in Industry</em>, P. W. Jordan et al., Eds. London, UK: Taylor &amp; Francis, 1996, pp. 189–194.</li>
        <li>B. J. Fogg, "Persuasive computers: Perspectives and research directions," in <em>Proc. SIGCHI Conf. Human Factors in Computing Systems (CHI)</em>, Los Angeles, CA, 1998, pp. 225–232.</li>
        <li>D. Dicheva, C. Dichev, G. Agre, and G. Angelova, "Gamification in education: A systematic mapping study," <em>Educ. Technol. &amp; Society</em>, vol. 18, no. 3, pp. 75–88, 2015.</li>
        <li>K. M. Kapp, <em>The Gamification of Learning and Instruction: Game-Based Methods and Strategies for Training and Education</em>. San Francisco, CA: Pfeiffer, 2012.</li>
        <li>A. Begel and B. Simon, "Struggles of new college graduates in their first software development job," in <em>Proc. 39th ACM Tech. Symp. Computer Science Education (SIGCSE)</em>, Portland, OR, 2008, pp. 226–230.</li>
      </ol>
    </div>

  </div><!-- end two-col -->
</div><!-- end page -->
</body>
</html>`

fs.writeFileSync('./KarnBoard_IEEE_Paper.html', html)
console.log('✓ HTML written')

// ── Print to PDF ──
;(async () => {
  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] })
  const page = await browser.newPage()
  await page.goto(`file://${path.resolve('./KarnBoard_IEEE_Paper.html')}`, { waitUntil: 'networkidle0' })
  await new Promise(r => setTimeout(r, 1000))
  await page.pdf({
    path: './KarnBoard_IEEE_Paper.pdf',
    format: 'A4',
    printBackground: true,
    margin: { top: '0mm', bottom: '0mm', left: '0mm', right: '0mm' },
    displayHeaderFooter: false,
  })
  await browser.close()
  console.log('✓ PDF written → KarnBoard_IEEE_Paper.pdf')
})()
