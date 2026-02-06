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

  async connect(): Promise<number> {
    // Prevenir múltiples intentos simultáneos
    if (this.isConnecting) {
      throw new Error('Ya hay una conexión en proceso');
    }

    this.isConnecting = true;
    this.hasErrored = false;
    this.isDisconnecting = false;

    return new Promise(async (resolve, reject) => {
      this.resolvePromise = resolve;
      this.rejectPromise = reject;

      try {
        this.connectionTimeout = setTimeout(() => {
          if (!this.hasErrored && !this.isDisconnecting) {
            this.handleConnectionError('Tiempo de espera agotado', 'CONNECTION_TIMEOUT');
          }
        }, 10000);

        this.peerConnection = new RTCPeerConnection({ iceServers: [] });

        const pc = this.peerConnection as any;

        pc.ontrack = (event: any) => {
          if (this.hasErrored || this.isDisconnecting) return;
          
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
          
          // Solo reportar estados relevantes
          if (state === 'connected' || state === 'connecting') {
            this.config.onConnectionStateChange?.(state);
          }

          if (state === 'failed' && !this.hasErrored && !this.isDisconnecting) {
            this.handleConnectionError('Conexión fallida', 'CONNECTION_FAILED');
          }
        };

        pc.onicecandidate = () => {};

        const offer = await pc.createOffer({
          offerToReceiveVideo: true,
          offerToReceiveAudio: false,
        });

        await pc.setLocalDescription(offer);

        const whepUrl = `${this.config.serverUrl}/${this.config.streamPath}/whep`;

        const response = await fetch(whepUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/sdp',
          },
          body: offer.sdp,
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const answerSDP = await response.text();

        await pc.setRemoteDescription({
          type: 'answer',
          sdp: answerSDP,
        } as RTCSessionDescription);

      } catch (error: any) {
        if (!this.hasErrored && !this.isDisconnecting) {
          this.handleConnectionError('Error de conexión: ' + error.message, 'CONNECTION_ERROR');
        }
      }
    });
  }

  private handleConnectionError(message: string, errorCode: string) {
    if (this.hasErrored || this.isDisconnecting) return;
    
    this.hasErrored = true;
    this.clearConnectionTimeout();
    
    // Reportar error a la UI
    this.config.onError?.(message);
    
    // Cerrar conexión
    if (this.peerConnection) {
      try {
        this.peerConnection.close();
      } catch (error) {
        // Silenciar errores de cierre
      }
      this.peerConnection = null;
    }
    
    this.isConnecting = false;
    
    // Rechazar promesa solo si no se ha resuelto/rechazado ya
    if (this.rejectPromise) {
      this.rejectPromise(new Error(errorCode));
      this.resolvePromise = null;
      this.rejectPromise = null;
    }
  }

  private clearConnectionTimeout() {
    if (this.connectionTimeout) {
      clearTimeout(this.connectionTimeout);
      this.connectionTimeout = null;
    }
  }

  getVideoStartTime(): number {
    return this.videoStartTime;
  }

  hasActiveStream(): boolean {
    return this.remoteStream !== null;
  }

  async disconnect() {
    this.isDisconnecting = true;
    this.hasErrored = true;
    this.clearConnectionTimeout();
    
    // Cancelar promesas pendientes
    if (this.rejectPromise) {
      this.rejectPromise(new Error('DISCONNECTED'));
      this.resolvePromise = null;
      this.rejectPromise = null;
    }
    
    if (this.peerConnection) {
      try {
        this.peerConnection.close();
      } catch (error) {
        // Silenciar errores de cierre
      }
      this.peerConnection = null;
    }
    
    this.remoteStream = null;
    this.videoStartTime = 0;
    this.isConnecting = false;
  }
}