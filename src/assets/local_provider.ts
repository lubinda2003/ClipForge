/**
 * ClipForge Local Audio Asset Provider
 * Serves curated audio files from the local filesystem with offline fixture generation.
 */

import fs from 'node:fs';
import path from 'node:path';
import { AudioAssetMetadata } from '../contracts/assets.ts';
import { IAudioAssetProvider } from './types.ts';
import { DEFAULT_CURATED_AUDIO_CATALOG } from './catalog.ts';

export interface LocalAudioAssetProviderConfig {
  assetsBaseDir?: string;
  catalogFilePath?: string;
}

export class LocalAudioAssetProvider implements IAudioAssetProvider {
  readonly name = 'local_audio_provider';
  private assetsBaseDir: string;
  private catalogFilePath?: string;

  constructor(config?: LocalAudioAssetProviderConfig) {
    this.assetsBaseDir = path.resolve(config?.assetsBaseDir || './assets');
    this.catalogFilePath = config?.catalogFilePath;
  }

  public async isAvailable(): Promise<boolean> {
    return true;
  }

  public async loadCatalog(): Promise<AudioAssetMetadata[]> {
    if (this.catalogFilePath && fs.existsSync(this.catalogFilePath)) {
      try {
        const raw = fs.readFileSync(this.catalogFilePath, 'utf-8');
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          return parsed;
        }
      } catch {
        // Fall back to built-in default
      }
    }
    return DEFAULT_CURATED_AUDIO_CATALOG;
  }

  public async getAssetFile(asset: AudioAssetMetadata, destinationDir: string): Promise<string> {
    if (!fs.existsSync(destinationDir)) {
      fs.mkdirSync(destinationDir, { recursive: true });
    }

    const destPath = path.join(destinationDir, asset.filename);
    if (fs.existsSync(destPath) && fs.statSync(destPath).size > 0) {
      return destPath;
    }

    const sourceCandidate = path.join(this.assetsBaseDir, asset.r2Path.replace(/^assets\//, ''));
    if (fs.existsSync(sourceCandidate) && fs.statSync(sourceCandidate).size > 0) {
      fs.copyFileSync(sourceCandidate, destPath);
      return destPath;
    }

    const header = Buffer.from(`CLIPFORGE_AUDIO_ASSET:${asset.assetId}:${asset.durationSeconds}s`);
    const padding = Buffer.alloc(1024, 0);
    fs.writeFileSync(destPath, Buffer.concat([header, padding]));

    return destPath;
  }
}
