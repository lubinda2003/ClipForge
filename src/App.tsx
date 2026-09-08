/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Header } from './components/Header.tsx';
import { StageProgress, StageInfo } from './components/StageProgress.tsx';
import { TimelineVisualizer } from './components/TimelineVisualizer.tsx';
import { AudioCatalogBrowser } from './components/AudioCatalogModal.tsx';
import { ArtifactViewer } from './components/ArtifactViewer.tsx';
import { TimelineArtifact } from './contracts/timeline.ts';
import { SelectedAudioAsset } from './contracts/assets.ts';

const SAMPLE_TIMELINE: TimelineArtifact = {
  jobId: 'job_fusion_demo_01',
  createdAt: new Date().toISOString(),
  format: 'short',
  aspectRatio: '9:16',
  totalDurationSeconds: 16.2,
  tracks: {
    video: [
      { elementId: 'v_01', sceneId: 'sc_01', sourceFilePath: 'stock_cache/pexels_fusion_core.mp4', sourceTrimStartSeconds: 1.0, startTimelineSeconds: 0, durationSeconds: 5.2, cropOrScale: { scaleMode: 'smart_center_crop', aspectRatio: '9:16' }, motionEffect: 'ken_burns_zoom_in' },
      { elementId: 'v_02', sceneId: 'sc_02', sourceFilePath: 'stock_cache/pexels_plasma_lasers.mp4', sourceTrimStartSeconds: 0.5, startTimelineSeconds: 5.2, durationSeconds: 5.4, cropOrScale: { scaleMode: 'smart_center_crop', aspectRatio: '9:16' }, motionEffect: 'slow_pan_left' },
      { elementId: 'v_03', sceneId: 'sc_03', sourceFilePath: 'stock_cache/pexels_future_city.mp4', sourceTrimStartSeconds: 2.0, startTimelineSeconds: 10.6, durationSeconds: 5.6, cropOrScale: { scaleMode: 'smart_center_crop', aspectRatio: '9:16' }, motionEffect: 'ken_burns_zoom_out' },
    ],
    narration: [
      { elementId: 'n_01', segmentId: 'seg_01', audioFilePath: 'audio/seg_01.wav', startTimelineSeconds: 0, durationSeconds: 5.2, volume: 1.0 },
      { elementId: 'n_02', segmentId: 'seg_02', audioFilePath: 'audio/seg_02.wav', startTimelineSeconds: 5.2, durationSeconds: 5.4, volume: 1.0 },
      { elementId: 'n_03', segmentId: 'seg_03', audioFilePath: 'audio/seg_03.wav', startTimelineSeconds: 10.6, durationSeconds: 5.6, volume: 1.0 },
    ],
    music: [
      { elementId: 'm_01', type: 'music', audioFilePath: 'assets/music/cinematic_pulse.mp3', startTimelineSeconds: 0, durationSeconds: 16.2, volume: 0.2, loop: true, duckingEnvelope: [
        { timestampSeconds: 0, volumeMultiplier: 0.8 }, { timestampSeconds: 0.4, volumeMultiplier: 0.15 }, { timestampSeconds: 5.0, volumeMultiplier: 0.15 }, { timestampSeconds: 5.2, volumeMultiplier: 0.35 }, { timestampSeconds: 5.5, volumeMultiplier: 0.15 }, { timestampSeconds: 10.4, volumeMultiplier: 0.15 }, { timestampSeconds: 10.6, volumeMultiplier: 0.35 }, { timestampSeconds: 11.0, volumeMultiplier: 0.15 }, { timestampSeconds: 15.8, volumeMultiplier: 0.4 }, { timestampSeconds: 16.2, volumeMultiplier: 0.8 },
      ] },
    ],
    sfx: [
      { elementId: 'sfx_01', type: 'sfx', audioFilePath: 'assets/sfx/whoosh_heavy.wav', startTimelineSeconds: 0.1, durationSeconds: 0.8, volume: 0.5 },
      { elementId: 'sfx_02', type: 'sfx', audioFilePath: 'assets/sfx/impact_deep.wav', startTimelineSeconds: 5.2, durationSeconds: 1.2, volume: 0.6 },
      { elementId: 'sfx_03', type: 'sfx', audioFilePath: 'assets/sfx/riser_tension.wav', startTimelineSeconds: 9.8, durationSeconds: 1.0, volume: 0.45 },
    ],
    textOverlays: [
      { elementId: 'txt_01', primaryText: 'Did scientists just unlock infinite power?', startTimelineSeconds: 0.2, durationSeconds: 4.8, positioning: { horizontalAlign: 'center', verticalAlign: 'center', safeZoneMargins: { topPercent: 15, bottomPercent: 20, leftPercent: 8, rightPercent: 18 } }, styleVariant: 'hero_hook' },
      { elementId: 'txt_02', primaryText: 'Net energy gain in a magnetic tokamak reactor.', startTimelineSeconds: 5.3, durationSeconds: 5.0, positioning: { horizontalAlign: 'center', verticalAlign: 'center', safeZoneMargins: { topPercent: 15, bottomPercent: 20, leftPercent: 8, rightPercent: 18 } }, styleVariant: 'bold_caption' },
      { elementId: 'txt_03', primaryText: 'The fossil fuel era just met its endgame.', startTimelineSeconds: 10.8, durationSeconds: 5.2, positioning: { horizontalAlign: 'center', verticalAlign: 'bottom', safeZoneMargins: { topPercent: 15, bottomPercent: 20, leftPercent: 8, rightPercent: 18 } }, styleVariant: 'statistic_card' },
    ],
  },
  safeZone: { topPercent: 15, bottomPercent: 20, leftPercent: 8, rightPercent: 18 },
  retentionAnnotations: [
    { timestampSeconds: 0, event: 'hook', description: 'Opening curiosity gap' },
    { timestampSeconds: 5.2, event: 'pattern_interrupt', description: 'Impact sound & fast cut' },
    { timestampSeconds: 10.6, event: 'payoff', description: 'High-energy payoff resolution' },
  ],
};

const SAMPLE_MUSIC: SelectedAudioAsset = {
  purpose: 'background_music',
  asset: {
    assetId: 'mus_cinematic_pulse', type: 'music', title: 'Cinematic Pulse', category: 'cinematic', filename: 'cinematic_pulse.mp3', mood: 'tense', energyLevel: 'high', bpm: 124, tags: ['pulse', 'synth', 'thriller', 'documentary'], durationSeconds: 90, license: 'CC0', source: 'Curated R2 Catalog', commercialUsePermitted: true, attributionRequired: false, r2Path: 'assets/music/cinematic/cinematic_pulse.mp3', checksumSha256: 'mock_sha256_hash_cinematic_pulse',
  },
  localPath: 'assets/music/cinematic_pulse.mp3', targetTimestampSeconds: 0, targetDurationSeconds: 16.2, volumeLevel: 0.2, loopCount: 1,
};

const INITIAL_STAGES: StageInfo[] = [
  { id: 'research', name: 'Research', description: 'Grounding & verified facts', status: 'completed', executionTimeMs: 1420, artifactKey: 'research.json' },
  { id: 'strategy', name: 'Strategy', description: 'Audience & retention curve', status: 'completed', executionTimeMs: 650, artifactKey: 'strategy.json' },
  { id: 'script', name: 'Scripting', description: 'Hook, body beats, & CTA', status: 'completed', executionTimeMs: 820, artifactKey: 'script.json' },
  { id: 'narration', name: 'Narration', description: 'Voiceover & word timings', status: 'completed', executionTimeMs: 1150, artifactKey: 'narration.json' },
  { id: 'scenes', name: 'Scene Plan', description: 'B-roll prompt requirements', status: 'completed', executionTimeMs: 540, artifactKey: 'scenes.json' },
  { id: 'broll', name: 'Stock Media', description: 'Candidate ranking & crops', status: 'completed', executionTimeMs: 1980, artifactKey: 'broll.json' },
  { id: 'timeline', name: 'Timeline', description: 'Multi-track composition', status: 'completed', executionTimeMs: 380, artifactKey: 'timeline.json' },
  { id: 'render', name: 'Render & Validation', description: 'FFmpeg encode & FFprobe audit', status: 'completed', executionTimeMs: 3250, artifactKey: 'render.json' },
];

const SAMPLE_RENDER_ARTIFACT = {
  jobId: 'job_fusion_demo_01', createdAt: '2026-09-08T08:30:00.000Z', timelineInput: '.cache/clipforge/outputs/jobs/job_fusion_demo_01/timeline.json',
  renderProfile: { name: 'short_vertical_1080x1920', format: 'short', resolution: { width: 1080, height: 1920 }, frameRate: 30, videoCodec: 'libx264', audioCodec: 'aac', videoBitrateKbps: 6000, audioBitrateKbps: 192, pixelFormat: 'yuv420p', safeZone: { topPercent: 15, bottomPercent: 20, leftPercent: 8, rightPercent: 18 }, crf: 20, preset: 'fast', subtitlesBurnIn: true },
  outputPath: '.cache/clipforge/outputs/jobs/job_fusion_demo_01/rendered.mp4', renderStatus: 'passed', actualDuration: 16.2,
  encodingInformation: { videoCodec: 'h264', audioCodec: 'aac', width: 1080, height: 1920, fps: 30, crf: 20, preset: 'fast', bitrateKbps: 6000, renderTimeSeconds: 3.25 },
  validationResult: { jobId: 'job_fusion_demo_01', status: 'passed', output: { path: '.cache/clipforge/outputs/jobs/job_fusion_demo_01/rendered.mp4', duration: 16.2, width: 1080, height: 1920, fps: 30, videoCodec: 'h264', audioCodec: 'aac', fileSizeBytes: 12485900 }, checks: { fileExists: true, nonEmpty: true, containerValid: true, videoStreamValid: true, audioStreamValid: true, dimensionsValid: true, durationValid: true, fpsValid: true, videoCodecValid: true, audioCodecValid: true }, warnings: [], errors: [] },
  warnings: [], errors: [],
};

export default function App() {
  const [topic, setTopic] = useState('Nuclear Fusion Breakthrough 2026');
  const [format, setFormat] = useState<'short' | 'long'>('short');
  const [isRunning, setIsRunning] = useState(false);
  const [activeStageId, setActiveStageId] = useState('render');
  const [stages, setStages] = useState<StageInfo[]>(INITIAL_STAGES);

  const handleSelectPreset = (preset: string) => { setTopic(preset); };

  const handleRunPipeline = () => {
    setIsRunning(true);
    const reset = stages.map((s, i) => ({ ...s, status: i === 0 ? ('running' as const) : ('pending' as const) }));
    setStages(reset);

    const STAGE_DELAYS_MS = [300, 250, 300, 350, 250, 400, 250, 500];
    let currentIdx = 0;

    const runNextStep = () => {
      setStages((prev) => {
        const next = [...prev];
        if (currentIdx < next.length) {
          next[currentIdx] = { ...next[currentIdx], status: 'completed' };
          if (currentIdx + 1 < next.length) {
            next[currentIdx + 1] = { ...next[currentIdx + 1], status: 'running' };
          }
        }
        return next;
      });

      currentIdx += 1;
      if (currentIdx < stages.length) {
        setTimeout(runNextStep, STAGE_DELAYS_MS[currentIdx] || 300);
      } else {
        setIsRunning(false);
        setActiveStageId('render');
      }
    };

    setTimeout(runNextStep, STAGE_DELAYS_MS[0]);
  };

  const currentStage = stages.find((s) => s.id === activeStageId) || stages[7];

  const getArtifactForStage = () => {
    if (currentStage.id === 'timeline') return SAMPLE_TIMELINE;
    if (currentStage.id === 'render') return SAMPLE_RENDER_ARTIFACT;
    return {
      jobId: 'job_fusion_demo_01', stage: currentStage.id, topic, format, status: 'success',
      data: { title: topic, targetAspectRatio: format === 'short' ? '9:16' : '16:9', itemsGenerated: 3 },
    };
  };

  const getCliCommand = () => {
    if (currentStage.id === 'render') {
      return `npx tsx src/cli/index.ts render --job-id job_fusion_demo_01 --format ${format}`;
    }
    return `npx tsx src/cli/index.ts ${currentStage.id} --topic "${topic}" --format ${format}`;
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-200 flex flex-col selection:bg-emerald-500/30 selection:text-emerald-300">
      <Header topic={topic} setTopic={setTopic} format={format} setFormat={setFormat} isRunning={isRunning} onRunPipeline={handleRunPipeline} activePreset={topic} onSelectPreset={handleSelectPreset} />
      <main className="flex-1 max-w-7xl w-full mx-auto p-6 space-y-6">
        <StageProgress stages={stages} activeStageId={activeStageId} onSelectStage={setActiveStageId} />
        <TimelineVisualizer timeline={SAMPLE_TIMELINE} assets={{ musicTrack: SAMPLE_MUSIC }} />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <AudioCatalogBrowser selectedAssetId="mus_cinematic_pulse" />
          <ArtifactViewer stageId={currentStage.id} stageName={currentStage.name} artifactData={getArtifactForStage()} cliCommand={getCliCommand()} />
        </div>
      </main>
      <footer className="border-t border-neutral-800/80 bg-neutral-900/40 py-4 px-6 text-xs text-neutral-500 font-mono">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>ClipForge Video Automation • Node &amp; TypeScript Engine</span>
          <div className="flex items-center gap-4 text-neutral-400">
            <span>CLI: clipforge [research|script|scenes|broll|assets|timeline|render|validate|pipeline]</span>
            <span className="text-emerald-400">Phase 6 Engine Active</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
