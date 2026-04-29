declare module "cors" {
  import type { RequestHandler } from "express";

  type CorsOriginCallback = (err: Error | null, allow?: boolean) => void;

  type CorsOptions = {
    origin?:
      | boolean
      | string
      | RegExp
      | Array<string | RegExp>
      | ((origin: string | undefined, callback: CorsOriginCallback) => void);
    credentials?: boolean;
  };

  function cors(options?: CorsOptions): RequestHandler;

  export default cors;
}
