/**
 * ClipForge Audio Asset Library
 * Main orchestrator for catalog management, asset selection, caching, and local staging.
 */

import path from 'node:path';
import { AudioAssetMetadata, AssetsArtifact, SelectedAudioAsset } from '../contracts/assets.ts';
import { VideoFormat } from '../contracts/common.ts';
import { AudioAssetCatalog } from './catalog.ts';
import { AudioAssetSelector } from './selector.ts';
import { AudioAssetValidator } from './validator.ts';
import { AudioAssetCache } from './cache.ts';
import { IAudioAssetProvider } from './types.ts';
import { LocalAudioAssetProvider } from './local_provider.ts';
import { R2AudioAssetProvider } from './r2_provider.ts';
import { IStorageProvider } from '../storage/interface.ts';

export interface AudioLibraryOptions {
  provider?: IAudioAssetProvider;
  storage?: IStorageProvider;
  cacheDir?: string;
  requireCommercialUse?: boolean;
}

export interface ProductionAssetSelectionRequest {
  jobId: string;
  format: VideoFormat;
  totalDurationSeconds: number;
  topic?: string;
  targetMood?: string;
  desiredEnergy?: 'low' | 'medium' | 'high';
  recentlyUsedAssetIds?: string[];
  sfxLandmarks?: Array<{
    timestampSeconds: number;
    purpose: 'hook' | 'pattern_interrupt' | 'statistic_reveal' | 'scene_transition' | 'payoff' | 'emphasis';
    sceneId?: string;
    desiredEnergy?: 'low' | 'medium' | 'high';
  }>;
}

export class AudioAssetLibrary {
  private catalog: AudioAssetCatalog;
  private selector: AudioAssetSelector;
  private provider: IAudioAssetProvider;
  private cache: AudioAssetCache;
  private requireCommercialUse: boolean;

  constructor(options?: AudioLibraryOptions) {
    this.catalog = new AudioAssetCatalog();
    this.selector = new AudioAssetSelector(this.catalog);
    this.cache = new AudioAssetCache({ cacheDir: options?.cacheDir });
    this.requireCommercialUse = options?.requireCommercialUse ?? true;

    if (options?.provider) {
      this.provider = options.provider;
    } else if (options?.storage) {
      this.provider = new R2AudioAssetProvider({ storage: options.storage });
    } else {
      this.provider = new LocalAudioAssetProvider();
    }
  }

  public getCatalog(): AudioAssetCatalog {
    return this.catalog;
  }

  public getSelector(): AudioAssetSelector {
    return this.selector;
  }

  public async initialize(): Promise<void> {
    try {
      const isAvail = await this.provider.isAvailable();
      if (isAvail) {
        await this.catalog.loadFromProvider(this.provider);
      }
    } catch {
      // Keep default curated catalog
    }
  }

  public async selectAssetsForProduction(
    request: ProductionAssetSelectionRequest
  ): Promise<AssetsArtifact> {
    await this.initialize();

    const warnings: string[] = [];
    const attributionsRequired: string[] = [];
    const usedAssetIds = [...(request.recentlyUsedAssetIds || [])];

    let musicTrack: SelectedAudioAsset | undefined;
    const musicCandidate = this.selector.selectMusic({
      format: request.format,
      topic: request.topic,
      targetMood: request.targetMood,
      desiredEnergy: request.desiredEnergy,
      totalDurationSeconds: request.totalDurationSeconds,
      commercialUseRequired: this.requireCommercialUse,
      recentlyUsedAssetIds: usedAssetIds,
    });

    if (musicCandidate) {
      const validation = AudioAssetValidator.validateMetadata(musicCandidate.asset, {
        requireCommercialUse: this.requireCommercialUse,
      });

      if (!validation.valid) {
        warnings.push(`Music asset ${musicCandidate.asset.assetId} failed validation: ${validation.issues.map(i => i.message).join(', ')}`);
      } else {
        const stagedPath = await this.stageAssetFile(musicCandidate.asset, request.jobId);
        musicCandidate.localPath = stagedPath;
        musicTrack = musicCandidate;
        usedAssetIds.push(musicCandidate.asset.assetId);

        if (musicCandidate.asset.attributionRequired && musicCandidate.asset.attributionText) {
          attributionsRequired.push(musicCandidate.asset.attributionText);
        }
      }
    } else {
      warnings.push(`No suitable background music found matching criteria for job ${request.jobId}. Video will proceed without music.`);
    }

    const sfxTracks: SelectedAudioAsset[] = [];
    if (request.sfxLandmarks && request.sfxLandmarks.length > 0) {
      for (const landmark of request.sfxLandmarks) {
        const sfxCandidate = this.selector.selectSfx({
          purpose: landmark.purpose,
          desiredEnergy: landmark.desiredEnergy,
          commercialUseRequired: this.requireCommercialUse,
          recentlyUsedAssetIds: usedAssetIds,
        });

        if (!sfxCandidate) {
          warnings.push(`No suitable SFX found for ${landmark.purpose} at ${landmark.timestampSeconds}s`);
          continue;
        }

        const stagedPath = await this.stageAssetFile(sfxCandidate, request.jobId);
        usedAssetIds.push(sfxCandidate.assetId);

        if (sfxCandidate.attributionRequired && sfxCandidate.attributionText) {
          if (!attributionsRequired.includes(sfxCandidate.attributionText)) {
            attributionsRequired.push(sfxCandidate.attributionText);
          }
        }

        let volume = 0.35;
        if (landmark.purpose === 'hook' || landmark.purpose === 'payoff') {
          volume = 0.45;
        } else if (landmark.purpose === 'statistic_reveal' || landmark.purpose === 'emphasis') {
          volume = 0.28;
        }

        sfxTracks.push({
          purpose: 'sfx',
          asset: sfxCandidate,
          localPath: stagedPath,
          targetTimestampSeconds: landmark.timestampSeconds,
          targetDurationSeconds: sfxCandidate.durationSeconds,
          volumeLevel: volume,
          associatedSceneId: landmark.sceneId,
        });
      }
    }

    return {
      jobId: request.jobId,
      createdAt: new Date().toISOString(),
      musicTrack,
      sfxTracks,
      attributionsRequired,
      warnings: warnings.length > 0 ? warnings : undefined,
    };
  }

  private async stageAssetFile(asset: AudioAssetMetadata, jobId: string): Promise<string> {
    const cached = this.cache.getCachedFile(asset);
    if (cached) {
      return cached;
    }

    const jobStageDir = path.join(this.cache.getCacheDir(), 'jobs', jobId, 'audio');
    const localPath = await this.provider.getAssetFile(asset, jobStageDir);
    this.cache.setCachedFile(asset, localPath);
    return localPath;
  }
}
