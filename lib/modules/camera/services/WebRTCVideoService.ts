import {
  MediaStream,
  RTCPeerConnection,
  RTCSessionDescription,
} from 'react-native-webrtc';

interface WebRTCVideoConfig {
  serverUrl: string;
  streamPath: string;
  onStreamReceived?: (stream: MediaStream) => void;
  onConnectionStateChange?: (state: string) => void;
  onError?: (error: string) => void;
}

export class WebRTCVideoService {
  private peerConnection: RTCPeerConnection | null = null;
  private remoteStream: MediaStream | null = null;
  private connectionTimeout: ReturnType<typeof setTimeout> | null = null;
  private config: WebRTCVideoConfig;
  private videoStartTime: number = 0;
  private isConnecting: boolean = false;
  private hasErrored: boolean = false;
  private isDisconnecting: boolean = false;
  private resolvePromise: ((value: number) => void) | null = null;
  private rejectPromise: ((reason?: any) => void) | null = null;

  constructor(config: WebRTCVideoConfig) {
    this.config = config;
  }

  private clearConnectionTimeout() {
    if (this.connectionTimeout) {
      clearTimeout(this.connectionTimeout);
      this.connectionTimeout = null;
    }
  }

  private async waitForIceGatheringComplete(pc: any, timeoutMs: number = 3000) {
    const startedAt = Date.now();

    while (pc.iceGatheringState !== 'complete') {
      if (Date.now() - startedAt >= timeoutMs) {
        console.log('[RobotConnect][VIDEO] ICE wait timeout', {
          iceGatheringState: pc.iceGatheringState,
        });
        break;
      }

      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    console.log('[RobotConnect][VIDEO] ICE complete or timeout', {
      iceGatheringState: pc.iceGatheringState,
    });
  }

  async connect(): Promise<number> {
    if (this.isConnecting) {
      throw new Error('Ya hay una conexión en proceso');
    }

    this.isConnecting = true;
    this.hasErrored = false;
    this.isDisconnecting = false;

    console.log('[RobotConnect][VIDEO] connect() start', {
      serverUrl: this.config.serverUrl,
      streamPath: this.config.streamPath,
    });

    return new Promise(async (resolve, reject) => {
      this.resolvePromise = resolve;
      this.rejectPromise = reject;

      try {
        this.connectionTimeout = setTimeout(() => {
          if (!this.hasErrored && !this.isDisconnecting) {
            console.log('[RobotConnect][VIDEO] connection timeout');
            this.handleConnectionError('Tiempo de espera agotado', 'CONNECTION_TIMEOUT');
          }
        }, 10000);

        this.peerConnection = new RTCPeerConnection({ iceServers: [] });
        const pc = this.peerConnection as any;

        pc.ontrack = (event: any) => {
          if (this.hasErrored || this.isDisconnecting) return;

          console.log('[RobotConnect][VIDEO] ontrack');

          const stream = event.streams?.[0];
          if (stream) {
            this.remoteStream = stream;
            this.videoStartTime = Date.now();
            this.config.onStreamReceived?.(stream);
            this.clearConnectionTimeout();
            this.isConnecting = false;

            if (this.resolvePromise) {
              this.resolvePromise(this.videoStartTime);
              this.resolvePromise = null;
              this.rejectPromise = null;
            }
          }
        };

        pc.onconnectionstatechange = () => {
          if (this.isDisconnecting) return;

          const state = pc.connectionState ?? 'unknown';
          console.log('[RobotConnect][VIDEO] connectionState:', state);

          if (
            state === 'connected' ||
            state === 'connecting' ||
            state === 'disconnected'
          ) {
            this.config.onConnectionStateChange?.(state);
          }

          if (
            (state === 'failed' || state === 'disconnected') &&
            !this.hasErrored &&
            !this.isDisconnecting &&
            !this.remoteStream
          ) {
            this.handleConnectionError('Conexión de video fallida', 'CONNECTION_FAILED');
          }
        };

        pc.oniceconnectionstatechange = () => {
          console.log('[RobotConnect][VIDEO] iceConnectionState:', pc.iceConnectionState);
        };

        pc.onicegatheringstatechange = () => {
          console.log('[RobotConnect][VIDEO] iceGatheringState:', pc.iceGatheringState);
        };

        const offer = await pc.createOffer({
          offerToReceiveVideo: true,
          offerToReceiveAudio: false,
        });

        console.log('[RobotConnect][VIDEO] offer created');
        await pc.setLocalDescription(offer);
        console.log('[RobotConnect][VIDEO] local description set');

        await this.waitForIceGatheringComplete(pc, 3000);

        const whepUrl = `${this.config.serverUrl}/${this.config.streamPath}/whep`;
        const finalSdp = pc.localDescription?.sdp || offer.sdp;

        console.log('[RobotConnect][VIDEO] posting SDP to WHEP', {
          whepUrl,
          sdpLength: finalSdp?.length,
        });

        const response = await fetch(whepUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/sdp',
          },
          body: finalSdp,
        });

        console.log('[RobotConnect][VIDEO] WHEP response', {
          ok: response.ok,
          status: response.status,
          statusText: response.statusText,
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const answerSDP = await response.text();

        if (!answerSDP) {
          throw new Error('Respuesta SDP vacía');
        }

        console.log('[RobotConnect][VIDEO] answer SDP length', answerSDP.length);

        await pc.setRemoteDescription({
          type: 'answer',
          sdp: answerSDP,
        } as RTCSessionDescription);

        console.log('[RobotConnect][VIDEO] remote description set');
      } catch (error: any) {
        console.log('[RobotConnect][VIDEO] connect exception', error);

        if (!this.hasErrored && !this.isDisconnecting) {
          this.handleConnectionError(
            'Error de conexión de video: ' + error.message,
            'CONNECTION_ERROR'
          );
        }
      }
    });
  }

  private handleConnectionError(message: string, errorCode: string) {
    if (this.hasErrored || this.isDisconnecting) return;

    console.log('[RobotConnect][VIDEO] handleConnectionError', {
      message,
      errorCode,
    });

    this.hasErrored = true;
    this.clearConnectionTimeout();
    this.config.onError?.(message);

    if (this.peerConnection) {
      try {
        this.peerConnection.close();
      } catch {}
      this.peerConnection = null;
    }

    this.isConnecting = false;

    if (this.rejectPromise) {
      this.rejectPromise(new Error(errorCode));
      this.resolvePromise = null;
      this.rejectPromise = null;
    }
  }

  getVideoStartTime(): number {
    return this.videoStartTime;
  }

  hasActiveStream(): boolean {
    return this.remoteStream !== null;
  }

  async disconnect() {
    console.log('[RobotConnect][VIDEO] disconnect()');

    this.isDisconnecting = true;
    this.hasErrored = true;
    this.clearConnectionTimeout();

    if (this.rejectPromise) {
      this.rejectPromise(new Error('DISCONNECTED'));
      this.resolvePromise = null;
      this.rejectPromise = null;
    }

    if (this.peerConnection) {
      try {
        this.peerConnection.close();
      } catch {}
      this.peerConnection = null;
    }

    this.remoteStream = null;
    this.videoStartTime = 0;
    this.isConnecting = false;
  }
}