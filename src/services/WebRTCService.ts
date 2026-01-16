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
  }
  
  export class WebRTCService {
    private peerConnection: RTCPeerConnection | null = null;
    private dataChannel: any = null;
    private config: WebRTCConfig;
    private remoteStream: MediaStream | null = null;
  
    constructor(config: WebRTCConfig) {
      this.config = config;
    }
  
    async connect() {
      try {
        // Configuración sin STUN/TURN (red local directa)
        const configuration = {
          iceServers: [],
        };
  
        this.peerConnection = new RTCPeerConnection(configuration);
  
        // Asignar callbacks directamente (API de react-native-webrtc)
        (this.peerConnection as any).ontrack = (event: any) => {
          console.log('📹 Track remoto recibido:', event.track?.kind);
          
          if (event.streams && event.streams[0]) {
            this.remoteStream = event.streams[0];
            if (this.config.onStreamReceived && this.remoteStream) {
              this.config.onStreamReceived(this.remoteStream);
            }
          }
        };
  
        (this.peerConnection as any).onconnectionstatechange = () => {
          const state = (this.peerConnection as any)?.connectionState || 'unknown';
          console.log('🔌 Estado de conexión:', state);
          
          if (this.config.onConnectionStateChange) {
            this.config.onConnectionStateChange(state);
          }
        };
  
        (this.peerConnection as any).onicecandidate = (event: any) => {
          if (event.candidate) {
            console.log('🧊 Candidato ICE:', event.candidate.candidate);
          }
        };
  
        // Crear DataChannel para comandos
        this.dataChannel = this.peerConnection.createDataChannel('commands', {
          ordered: true,
        });
  
        this.dataChannel.onopen = () => {
          console.log('📡 DataChannel abierto');
          this.sendPing();
        };
  
        this.dataChannel.onmessage = (event: any) => {
          try {
            const data = JSON.parse(event.data);
            console.log('📨 Mensaje recibido:', data);
            
            if (this.config.onDataChannelMessage) {
              this.config.onDataChannelMessage(data);
            }
  
            if (data.type === 'pong') {
              const latency = Date.now() - data.timestamp;
              console.log(`⏱️ Latencia: ${latency}ms`);
            }
          } catch (e) {
            console.error('Error parseando mensaje:', e);
          }
        };
  
        this.dataChannel.onclose = () => {
          console.log('📡 DataChannel cerrado');
        };
  
        this.dataChannel.onerror = (error: any) => {
          console.error('❌ Error en DataChannel:', error);
        };
  
        // Crear oferta
        const offer = await this.peerConnection.createOffer({
          offerToReceiveVideo: true,
          offerToReceiveAudio: false,
        });
  
        await this.peerConnection.setLocalDescription(offer);
        console.log('📤 Oferta creada, enviando al servidor...');
  
        // Enviar oferta al servidor
        const response = await fetch(`${this.config.serverUrl}/offer`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            sdp: offer.sdp,
            type: offer.type,
          }),
        });
  
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
  
        const answer = await response.json();
        console.log('📥 Respuesta recibida del servidor');
  
        // Establecer respuesta del servidor
        await this.peerConnection.setRemoteDescription(
          new RTCSessionDescription({
            type: answer.type,
            sdp: answer.sdp,
          })
        );
  
        console.log('✅ Conexión WebRTC establecida');
        return true;
      } catch (error) {
        console.error('❌ Error conectando WebRTC:', error);
        throw error;
      }
    }
  
    sendPing() {
      if (this.dataChannel && this.dataChannel.readyState === 'open') {
        const message = JSON.stringify({
          type: 'ping',
          timestamp: Date.now(),
        });
        this.dataChannel.send(message);
        console.log('🏓 Ping enviado');
      }
    }
  
    sendCommand(command: string, data?: any) {
      if (this.dataChannel && this.dataChannel.readyState === 'open') {
        const message = JSON.stringify({
          type: command,
          data: data,
          timestamp: Date.now(),
        });
        this.dataChannel.send(message);
        console.log('📤 Comando enviado:', command);
      } else {
        console.warn('⚠️ DataChannel no está listo');
      }
    }
  
    getRemoteStream(): MediaStream | null {
      return this.remoteStream;
    }
  
    async disconnect() {
      if (this.dataChannel) {
        this.dataChannel.close();
        this.dataChannel = null;
      }
  
      if (this.peerConnection) {
        this.peerConnection.close();
        this.peerConnection = null;
      }
  
      this.remoteStream = null;
      console.log('🔌 Desconectado de WebRTC');
    }
  }