import * as fs from 'fs/promises';
import * as path from 'path';
import { Logger } from './Logger';

/**
 * SldFileParser -- utility for basic validation of downloaded SLD files.
 *
 * NOTE: The exact SLD file format (XML/SVG/ZIP/proprietary) is unknown until
 * the export endpoint is live. This helper provides format-agnostic checks
 * (file exists, non-empty, optional string-contains check) and a stub for
 * XML/SVG parsing once the format is confirmed.
 */
export class SldFileParser {
  private logger: Logger;

  constructor() {
    this.logger = new Logger('SldFileParser');
  }

  /**
   * Read file from path, return its content as a string.
   */
  async readAsText(filePath: string): Promise<string> {
    this.logger.info(`Reading SLD file: ${filePath}`);
    const content = await fs.readFile(filePath, 'utf-8');
    this.logger.info(`File size: ${content.length} chars`);
    return content;
  }

  /**
   * Verify the file at filePath exists and is non-empty.
   */
  async verifyFileNonEmpty(filePath: string): Promise<void> {
    const stat = await fs.stat(filePath);
    if (stat.size === 0) {
      throw new Error(`SLD file is empty: ${filePath}`);
    }
    this.logger.info(`File is non-empty (${stat.size} bytes): ${path.basename(filePath)}`);
  }

  /**
   * Check that file content contains a given string token.
   */
  containsToken(content: string, token: string): boolean {
    const found = content.includes(token);
    this.logger.info(`Token "${token}" ${found ? 'FOUND' : 'NOT FOUND'} in SLD content`);
    return found;
  }

  /**
   * Check whether the file appears to be XML/SVG based on content prefix.
   * TODO: expand to full XML parse once format is confirmed.
   */
  isXmlOrSvg(content: string): boolean {
    const trimmed = content.trimStart();
    return trimmed.startsWith('<?xml') || trimmed.startsWith('<svg') || trimmed.startsWith('<');
  }

  /**
   * Extract all numeric quantity values from the SLD file text.
   * TODO: update regex patterns once SLD file format is confirmed.
   */
  extractQuantities(content: string): number[] {
    const patterns: RegExp[] = [
      /qty="(\d+)"/gi,
      /quantity="(\d+)"/gi,
      /<quantity>(\d+)<\/quantity>/gi,
      /data-qty="(\d+)"/gi,
    ];

    const values = new Set<number>();
    for (const pattern of patterns) {
      const re = new RegExp(pattern.source, pattern.flags);
      let match: RegExpExecArray | null;
      while ((match = re.exec(content)) !== null) {
        values.add(parseInt(match[1], 10));
      }
    }

    const result = [...values];
    this.logger.info(`Extracted quantities from SLD: ${JSON.stringify(result)}`);
    return result;
  }
}
