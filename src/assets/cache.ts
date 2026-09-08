/**
 * ClipForge Audio Asset Cache
 * Local disk and memory caching for catalog queries and local audio files.
 */

import fs from 'node:fs';
import path from 'node:path';
import { AudioAssetMetadata } from '../contracts/assets.ts';

export interface AudioAssetCacheConfig {
  cacheDir?: string;
  ttlSeconds?: number;
}

export class AudioAssetCache {
  private cacheDir: string;
  private ttlMs: number;
  private memoryCache: Map<string, { data: unknown; expiresAt: number }> = new Map();

  constructor(config?: AudioAssetCacheConfig) {
    this.cacheDir = path.resolve(config?.cacheDir || './.cache/clipforge/assets');
    this.ttlMs = (config?.ttlSeconds ?? 86400) * 1000;
    if (!fs.existsSync(this.cacheDir)) {
      fs.mkdirSync(this.cacheDir, { recursive: true });
    }
  }

  public getCacheDir(): string {
    return this.cacheDir;
  }

  public getCachedFile(asset: AudioAssetMetadata): string | null {
    const candidate = path.join(this.cacheDir, asset.filename);
    if (fs.existsSync(candidate) && fs.statSync(candidate).size > 0) {
      return candidate;
    }
    return null;
  }

  public setCachedFile(asset: AudioAssetMetadata, sourceFilePath: string): string {
    const destination = path.join(this.cacheDir, asset.filename);
    if (path.resolve(sourceFilePath) !== path.resolve(destination)) {
      fs.copyFileSync(sourceFilePath, destination);
    }
    return destination;
  }

  public get<T>(key: string): T | null {
    const mem = this.memoryCache.get(key);
    if (mem && mem.expiresAt > Date.now()) {
      return mem.data as T;
    }
    return null;
  }

  public set<T>(key: string, data: T): void {
    this.memoryCache.set(key, { data, expiresAt: Date.now() + this.ttlMs });
  }

  public clear(): void {
    this.memoryCache.clear();
  }
}
