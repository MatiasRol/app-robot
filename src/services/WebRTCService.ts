import {
  MediaStream,
  RTCPeerConnection,
  RTCSessionDescription,
} from 'react-native-webrtc';

interface WebRTCConfig {
  serverUrl: string;
  onStreamReceived?: (stream: MediaStream) => void;
  onConnectionStateChange?: (state: string) => void;
  onDataChannelMessage?: (message: any) => void;
  onError?: (error: string) => void;
}

type RTCDataChannelLike = {
  readyState: 'connecting' | 'open' | 'closing' | 'closed';
  send: (data: string) => void;
  close: () => void;
  onopen: (() => void) | null;
  onmessage: ((event: { data: string }) => void) | null;
  onclose: (() => void) | null;
  onerror: ((error: any) => void) | null;
};

// Tipos ROS2 Twist
interface Vector3 {
  x: number;
  y: number;
  z: number;
}

interface Twist {
  linear: Vector3;
  angular: Vector3;
}

interface TwistStamped {
  header: {
    stamp: {
      sec: number;
      nanosec: number;
    };
    frame_id: string;
  };
  twist: Twist;
}

export class WebRTCService {
  private peerConnection: RTCPeerConnection | null = null;
  private dataChannel: RTCDataChannelLike | null = null;
  private remoteStream: MediaStream | null = null;
  private connectionTimeout: ReturnType<typeof setTimeout> | null = null;
  private config: WebRTCConfig;

  constructor(config: WebRTCConfig) {
    this.config = config;
  }

  async connect(): Promise<boolean> {
    return new Promise(async (resolve, reject) => {
      try {
        this.connectionTimeout = setTimeout(() => {
          this.handleConnectionError('Tiempo de espera agotado');
          reject(new Error('CONNECTION_TIMEOUT'));
        }, 10000);

        this.peerConnection = new RTCPeerConnection({ iceServers: [] });

        const pc = this.peerConnection as any;

        // 🎥 Stream remoto
        pc.ontrack = (event: any) => {
          const stream = event.streams?.[0];
          if (stream) {
            this.remoteStream = stream;
            this.config.onStreamReceived?.(stream);
            this.clearConnectionTimeout();
            resolve(true);
          }
        };

        // 🔌 Estado conexión
        pc.onconnectionstatechange = () => {
          const state = pc.connectionState ?? 'unknown';
          this.config.onConnectionStateChange?.(state);

          if (state === 'failed') {
            this.handleConnectionError('Conexión fallida');
            reject(new Error('CONNECTION_FAILED'));
          }
        };

        // ❄ ICE
        pc.onicecandidate = () => {};

        // 📡 DataChannel
        this.dataChannel = pc.createDataChannel('commands', {
          ordered: true,
        }) as RTCDataChannelLike;

        this.dataChannel.onopen = () => this.sendPing();

        this.dataChannel.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            this.config.onDataChannelMessage?.(data);
          } catch {}
        };

        // 📤 Offer
        const offer = await pc.createOffer({
          offerToReceiveVideo: true,
          offerToReceiveAudio: false,
        });

        await pc.setLocalDescription(offer);

        // 🌐 Señalización
        const controller = new AbortController();
        const fetchTimeout = setTimeout(() => controller.abort(), 8000);

        const response = await fetch(`${this.config.serverUrl}/offer`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sdp: offer.sdp, type: offer.type }),
          signal: controller.signal,
        });

        clearTimeout(fetchTimeout);

        if (!response.ok) throw new Error('SERVER_ERROR');

        const answer = await response.json();

        await pc.setRemoteDescription(
          new RTCSessionDescription(answer)
        );
      } catch (error) {
        this.clearConnectionTimeout();
        this.handleConnectionError('Error de conexión');
        reject(error);
      }
    });
  }

  private handleConnectionError(message: string) {
    this.clearConnectionTimeout();
    this.config.onError?.(message);
    this.peerConnection?.close();
    this.peerConnection = null;
  }

  private clearConnectionTimeout() {
    if (this.connectionTimeout) {
      clearTimeout(this.connectionTimeout);
      this.connectionTimeout = null;
    }
  }

  sendPing() {
    if (this.dataChannel?.readyState === 'open') {
      this.dataChannel.send(
        JSON.stringify({ type: 'ping', timestamp: Date.now() })
      );
    }
  }

  /**
   * Envía comando Twist (sin timestamp)
   */
  sendTwist(linear: number, angular: number) {
    if (this.dataChannel?.readyState !== 'open') {
      console.warn('DataChannel no está abierto');
      return;
    }

    const twist: Twist = {
      linear: { x: linear, y: 0, z: 0 },
      angular: { x: 0, y: 0, z: angular },
    };

    const message = JSON.stringify({
      type: 'cmd_vel',
      data: twist,
    });

    this.dataChannel.send(message);
    console.log('Twist enviado:', { linear, angular });
  }

  /**
   * Envía comando TwistStamped (con timestamp)
   */
  sendTwistStamped(linear: number, angular: number, frameId: string = 'base_link') {
    if (this.dataChannel?.readyState !== 'open') {
      console.warn('DataChannel no está abierto');
      return;
    }

    const now = Date.now();
    const sec = Math.floor(now / 1000);
    const nanosec = (now % 1000) * 1000000;

    const twistStamped: TwistStamped = {
      header: {
        stamp: { sec, nanosec },
        frame_id: frameId,
      },
      twist: {
        linear: { x: linear, y: 0, z: 0 },
        angular: { x: 0, y: 0, z: angular },
      },
    };

    const message = JSON.stringify({
      type: 'cmd_vel_stamped',
      data: twistStamped,
    });

    this.dataChannel.send(message);
    console.log('TwistStamped enviado:', { linear, angular });
  }

  /**
   * Detiene el robot enviando velocidades en 0
   */
  stopRobot() {
    this.sendTwist(0, 0);
  }

  sendCommand(command: string, data?: any) {
    if (this.dataChannel?.readyState === 'open') {
      this.dataChannel.send(
        JSON.stringify({ type: command, data, timestamp: Date.now() })
      );
    }
  }

  async disconnect() {
    this.clearConnectionTimeout();
    this.dataChannel?.close();
    this.peerConnection?.close();
    this.dataChannel = null;
    this.peerConnection = null;
    this.remoteStream = null;
  }
}