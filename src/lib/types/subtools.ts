import { LanguageModelUsage } from "ai";
import { z } from "zod";
import { queryValidatorSchema } from "../agents/schema/st-query-validator";
import { queryEnhancerSchema } from "../agents/schema/st-query-enhancer";
import { dataSourceInsightSchema } from "../agents/schema/ds-insight";
import { dataSourceTokopediaSchema } from "../agents/schema/ds-tokopedia";

export type UnifiedSubToolResult<T, M = any> = {
  ok: boolean;
  usage?: LanguageModelUsage;
  processingTime?: number;
  fallback?: boolean;
  error?: string;
  cached?: boolean;
  data: T;
  metadata?: M;
};

/**
 * Query Validator Data
 */
export type QueryValidationData = z.infer<typeof queryValidatorSchema>;

export type QueryEnhancedData = z.infer<typeof queryEnhancerSchema>;

/**
 * Data Source
 */

export type DataSourceType = "insight" | "tokopedia" | "shopee";

/**
 * Contain types of data source, using `marketSource` as referer
 *
 * - marketSource: "global" - using global store
 * - marketSource: "shopee" - using shopee as store platform
 */
export type DataSourceInsight = z.infer<typeof dataSourceInsightSchema> & {
  callId: string;
};

export type DataSourceTokopedia = z.infer<typeof dataSourceTokopediaSchema>;
