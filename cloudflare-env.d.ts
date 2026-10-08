declare namespace Cloudflare {
  interface Env {
    DB?: D1Database;
    BUCKET?: R2Bucket;
    QUEST_ADMIN_PASSWORD?: string;
  }
}
