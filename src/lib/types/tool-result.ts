import { ProductsResponse } from "./product";
import { DataSourceInsight } from "./subtools";

export type BaseToolResult = {
  source?: "global" | "tokopedia";
  callId: string;
};

export type ToolResultProductSearch = {
  object: DataSourceInsight | ProductsResponse;
} & BaseToolResult;
