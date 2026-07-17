import { useState, useEffect, useRef, useCallback } from 'react';
import { useSocket } from '../../context/SocketContext';
import { callAPI } from '../../services/api';
import CallControls from './CallControls';

const CallScreen = ({ call, onEnded }) => {
  const { socket, emit, on, off, setActiveCall } = useSocket();
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [remoteStream, setRemoteStream] = useState(null);
  const [localStream, setLocalStream] = useState(null);
  const [isConnecting, setIsConnecting] = useState(true);
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const peerRef = useRef(null);
  const durationRef = useRef(null);

  const configuration = {
    iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
  };

  const startLocalStream = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: call.callType === 'video'
      });
      setLocalStream(stream);
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
      return stream;
    } catch (err) {
      return null;
    }
  }, [call.callType]);

  const startCallDuration = useCallback(() => {
    durationRef.current = setInterval(() => {
      setCallDuration(prev => prev + 1);
    }, 1000);
  }, []);

  const cleanupCall = useCallback(() => {
    if (durationRef.current) clearInterval(durationRef.current);
    if (peerRef.current) {
      peerRef.current.close();
      peerRef.current = null;
    }
    if (localStream) {
      localStream.getTracks().forEach(t => t.stop());
    }
    if (remoteStream) {
      remoteStream.getTracks().forEach(t => t.stop());
    }
    setLocalStream(null);
    setRemoteStream(null);
    setActiveCall(null);
    if (onEnded) onEnded();
  }, [localStream, remoteStream, setActiveCall, onEnded]);

  useEffect(() => {
    let mounted = true;
    let peer = null;

    const initCall = async () => {
      const stream = await startLocalStream();
      if (!mounted) return;

      peer = new RTCPeerConnection(configuration);

      stream?.getTracks().forEach(track => peer.addTrack(track, stream));

      peer.ontrack = (event) => {
        if (!mounted) return;
        setRemoteStream(event.streams[0]);
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = event.streams[0];
        }
        setIsConnecting(false);
        startCallDuration();
      };

      peer.onicecandidate = (event) => {
        if (event.candidate && call.otherId) {
          emit('ice_candidate', { receiverId: call.otherId, candidate: event.candidate });
        }
      };

      peer.onconnectionstatechange = () => {
        if (!mounted) return;
        if (peer.connectionState === 'disconnected' || peer.connectionState === 'failed') {
          cleanupCall();
        }
      };

      peerRef.current = peer;

      if (!call.isReceiver) {
        const offer = await peer.createOffer();
        await peer.setLocalDescription(offer);
        emit('webrtc_offer', { receiverId: call.otherId, offer });
      }
    };

    initCall();

    const handleOffer = async ({ offer, senderId }) => {
      if (peer && call.isReceiver && senderId === call.otherId) {
        await peer.setRemoteDescription(new RTCSessionDescription(offer));
        const answer = await peer.createAnswer();
        await peer.setLocalDescription(answer);
        emit('webrtc_answer', { receiverId: senderId, answer });
      }
    };

    const handleAnswer = async ({ answer, senderId }) => {
      if (peer && !call.isReceiver && senderId === call.otherId) {
        await peer.setRemoteDescription(new RTCSessionDescription(answer));
      }
    };

    const handleIceCandidate = async ({ candidate, senderId }) => {
      if (peer && senderId === call.otherId && candidate) {
        try {
          await peer.addIceCandidate(new RTCIceCandidate(candidate));
        } catch (_) {}
      }
    };

    const handleCallEnded = () => {
      cleanupCall();
    };

    if (socket) {
      on('webrtc_offer', handleOffer);
      on('webrtc_answer', handleAnswer);
      on('ice_candidate', handleIceCandidate);
      on('call_ended', handleCallEnded);
    }

    return () => {
      mounted = false;
      if (peer) peer.close();
      if (socket) {
        off('webrtc_offer', handleOffer);
        off('webrtc_answer', handleAnswer);
        off('ice_candidate', handleIceCandidate);
        off('call_ended', handleCallEnded);
      }
      cleanupCall();
    };
  }, []);

  const handleToggleMute = () => {
    if (localStream) {
      localStream.getAudioTracks().forEach(t => {
        t.enabled = isMuted;
      });
      setIsMuted(!isMuted);
    }
  };

  const handleToggleVideo = () => {
    if (localStream) {
      localStream.getVideoTracks().forEach(t => {
        t.enabled = isVideoOff;
      });
      setIsVideoOff(!isVideoOff);
    }
  };

  const handleSwitchCamera = async () => {
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0];
      if (videoTrack) {
        const settings = videoTrack.getSettings();
        const newFacingMode = settings.facingMode === 'user' ? 'environment' : 'user';
        try {
          const newStream = await navigator.mediaDevices.getUserMedia({
            audio: true,
            video: { facingMode: newFacingMode }
          });
          const newVideoTrack = newStream.getVideoTracks()[0];
          const sender = peerRef.current?.getSenders().find(s => s.track?.kind === 'video');
          if (sender) {
            await sender.replaceTrack(newVideoTrack);
          }
          localStream.removeTrack(videoTrack);
          videoTrack.stop();
          localStream.addTrack(newVideoTrack);
          if (localVideoRef.current) {
            localVideoRef.current.srcObject = localStream;
          }
        } catch (_) {}
      }
    }
  };

  const handleEndCall = async () => {
    emit('end_call', {
      callId: call.callId,
      receiverId: call.otherId,
      duration: callDuration
    });
    try {
      await callAPI.endCall(call.callId, { duration: callDuration });
    } catch (_) {}
    cleanupCall();
  };

  const formatDuration = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black flex flex-col">
      <div className="flex-1 relative flex items-center justify-center bg-gray-900">
        {call.callType === 'video' && remoteStream ? (
          <video ref={remoteVideoRef} autoPlay playsInline className="w-full h-full object-cover" />
        ) : (
          <div className="text-center">
            <div className="text-8xl mb-4">🩸</div>
            <h2 className="text-white text-2xl font-bold">{call.otherName}</h2>
            <p className="text-gray-400 mt-2">{isConnecting ? 'Connecting...' : formatDuration(callDuration)}</p>
          </div>
        )}

        {call.callType === 'video' && (
          <div className="absolute bottom-24 right-4 w-32 h-44 rounded-xl overflow-hidden border-2 border-white/30 shadow-lg bg-gray-800">
            <video ref={localVideoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
          </div>
        )}
      </div>

      <CallControls
        isMuted={isMuted}
        isVideoOff={isVideoOff}
        onToggleMute={handleToggleMute}
        onToggleVideo={handleToggleVideo}
        onEndCall={handleEndCall}
        onSwitchCamera={handleSwitchCamera}
        callType={call.callType}
      />
    </div>
  );
};

export default CallScreen;
