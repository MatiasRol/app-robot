interface WebSocketConfig {
  serverUrl: string;
  onConnected?: () => void;
  onDisconnected?: () => void;
  onMessage?: (data: any) => void;
  onError?: (error: string) => void;
}

interface CommandStats {
  commandCount: number;
  averageLatency: number;
  lastCommand: Date | null;
}

export class WebSocketService {
  private ws: WebSocket | null = null;
  private config: WebSocketConfig;
  private reconnectTimeout: ReturnType<typeof setTimeout> | null = null;
  private connectionTimeout: ReturnType<typeof setTimeout> | null = null;
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 5;
  private isManualDisconnect: boolean = false;
  private hasErrored: boolean = false;

  private commandCount: number = 0;
  private latencyBuffer: number[] = [];
  private videoStartTime: number = 0;

  constructor(config: WebSocketConfig) {
    this.config = config;
  }

  private clearConnectionTimeout() {
    if (this.connectionTimeout) {
      clearTimeout(this.connectionTimeout);
      this.connectionTimeout = null;
    }
  }

  connect(videoStartTime: number = 0): Promise<void> {
    this.hasErrored = false;
    this.isManualDisconnect = false;
    this.clearConnectionTimeout();

    return new Promise((resolve, reject) => {
      let settled = false;
      let opened = false;

      const safeResolve = () => {
        if (settled) return;
        settled = true;
        resolve();
      };

      const safeReject = (error: any) => {
        if (settled) return;
        settled = true;
        reject(error);
      };

      try {
        this.videoStartTime = videoStartTime;
        this.ws = new WebSocket(this.config.serverUrl);

        this.connectionTimeout = setTimeout(() => {
          if (!opened && !this.isManualDisconnect) {
            this.hasErrored = true;
            this.config.onError?.('Tiempo de espera agotado al conectar comandos');
            safeReject(new Error('WS_CONNECT_TIMEOUT'));

            try {
              this.ws?.close();
            } catch {}
          }
        }, 8000);

        this.ws.onopen = () => {
          opened = true;
          this.clearConnectionTimeout();
          this.reconnectAttempts = 0;
          this.hasErrored = false;
          this.config.onConnected?.();
          safeResolve();
        };

        this.ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            this.handleMessage(data);
          } catch {
            console.warn('⚠️ Mensaje WS no válido:', event.data);
          }
        };

        this.ws.onerror = (error) => {
          this.clearConnectionTimeout();

          if (!this.hasErrored && !this.isManualDisconnect) {
            this.hasErrored = true;
            this.config.onError?.('Error de conexión WebSocket');
            safeReject(error);
          }
        };

        this.ws.onclose = () => {
          this.clearConnectionTimeout();

          if (!this.isManualDisconnect) {
            this.config.onDisconnected?.();

            if (!opened) {
              if (!this.hasErrored) {
                this.hasErrored = true;
                this.config.onError?.('La conexión de comandos se cerró antes de abrir');
              }
              safeReject(new Error('WS_CLOSED_BEFORE_OPEN'));
              return;
            }

            this.attemptReconnect();
          }
        };
      } catch (error) {
        this.clearConnectionTimeout();

        if (!this.hasErrored) {
          this.hasErrored = true;
          this.config.onError?.('No se pudo crear la conexión WebSocket');
          safeReject(error);
        }
      }
    });
  }

  private handleMessage(data: any) {
    switch (data.type) {
      case 'welcome':
        break;

      case 'cmd_ack':
        if (data.latency_ms !== undefined) {
          this.latencyBuffer.push(data.latency_ms);
          if (this.latencyBuffer.length > 20) {
            this.latencyBuffer.shift();
          }
        }
        this.commandCount = data.commands_total || this.commandCount;
        break;

      case 'telemetry_broadcast':
        break;

      case 'emergency_ack':
        break;

      case 'pos_suscrito':
        break;

      case 'pos_robot':
        break;

      case 'pos_detenido':
        break;
    }

    this.config.onMessage?.(data);
  }

  private sendJson(payload: any) {
    if (!this.isConnected()) {
      return;
    }

    try {
      this.ws!.send(JSON.stringify(payload));
    } catch {}
  }

  sendVelocityCommand(linear: number, angular: number) {
    if (!this.isConnected()) {
      return;
    }

    try {
      const command = {
        type: 'cmd_vel',
        linear,
        angular,
        videoTimestamp:
          this.videoStartTime > 0 ? Date.now() - this.videoStartTime + 150 : 0,
        clientTimestamp: Date.now(),
      };

      this.ws!.send(JSON.stringify(command));
      this.commandCount++;
    } catch {}
  }

  stopRobot() {
    this.sendVelocityCommand(0, 0);
  }

  requestRobotPositionStream() {
    this.sendJson({ type: 'solicitar_pos' });
  }

  stopRobotPositionStream() {
    this.sendJson({ type: 'detener_pos' });
  }

  sendNavigateToPose(
    x: number,
    y: number,
    quaternion: { x: number; y: number; z: number; w: number }
  ) {
    if (!this.isConnected()) return;

    this.sendJson({
      type: 'navigate_to_pose',
      pose: {
        position: { x, y, z: 0.0 },
        orientation: {
          x: quaternion.x,
          y: quaternion.y,
          z: quaternion.z,
          w: quaternion.w,
        },
      },
    });
  }

  sendFollowWaypoints(
    waypoints: Array<{
      worldX: number;
      worldY: number;
      quaternion: { x: number; y: number; z: number; w: number };
    }>
  ) {
    if (!this.isConnected()) return;

    this.sendJson({
      type: 'follow_waypoints',
      waypoints: waypoints.map((wp) => ({
        position: { x: wp.worldX, y: wp.worldY, z: 0.0 },
        orientation: {
          x: wp.quaternion.x,
          y: wp.quaternion.y,
          z: wp.quaternion.z,
          w: wp.quaternion.w,
        },
      })),
    });
  }

  sendRecordingCommand(value: 'on' | 'off') {
    if (!this.isConnected()) return;

    this.sendJson({
      type: 'grabacion',
      value,
    });
  }

  emergencyStop() {
    this.stopRobot();

    if (this.isConnected()) {
      this.sendJson({
        type: 'emergency_stop',
        timestamp: Date.now(),
      });
    }
  }

  isConnected(): boolean {
    return this.ws !== null && this.ws.readyState === WebSocket.OPEN;
  }

  getStats(): CommandStats {
    const avgLatency =
      this.latencyBuffer.length > 0
        ? this.latencyBuffer.reduce((a, b) => a + b, 0) /
          this.latencyBuffer.length
        : 0;

    return {
      commandCount: this.commandCount,
      averageLatency: avgLatency,
      lastCommand: null,
    };
  }

  private attemptReconnect() {
    if (
      this.isManualDisconnect ||
      this.reconnectAttempts >= this.maxReconnectAttempts
    ) {
      if (!this.isManualDisconnect && !this.hasErrored) {
        this.hasErrored = true;
        this.config.onError?.('No se pudo reconectar al servidor de comandos');
      }
      return;
    }

    const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 10000);
    this.reconnectAttempts++;

    this.reconnectTimeout = setTimeout(() => {
      this.connect(this.videoStartTime).catch(() => {});
    }, delay);
  }

  updateVideoStartTime(timestamp: number) {
    this.videoStartTime = timestamp;
  }

  disconnect() {
    this.isManualDisconnect = true;
    this.hasErrored = true;
    this.clearConnectionTimeout();

    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }

    if (this.ws) {
      try {
        this.ws.close();
      } catch {}
      this.ws = null;
    }

    this.reconnectAttempts = 0;
    this.commandCount = 0;
    this.latencyBuffer = [];
  }
}