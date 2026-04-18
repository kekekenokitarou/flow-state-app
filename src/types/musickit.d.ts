declare namespace MusicKit {
  interface MusicKitInstance {
    isAuthorized: boolean;
    authorize(): Promise<string>;
    unauthorize(): Promise<void>;
    setQueue(options: QueueOptions): Promise<void>;
    play(): Promise<void>;
    pause(): void;
    stop(): void;
    readonly api: {
      music(
        path: string,
        params?: Record<string, unknown>
      ): Promise<{ data: { data: unknown[] } }>;
    };
  }

  interface QueueOptions {
    playlist?: string;
    album?: string;
    song?: string;
    url?: string;
  }

  interface ConfigureOptions {
    developerToken: string;
    app: { name: string; build: string };
  }

  function configure(options: ConfigureOptions): Promise<MusicKitInstance>;
  function getInstance(): MusicKitInstance;
}

interface Window {
  MusicKit: typeof MusicKit;
}
