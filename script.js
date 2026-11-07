/**
 * ReflexRush — Reaction Speed Challenge
 * High-precision vanilla JavaScript reaction engine, statistics tracker,
 * audio synthesizer, canvas card generator, and viral challenge system.
 */

(function () {
  'use strict';

  // ---------------------------------------------------------------------------
  // 1. Constants & Configuration
  // ---------------------------------------------------------------------------
  const STORAGE_KEY = 'reflexrush_user_stats_v1';
  const SOUND_KEY = 'reflexrush_sound_enabled';

  const GAME_MODES = {
    classic: { name: 'Classic', rounds: 5, minDelay: 1500, maxDelay: 5000 },
    sprint: { name: 'Sprint', rounds: 10, minDelay: 1200, maxDelay: 3500 },
    zen: { name: 'Zen', rounds: 5, minDelay: 1500, maxDelay: 4500 },
    practice: { name: 'Practice', rounds: Infinity, minDelay: 1500, maxDelay: 4000 }
  };

  const RATING_TIERS = [
    { max: 180, label: 'Godlike Reflexes ⚡', badge: 'Tier 1 • Godlike', msg: 'Phenomenal neural response! Top 0.1% speed.' },
    { max: 215, label: 'Formula 1 Driver 🏎️', badge: 'Tier 2 • F1 Driver', msg: 'Lightning fast! Comparable to elite racers.' },
    { max: 250, label: 'Esports Pro 🎮', badge: 'Tier 3 • Esports Pro', msg: 'Top-tier reflexes! CS2 / Valorant tournament ready.' },
    { max: 290, label: 'Above Average 🎯', badge: 'Tier 4 • Above Avg', msg: 'Great reaction time! Well ahead of the curve.' },
    { max: 340, label: 'Standard Human ⏱️', badge: 'Tier 5 • Standard', msg: 'Solid performance! Right in the healthy average.' },
    { max: Infinity, label: 'Warming Up ☕', badge: 'Tier 6 • Warming Up', msg: 'Keep practicing! Hardware or fatigue can slow you down.' }
  ];

  // ---------------------------------------------------------------------------
  // 2. Application State
  // ---------------------------------------------------------------------------
  let state = {
    mode: 'classic',
    gameState: 'idle', // 'idle' | 'waiting' | 'ready' | 'result' | 'false-start' | 'finished'
    currentRound: 0,
    roundTimes: [],
    falseStartsCount: 0,
    signalStartTime: 0,
    timerId: null,
    isInputLocked: false,
    soundEnabled: true,
    lastSessionAvg: null,
    challengeData: null // { score: number, sender: string } if URL param present
  };

  // Local Storage Data Model
  let statsData = {
    version: 1,
    pbAvg: null,
    pbSingle: null,
    totalSessions: 0,
    totalValidClicks: 0,
    careerSum: 0,
    careerCount: 0,
    history: [] // { id, date, mode, avg, best, rating }
  };

  // ---------------------------------------------------------------------------
  // 3. DOM Elements Cache
  // ---------------------------------------------------------------------------
  const dom = {
    // Nav & Sound
    soundToggleBtn: document.getElementById('sound-toggle-btn'),
    soundIconOn: document.getElementById('sound-icon-on'),
    soundIconOff: document.getElementById('sound-icon-off'),
    mobileMenuBtn: document.getElementById('mobile-menu-btn'),
    mobileDrawer: document.getElementById('mobile-drawer'),

    // Hero Widget
    heroDemoTimer: document.getElementById('hero-demo-timer'),

    // Challenge Banner
    challengeBannerContainer: document.getElementById('challenge-banner-container'),
    challengerName: document.getElementById('challenger-name'),
    challengerScore: document.getElementById('challenger-score'),
    dismissChallengeBtn: document.getElementById('dismiss-challenge-btn'),

    // Game Mode Tabs & HUD
    modeTabs: document.querySelectorAll('.mode-tab'),
    hudCurrentMode: document.getElementById('hud-current-mode'),
    hudRoundText: document.getElementById('hud-round-text'),
    roundDotsContainer: document.getElementById('round-dots-container'),
    restartSessionBtn: document.getElementById('restart-session-btn'),

    // Game Arena Panel
    reactionPanel: document.getElementById('reaction-panel'),
    panelIconWrap: document.getElementById('panel-icon-wrap'),
    panelHeadline: document.getElementById('panel-headline'),
    panelPrompt: document.getElementById('panel-prompt'),
    panelTimeDisplay: document.getElementById('panel-time-display'),
    measuredTimeVal: document.getElementById('measured-time-val'),
    panelFeedbackBadge: document.getElementById('panel-feedback-badge'),
    panelActionFooter: document.getElementById('panel-action-footer'),
    panelActionBtn: document.getElementById('panel-action-btn'),

    // Results Screen Modal
    resultsModal: document.getElementById('results-modal'),
    resultsRankBadge: document.getElementById('results-rank-badge'),
    finalAvgTime: document.getElementById('final-avg-time'),
    finalRatingText: document.getElementById('final-rating-text'),
    finalFastestTime: document.getElementById('final-fastest-time'),
    finalSlowestTime: document.getElementById('final-slowest-time'),
    finalMedianTime: document.getElementById('final-median-time'),
    finalFalseStarts: document.getElementById('final-false-starts'),
    finalPbAvg: document.getElementById('final-pb-avg'),
    finalImprovement: document.getElementById('final-improvement'),
    roundsBreakdownList: document.getElementById('rounds-breakdown-list'),

    // VS Challenge in Results
    challengeVsBanner: document.getElementById('challenge-vs-banner'),
    vsUserScore: document.getElementById('vs-user-score'),
    vsTargetScore: document.getElementById('vs-target-score'),
    vsOutcomeBadge: document.getElementById('vs-outcome-badge'),
    vsChallengerLabel: document.getElementById('vs-challenger-label'),

    // Sharing Actions
    btnShareResults: document.getElementById('btn-share-results'),
    btnCopyChallenge: document.getElementById('btn-copy-challenge'),
    btnDownloadImage: document.getElementById('btn-download-image'),
    btnPlayAgain: document.getElementById('btn-play-again'),
    shareCanvas: document.getElementById('share-card-canvas'),

    // Statistics Dashboard
    dashboardPbSingle: document.getElementById('dashboard-pb-single'),
    dashboardPbAvg: document.getElementById('dashboard-pb-avg'),
    dashboardCareerAvg: document.getElementById('dashboard-career-avg'),
    dashboardGamesPlayed: document.getElementById('dashboard-games-played'),
    dashboardClicksCount: document.getElementById('dashboard-clicks-count'),
    trendChartSvg: document.getElementById('trend-chart-svg'),
    chartEmptyState: document.getElementById('chart-empty-state'),
    historyTableBody: document.getElementById('history-table-body'),
    btnResetStats: document.getElementById('btn-reset-stats'),

    // Leaderboard
    localLeaderboardList: document.getElementById('local-leaderboard-list'),

    // Modals
    modalReset: document.getElementById('modal-reset'),
    modalCancelReset: document.getElementById('modal-cancel-reset'),
    modalConfirmReset: document.getElementById('modal-confirm-reset'),
    modalPrivacy: document.getElementById('modal-privacy'),
    modalPrivacyClose: document.getElementById('modal-privacy-close'),
    modalLatency: document.getElementById('modal-latency'),
    modalLatencyClose: document.getElementById('modal-latency-close'),
    btnOpenLatencyModal: document.getElementById('btn-open-latency-modal'),
    footerBtnLatency: document.getElementById('footer-btn-latency'),
    footerBtnPrivacy: document.getElementById('footer-btn-privacy'),
    footerBtnTerms: document.getElementById('footer-btn-terms'),
    footerBtnContact: document.getElementById('footer-btn-contact'),

    // FAQ Accordion
    faqAccordion: document.getElementById('faq-accordion'),

    // Toast Container
    toastContainer: document.getElementById('toast-container'),
    copyrightYear: document.getElementById('copyright-year')
  };

  // ---------------------------------------------------------------------------
  // 4. Web Audio API Synthesizer (Zero External Dependencies)
  // ---------------------------------------------------------------------------
  let audioCtx = null;

  function initAudio() {
    if (!audioCtx) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (AudioContextClass) {
        audioCtx = new AudioContextClass();
      }
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
  }

  function playTone(freq, type = 'sine', duration = 0.1, gainVal = 0.15) {
    if (!state.soundEnabled) return;
    try {
      initAudio();
      if (!audioCtx) return;

      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, audioCtx.currentTime);

      gain.gain.setValueAtTime(gainVal, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);

      osc.connect(gain);
      gain.connect(audioCtx.destination);

      osc.start();
      osc.stop(audioCtx.currentTime + duration);
    } catch (e) {
      // Audio autoplay policy fallback
    }
  }

  const sfx = {
    start: () => playTone(520, 'sine', 0.12, 0.2),
    readySignal: () => playTone(880, 'triangle', 0.15, 0.3),
    falseStart: () => {
      playTone(160, 'sawtooth', 0.25, 0.25);
      setTimeout(() => playTone(120, 'sawtooth', 0.25, 0.25), 100);
    },
    click: () => playTone(440, 'sine', 0.08, 0.15),
    finish: () => {
      const chords = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
      chords.forEach((note, idx) => {
        setTimeout(() => playTone(note, 'triangle', 0.2, 0.25), idx * 90);
      });
    }
  };

  // ---------------------------------------------------------------------------
  // 5. Safe LocalStorage Management
  // ---------------------------------------------------------------------------
  function loadStoredData() {
    // Sound preference
    const storedSound = localStorage.getItem(SOUND_KEY);
    if (storedSound !== null) {
      state.soundEnabled = storedSound === 'true';
    }
    updateSoundUI();

    // Stats data
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed === 'object') {
          statsData = {
            ...statsData,
            ...parsed,
            history: Array.isArray(parsed.history) ? parsed.history : []
          };
        }
      }
    } catch (err) {
      console.warn('Could not parse local storage data, using defaults:', err);
    }

    renderDashboard();
    renderLocalLeaderboard();
  }

  function saveStoredData() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(statsData));
    } catch (err) {
      console.warn('LocalStorage save failed:', err);
    }
  }

  function updateSoundUI() {
    if (state.soundEnabled) {
      dom.soundIconOn.classList.remove('hidden');
      dom.soundIconOff.classList.add('hidden');
      dom.soundToggleBtn.setAttribute('title', 'Mute Sound (Enabled)');
      dom.soundToggleBtn.setAttribute('aria-label', 'Mute Sound');
    } else {
      dom.soundIconOn.classList.add('hidden');
      dom.soundIconOff.classList.remove('hidden');
      dom.soundToggleBtn.setAttribute('title', 'Enable Sound (Muted)');
      dom.soundToggleBtn.setAttribute('aria-label', 'Enable Sound');
    }
  }

  // ---------------------------------------------------------------------------
  // 6. Challenge Link Decoder & Setup
  // ---------------------------------------------------------------------------
  function checkUrlChallenge() {
    try {
      const params = new URLSearchParams(window.location.search);
      const challengeScore = parseInt(params.get('challenge') || params.get('score'), 10);
      const sender = params.get('by') || 'A Friend';

      if (!isNaN(challengeScore) && challengeScore > 50 && challengeScore < 2000) {
        state.challengeData = {
          score: challengeScore,
          sender: sender.replace(/[<>'"]/g, '').substring(0, 20) // sanitize
        };

        dom.challengerName.textContent = state.challengeData.sender;
        dom.challengerScore.textContent = `${state.challengeData.score} ms`;
        dom.challengeBannerContainer.classList.remove('hidden');
      }
    } catch (e) {
      console.warn('Error reading challenge URL:', e);
    }
  }

  // ---------------------------------------------------------------------------
  // 7. Core Reaction Game Engine
  // ---------------------------------------------------------------------------
  function setGameState(newState) {
    state.gameState = newState;
    dom.reactionPanel.className = `reaction-panel state-${newState}`;

    // Reset visibility of dynamic parts
    dom.panelTimeDisplay.classList.add('hidden');
    dom.panelFeedbackBadge.classList.add('hidden');
    dom.panelActionFooter.classList.add('hidden');

    switch (newState) {
      case 'idle':
        dom.panelHeadline.textContent = 'Start Reaction Test';
        dom.panelPrompt.innerHTML = 'Click anywhere or press <strong>Spacebar</strong> to begin.';
        dom.panelActionFooter.classList.remove('hidden');
        dom.panelActionBtn.textContent = 'Start Test';
        break;

      case 'waiting':
        dom.panelHeadline.textContent = 'Wait for green...';
        dom.panelPrompt.textContent = 'Do not click yet!';
        sfx.start();
        break;

      case 'ready':
        dom.panelHeadline.textContent = 'CLICK NOW!';
        dom.panelPrompt.textContent = 'Tap or press Spacebar as fast as you can!';
        sfx.readySignal();
        break;

      case 'result':
        dom.panelHeadline.textContent = 'Reaction Time';
        dom.panelTimeDisplay.classList.remove('hidden');
        dom.panelFeedbackBadge.classList.remove('hidden');
        dom.panelPrompt.innerHTML = 'Click or press <strong>Spacebar</strong> to continue.';
        break;

      case 'false-start':
        dom.panelHeadline.textContent = 'Too early!';
        dom.panelPrompt.innerHTML = 'You clicked before the green signal. <strong>Click to retry this round.</strong>';
        dom.panelActionFooter.classList.remove('hidden');
        dom.panelActionBtn.textContent = 'Retry Round';
        sfx.falseStart();
        break;

      case 'finished':
        dom.panelHeadline.textContent = 'Challenge Complete!';
        dom.panelPrompt.textContent = 'Review your results below.';
        break;
    }
  }

  function startSession() {
    clearTimeout(state.timerId);
    state.currentRound = 0;
    state.roundTimes = [];
    state.falseStartsCount = 0;
    state.isInputLocked = false;

    dom.resultsModal.classList.add('hidden');
    updateHud();
    startRound();
  }

  function resetSession() {
    clearTimeout(state.timerId);
    state.currentRound = 0;
    state.roundTimes = [];
    state.falseStartsCount = 0;
    state.isInputLocked = false;

    updateHud();
    setGameState('idle');
  }

  function startRound() {
    const config = GAME_MODES[state.mode];
    state.currentRound++;
    state.isInputLocked = false;
    updateHud();

    setGameState('waiting');

    // Randomized delay
    const delay = Math.random() * (config.maxDelay - config.minDelay) + config.minDelay;

    state.timerId = setTimeout(() => {
      // Transition to READY (Green signal)
      setGameState('ready');
      // Accurate microsecond timestamp
      state.signalStartTime = performance.now();
    }, delay);
  }

  function handleInteraction(event) {
    // Prevent double invocation
    if (event.type === 'keydown') {
      if (event.code !== 'Space' && event.code !== 'Enter') return;
      event.preventDefault(); // prevent page scroll
    }

    if (state.isInputLocked) return;

    initAudio();

    switch (state.gameState) {
      case 'idle':
        startSession();
        break;

      case 'waiting':
        // False start clicked too early!
        clearTimeout(state.timerId);
        state.falseStartsCount++;
        setGameState('false-start');
        highlightRoundDot(state.currentRound, 'failed');
        break;

      case 'ready': {
        // Valid reaction!
        const reactionMs = Math.round(performance.now() - state.signalStartTime);
        state.isInputLocked = true; // Lock immediate duplicate clicks
        sfx.click();

        state.roundTimes.push(reactionMs);
        dom.measuredTimeVal.textContent = reactionMs;

        // Feedback badge
        const rating = getTier(reactionMs);
        dom.panelFeedbackBadge.textContent = rating.label;

        setGameState('result');
        highlightRoundDot(state.currentRound, 'completed');

        // Allow continuing on next tick
        setTimeout(() => {
          state.isInputLocked = false;
        }, 220);
        break;
      }

      case 'false-start':
        // Retry the current round
        state.currentRound--; // Step back to retry this round
        startRound();
        break;

      case 'result': {
        const config = GAME_MODES[state.mode];
        if (state.currentRound >= config.rounds) {
          finishSession();
        } else {
          startRound();
        }
        break;
      }

      case 'finished':
        startSession();
        break;
    }
  }

  function finishSession() {
    setGameState('finished');
    sfx.finish();

    // Calculations
    const times = [...state.roundTimes];
    const sum = times.reduce((a, b) => a + b, 0);
    const avg = Math.round(sum / times.length);
    const fastest = Math.min(...times);
    const slowest = Math.max(...times);

    // Median
    const sorted = [...times].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    const median = sorted.length % 2 !== 0 ? sorted[mid] : Math.round((sorted[mid - 1] + sorted[mid]) / 2);

    const overallRating = getTier(avg);

    // Improvement compared to previous session
    let improvementText = '--';
    if (state.lastSessionAvg !== null) {
      const diff = state.lastSessionAvg - avg;
      if (diff > 0) {
        improvementText = `+${diff} ms faster 🔥`;
      } else if (diff < 0) {
        improvementText = `${Math.abs(diff)} ms slower`;
      } else {
        improvementText = 'Identical speed';
      }
    }
    state.lastSessionAvg = avg;

    // Check personal bests
    const isNewPbAvg = statsData.pbAvg === null || avg < statsData.pbAvg;
    const isNewPbSingle = statsData.pbSingle === null || fastest < statsData.pbSingle;

    if (isNewPbAvg) statsData.pbAvg = avg;
    if (isNewPbSingle) statsData.pbSingle = fastest;

    statsData.totalSessions++;
    statsData.totalValidClicks += times.length;
    statsData.careerSum += sum;
    statsData.careerCount += times.length;

    // Record into history
    const sessionRecord = {
      id: Date.now(),
      date: new Date().toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
      mode: state.mode,
      avg: avg,
      best: fastest,
      rating: overallRating.label
    };
    statsData.history.unshift(sessionRecord);
    if (statsData.history.length > 20) statsData.history.pop();

    saveStoredData();

    // Update Results UI
    dom.finalAvgTime.textContent = avg;
    dom.resultsRankBadge.textContent = overallRating.badge;
    dom.finalRatingText.textContent = overallRating.msg;
    dom.finalFastestTime.textContent = `${fastest} ms`;
    dom.finalSlowestTime.textContent = `${slowest} ms`;
    dom.finalMedianTime.textContent = `${median} ms`;
    dom.finalFalseStarts.textContent = state.falseStartsCount;
    dom.finalPbAvg.textContent = `${statsData.pbAvg} ms`;
    dom.finalImprovement.textContent = improvementText;

    // Render Round Breakdown Chips
    dom.roundsBreakdownList.innerHTML = '';
    times.forEach((t, i) => {
      const chip = document.createElement('div');
      chip.className = 'round-chip';
      chip.innerHTML = `
        <span class="round-chip-num">Round ${i + 1}</span>
        <span class="round-chip-val">${t} ms</span>
      `;
      dom.roundsBreakdownList.appendChild(chip);
    });

    // Check Friend Challenge Outcome
    if (state.challengeData) {
      dom.challengeVsBanner.classList.remove('hidden');
      dom.vsUserScore.textContent = `${avg} ms`;
      dom.vsTargetScore.textContent = `${state.challengeData.score} ms`;
      dom.vsChallengerLabel.textContent = `${state.challengeData.sender}'s Score`;

      if (avg < state.challengeData.score) {
        const diff = state.challengeData.score - avg;
        dom.vsOutcomeBadge.className = 'vs-outcome-badge';
        dom.vsOutcomeBadge.textContent = `🎉 YOU WON BY ${diff} ms!`;
      } else if (avg > state.challengeData.score) {
        const diff = avg - state.challengeData.score;
        dom.vsOutcomeBadge.className = 'vs-outcome-badge loss';
        dom.vsOutcomeBadge.textContent = `💥 Defeat! Slower by ${diff} ms`;
      } else {
        dom.vsOutcomeBadge.className = 'vs-outcome-badge';
        dom.vsOutcomeBadge.textContent = '🤝 PERFECT TIE!';
      }
    } else {
      dom.challengeVsBanner.classList.add('hidden');
    }

    // Show Results Card
    dom.resultsModal.classList.remove('hidden');
    dom.resultsModal.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

    // Update Dashboard & Leaderboard
    renderDashboard();
    renderLocalLeaderboard();
  }

  function getTier(timeMs) {
    for (const tier of RATING_TIERS) {
      if (timeMs <= tier.max) return tier;
    }
    return RATING_TIERS[RATING_TIERS.length - 1];
  }

  // ---------------------------------------------------------------------------
  // 8. HUD & Round Indicator Management
  // ---------------------------------------------------------------------------
  function updateHud() {
    const config = GAME_MODES[state.mode];
    dom.hudCurrentMode.textContent = config.name;

    if (config.rounds === Infinity) {
      dom.hudRoundText.textContent = `${state.currentRound} / ∞`;
    } else {
      dom.hudRoundText.textContent = `${state.currentRound} / ${config.rounds}`;
    }

    // Rebuild round dots if needed
    if (dom.roundDotsContainer.children.length !== (config.rounds === Infinity ? 5 : config.rounds)) {
      dom.roundDotsContainer.innerHTML = '';
      const dotCount = config.rounds === Infinity ? 5 : config.rounds;
      for (let i = 1; i <= dotCount; i++) {
        const dot = document.createElement('span');
        dot.className = 'round-dot';
        dot.setAttribute('data-round', i);
        dom.roundDotsContainer.appendChild(dot);
      }
    }
  }

  function highlightRoundDot(roundNum, status) {
    const dot = dom.roundDotsContainer.querySelector(`.round-dot[data-round="${roundNum}"]`);
    if (dot) {
      dot.className = `round-dot ${status}`;
    }
  }

  // ---------------------------------------------------------------------------
  // 9. Dashboard & Chart Rendering
  // ---------------------------------------------------------------------------
  function renderDashboard() {
    dom.dashboardPbSingle.textContent = statsData.pbSingle ? `${statsData.pbSingle} ms` : '-- ms';
    dom.dashboardPbAvg.textContent = statsData.pbAvg ? `${statsData.pbAvg} ms` : '-- ms';

    if (statsData.careerCount > 0) {
      const careerAvg = Math.round(statsData.careerSum / statsData.careerCount);
      dom.dashboardCareerAvg.textContent = `${careerAvg} ms`;
    } else {
      dom.dashboardCareerAvg.textContent = '-- ms';
    }

    dom.dashboardGamesPlayed.textContent = statsData.totalSessions;
    dom.dashboardClicksCount.textContent = `${statsData.totalValidClicks} valid reactions`;

    // Render Recent Sessions Table
    if (statsData.history.length === 0) {
      dom.historyTableBody.innerHTML = `
        <tr class="empty-row">
          <td colspan="5">No completed sessions yet. Start playing above!</td>
        </tr>
      `;
    } else {
      dom.historyTableBody.innerHTML = statsData.history.map(s => `
        <tr>
          <td>${s.date}</td>
          <td><span class="kbd-pill">${s.mode}</span></td>
          <td><strong>${s.avg} ms</strong></td>
          <td>${s.best} ms</td>
          <td>${s.rating}</td>
        </tr>
      `).join('');
    }

    renderTrendChart();
  }

  function renderTrendChart() {
    const historyList = [...statsData.history].reverse(); // oldest to newest
    if (historyList.length < 2) {
      dom.chartEmptyState.classList.remove('hidden');
      dom.trendChartSvg.innerHTML = '';
      return;
    }

    dom.chartEmptyState.classList.add('hidden');

    const width = 600;
    const height = 240;
    const padding = 35;

    const avgs = historyList.map(h => h.avg);
    const minAvg = Math.max(100, Math.min(...avgs) - 20);
    const maxAvg = Math.max(...avgs) + 20;

    const getX = (idx) => padding + (idx / (historyList.length - 1)) * (width - padding * 2);
    // Lower ms is better (render near top)
    const getY = (val) => height - padding - ((maxAvg - val) / (maxAvg - minAvg)) * (height - padding * 2);

    // Build path coordinates
    const points = historyList.map((h, i) => ({ x: getX(i), y: getY(h.avg), avg: h.avg, date: h.date }));
    const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ');

    // Area fill path
    const areaD = `${pathD} L ${points[points.length - 1].x} ${height - padding} L ${points[0].x} ${height - padding} Z`;

    let svgHtml = `
      <defs>
        <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#20D9E8" stop-opacity="0.35"/>
          <stop offset="100%" stop-color="#7C5CFC" stop-opacity="0.0"/>
        </linearGradient>
      </defs>
      <!-- Grid lines -->
      <line x1="${padding}" y1="${padding}" x2="${width - padding}" y2="${padding}" stroke="rgba(255,255,255,0.08)" stroke-dasharray="3 3"/>
      <line x1="${padding}" y1="${height / 2}" x2="${width - padding}" y2="${height / 2}" stroke="rgba(255,255,255,0.08)" stroke-dasharray="3 3"/>
      <line x1="${padding}" y1="${height - padding}" x2="${width - padding}" y2="${height - padding}" stroke="rgba(255,255,255,0.12)"/>
      
      <!-- Area Fill -->
      <path d="${areaD}" fill="url(#chartGrad)"/>
      
      <!-- Line Stroke -->
      <path d="${pathD}" fill="none" stroke="#20D9E8" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
    `;

    // Data points & tooltips
    points.forEach((p) => {
      svgHtml += `
        <circle cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="5" fill="#7C5CFC" stroke="#FFFFFF" stroke-width="2">
          <title>${p.date}: ${p.avg} ms</title>
        </circle>
        <text x="${p.x.toFixed(1)}" y="${(p.y - 10).toFixed(1)}" fill="#F8FAFC" font-size="11" font-weight="700" text-anchor="middle">
          ${p.avg}ms
        </text>
      `;
    });

    dom.trendChartSvg.innerHTML = svgHtml;
  }

  function renderLocalLeaderboard() {
    const list = [...statsData.history]
      .filter(h => h.mode === 'classic')
      .sort((a, b) => a.avg - b.avg)
      .slice(0, 5);

    if (list.length === 0) {
      dom.localLeaderboardList.innerHTML = `
        <div class="empty-local-ranks">
          <p>Complete Classic 5-round tests to record your local best runs here!</p>
        </div>
      `;
      return;
    }

    dom.localLeaderboardList.innerHTML = list.map((item, idx) => `
      <div class="benchmark-item">
        <div class="tier-rank">#${idx + 1}</div>
        <div class="tier-details">
          <span class="tier-name">${item.rating}</span>
          <span class="tier-desc">Recorded ${item.date}</span>
        </div>
        <div class="tier-time">${item.avg} ms</div>
      </div>
    `).join('');
  }

  // ---------------------------------------------------------------------------
  // 10. Viral Sharing & Canvas Image Generator
  // ---------------------------------------------------------------------------
  function getChallengeUrl(score) {
    const url = new URL(window.location.origin + window.location.pathname);
    url.searchParams.set('challenge', score);
    url.searchParams.set('by', 'Player');
    return url.toString();
  }

  function showToast(message) {
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `
      <span>⚡</span>
      <span>${message}</span>
    `;
    dom.toastContainer.appendChild(toast);
    setTimeout(() => {
      if (toast.parentNode) {
        toast.parentNode.removeChild(toast);
      }
    }, 3200);
  }

  async function shareResults() {
    const avg = dom.finalAvgTime.textContent;
    const fastest = dom.finalFastestTime.textContent;
    const challengeUrl = getChallengeUrl(avg);

    const shareText = `⚡ I scored an average reaction time of ${avg} ms (Fastest: ${fastest}) on ReflexRush! Think you can beat me? Prove it: ${challengeUrl}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'ReflexRush Reaction Speed Challenge',
          text: shareText,
          url: challengeUrl
        });
        showToast('Shared successfully!');
      } catch (err) {
        if (err.name !== 'AbortError') {
          copyToClipboard(shareText, 'Results copied to clipboard! 📋');
        }
      }
    } else {
      copyToClipboard(shareText, 'Results copied to clipboard! 📋');
    }
  }

  function copyChallengeLink() {
    const avg = dom.finalAvgTime.textContent;
    const challengeUrl = getChallengeUrl(avg);
    copyToClipboard(challengeUrl, 'Challenge link copied to clipboard! 🚀 Send it to friends!');
  }

  function copyToClipboard(text, successMsg) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(() => {
        showToast(successMsg);
      }).catch(() => {
        fallbackCopy(text, successMsg);
      });
    } else {
      fallbackCopy(text, successMsg);
    }
  }

  function fallbackCopy(text, successMsg) {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.opacity = '0';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    try {
      document.execCommand('copy');
      showToast(successMsg);
    } catch (err) {
      showToast('Could not auto-copy. Please copy manually.');
    }
    document.body.removeChild(textArea);
  }

  /**
   * Generates a 1200x630 pixel viral social preview card onto an HTML5 canvas
   * and triggers an instant PNG download.
   */
  function downloadCardImage() {
    const canvas = dom.shareCanvas;
    const ctx = canvas.getContext('2d');
    const width = 1200;
    const height = 630;

    const avg = dom.finalAvgTime.textContent;
    const fastest = dom.finalFastestTime.textContent;
    const tier = getTier(parseInt(avg, 10));

    // 1. Dark Gradient Background
    const bgGrad = ctx.createLinearGradient(0, 0, width, height);
    bgGrad.addColorStop(0, '#0F172A');
    bgGrad.addColorStop(0.5, '#080B16');
    bgGrad.addColorStop(1, '#1A1435');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, width, height);

    // 2. Radial Glow Accents
    const radialGlow = ctx.createRadialGradient(width * 0.5, height * 0.45, 20, width * 0.5, height * 0.45, 450);
    radialGlow.addColorStop(0, 'rgba(124, 92, 252, 0.28)');
    radialGlow.addColorStop(0.6, 'rgba(32, 217, 232, 0.12)');
    radialGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = radialGlow;
    ctx.fillRect(0, 0, width, height);

    // 3. Border Stroke
    ctx.strokeStyle = 'rgba(124, 92, 252, 0.4)';
    ctx.lineWidth = 4;
    ctx.strokeRect(20, 20, width - 40, height - 40);

    // 4. Logo & Branding
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '800 36px Inter, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('⚡ ReflexRush', 60, 85);

    ctx.fillStyle = '#94A3B8';
    ctx.font = '500 20px Inter, sans-serif';
    ctx.fillText('Reaction Speed Challenge • reflexrush.app', 60, 118);

    // 5. Tier Badge Pill
    ctx.fillStyle = 'rgba(124, 92, 252, 0.25)';
    ctx.strokeStyle = '#7C5CFC';
    ctx.lineWidth = 2;
    const pillX = 60;
    const pillY = 160;
    const pillW = 340;
    const pillH = 48;
    ctx.beginPath();
    ctx.roundRect(pillX, pillY, pillW, pillH, 24);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#20D9E8';
    ctx.font = '700 22px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(tier.label, pillX + pillW / 2, pillY + 32);

    // 6. Huge Average Reaction Time Display
    ctx.textAlign = 'left';
    ctx.fillStyle = '#94A3B8';
    ctx.font = '600 22px Inter, sans-serif';
    ctx.fillText('AVERAGE REACTION SPEED', 60, 260);

    ctx.fillStyle = '#FFFFFF';
    ctx.font = '900 120px Inter, sans-serif';
    ctx.fillText(`${avg} `, 60, 380);

    const numWidth = ctx.measureText(`${avg} `).width;
    ctx.fillStyle = '#20D9E8';
    ctx.font = '700 48px Inter, sans-serif';
    ctx.fillText('ms', 60 + numWidth, 360);

    // 7. Secondary Stats
    ctx.fillStyle = '#94A3B8';
    ctx.font = '500 22px Inter, sans-serif';
    ctx.fillText(`⚡ Fastest Single: ${fastest}   •   ⚠️ False Starts: ${state.falseStartsCount}`, 60, 435);

    // 8. Round Breakdown Pills
    ctx.font = '600 18px Inter, sans-serif';
    state.roundTimes.slice(0, 5).forEach((time, index) => {
      const rx = 60 + index * 115;
      const ry = 480;
      ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.roundRect(rx, ry, 100, 46, 8);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#F8FAFC';
      ctx.textAlign = 'center';
      ctx.fillText(`R${index + 1}: ${time}`, rx + 50, ry + 29);
    });

    // 9. Challenge Call to Action Banner (Right side / Footer)
    ctx.fillStyle = '#20D9E8';
    ctx.font = '800 28px Inter, sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText("Think you're faster?", width - 60, 545);

    ctx.fillStyle = '#94A3B8';
    ctx.font = '500 20px Inter, sans-serif';
    ctx.fillText('Take the challenge at reflexrush.app', width - 60, 580);

    // Export Canvas to PNG
    const link = document.createElement('a');
    link.download = `reflexrush-score-${avg}ms.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();

    showToast('Scorecard image downloaded! 📸');
  }

  // ---------------------------------------------------------------------------
  // 11. Event Listeners & Interactive Handlers
  // ---------------------------------------------------------------------------
  function attachEventListeners() {
    // Reaction Panel Inputs
    dom.reactionPanel.addEventListener('pointerdown', (e) => {
      // Ignore clicks on internal action button to avoid double triggering
      if (e.target.closest('#panel-action-btn')) return;
      handleInteraction(e);
    });

    dom.panelActionBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      handleInteraction(e);
    });

    // Keyboard Space / Enter support
    window.addEventListener('keydown', (e) => {
      if (e.code === 'Space' || e.code === 'Enter') {
        // Do not trigger if user is interacting with modal inputs
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
        handleInteraction(e);
      }
    });

    // Game Mode Tabs
    dom.modeTabs.forEach(tab => {
      tab.addEventListener('click', () => {
        dom.modeTabs.forEach(t => {
          t.classList.remove('active');
          t.setAttribute('aria-selected', 'false');
        });
        tab.classList.add('active');
        tab.setAttribute('aria-selected', 'true');

        state.mode = tab.dataset.mode;
        resetSession();
      });
    });

    // Restart Session Button
    dom.restartSessionBtn.addEventListener('click', resetSession);

    // Results Actions
    dom.btnShareResults.addEventListener('click', shareResults);
    dom.btnCopyChallenge.addEventListener('click', copyChallengeLink);
    dom.btnDownloadImage.addEventListener('click', downloadCardImage);
    dom.btnPlayAgain.addEventListener('click', () => {
      dom.resultsModal.classList.add('hidden');
      startSession();
    });

    // Challenge Banner Dismiss
    dom.dismissChallengeBtn.addEventListener('click', () => {
      dom.challengeBannerContainer.classList.add('hidden');
    });

    // Sound Toggle
    dom.soundToggleBtn.addEventListener('click', () => {
      state.soundEnabled = !state.soundEnabled;
      localStorage.setItem(SOUND_KEY, state.soundEnabled ? 'true' : 'false');
      updateSoundUI();
      if (state.soundEnabled) sfx.click();
    });

    // Mobile Menu Toggle
    dom.mobileMenuBtn.addEventListener('click', () => {
      const isOpen = dom.mobileDrawer.classList.toggle('open');
      dom.mobileMenuBtn.setAttribute('aria-expanded', isOpen);
    });

    // Close mobile menu when a mobile nav link is clicked
    document.querySelectorAll('.mobile-nav-link').forEach(link => {
      link.addEventListener('click', () => {
        dom.mobileDrawer.classList.remove('open');
        dom.mobileMenuBtn.setAttribute('aria-expanded', 'false');
      });
    });

    // Reset Stats Modal
    dom.btnResetStats.addEventListener('click', () => {
      dom.modalReset.classList.remove('hidden');
    });

    dom.modalCancelReset.addEventListener('click', () => {
      dom.modalReset.classList.add('hidden');
    });

    dom.modalConfirmReset.addEventListener('click', () => {
      statsData = {
        version: 1,
        pbAvg: null,
        pbSingle: null,
        totalSessions: 0,
        totalValidClicks: 0,
        careerSum: 0,
        careerCount: 0,
        history: []
      };
      saveStoredData();
      renderDashboard();
      renderLocalLeaderboard();
      dom.modalReset.classList.add('hidden');
      showToast('All statistics have been reset.');
    });

    // Privacy & Legal Modals
    const openPrivacy = () => dom.modalPrivacy.classList.remove('hidden');
    const closePrivacy = () => dom.modalPrivacy.classList.add('hidden');
    dom.footerBtnPrivacy.addEventListener('click', openPrivacy);
    dom.footerBtnTerms.addEventListener('click', openPrivacy);
    dom.modalPrivacyClose.addEventListener('click', closePrivacy);

    // Latency Guide Modals
    const openLatency = () => dom.modalLatency.classList.remove('hidden');
    const closeLatency = () => dom.modalLatency.classList.add('hidden');
    dom.btnOpenLatencyModal.addEventListener('click', openLatency);
    dom.footerBtnLatency.addEventListener('click', openLatency);
    dom.modalLatencyClose.addEventListener('click', closeLatency);

    // Close modals on clicking backdrop
    window.addEventListener('click', (e) => {
      if (e.target.classList.contains('modal-backdrop')) {
        e.target.classList.add('hidden');
      }
    });

    // Close modals on Escape key
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        document.querySelectorAll('.modal-backdrop').forEach(m => m.classList.add('hidden'));
      }
    });

    // Contact button feedback
    dom.footerBtnContact.addEventListener('click', () => {
      showToast('Inquiries: support@reflexrush.app');
    });

    // FAQ Accordion
    if (dom.faqAccordion) {
      dom.faqAccordion.querySelectorAll('.accordion-header').forEach(header => {
        header.addEventListener('click', () => {
          const item = header.parentElement;
          const body = item.querySelector('.accordion-body');
          const isExpanded = header.getAttribute('aria-expanded') === 'true';

          header.setAttribute('aria-expanded', !isExpanded);
          if (isExpanded) {
            body.hidden = true;
            item.classList.remove('active');
          } else {
            body.hidden = false;
            item.classList.add('active');
          }
        });
      });
    }

    // Safety: Reset pending timer if user switches tab to avoid unfair false starts
    document.addEventListener('visibilitychange', () => {
      if (document.hidden && state.gameState === 'waiting') {
        clearTimeout(state.timerId);
        setGameState('idle');
      }
    });

    // Hero subtle radar interactive speed demo
    let heroTimerVal = 215;
    setInterval(() => {
      heroTimerVal = Math.floor(Math.random() * (235 - 198 + 1)) + 198;
      if (dom.heroDemoTimer) {
        dom.heroDemoTimer.textContent = `${heroTimerVal} ms`;
      }
    }, 2800);

    // Set Copyright Year
    if (dom.copyrightYear) {
      dom.copyrightYear.textContent = new Date().getFullYear();
    }
  }

  // ---------------------------------------------------------------------------
  // 12. Initialization
  // ---------------------------------------------------------------------------
  function init() {
    loadStoredData();
    checkUrlChallenge();
    updateHud();
    setGameState('idle');
    attachEventListeners();
  }

  // Run on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
