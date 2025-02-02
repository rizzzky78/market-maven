import { ExtendedToolResult } from "./ai";

export type ProductDetailsProps = {
  content: ExtendedToolResult<
    { query: string; link: string },
    { insight: Record<string, any>; screenshot: string; callId: string }
  >;
};
