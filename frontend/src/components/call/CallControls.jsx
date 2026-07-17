import { BiMicrophone, BiMicrophoneOff, BiVideo, BiVideoOff, BiPhoneOff, BiCamera } from 'react-icons/bi';

const CallControls = ({ isMuted, isVideoOff, onToggleMute, onToggleVideo, onEndCall, callType, onSwitchCamera }) => {
  return (
    <div className="flex items-center justify-center gap-6 bg-black px-4 py-6">
      <button
        onClick={onToggleMute}
        className={`flex h-14 w-14 items-center justify-center rounded-full shadow-lg transition-all duration-150 active:scale-[0.95] ${isMuted ? 'bg-red-500 text-white' : 'bg-white/20 text-white hover:bg-white/30'}`}
      >
        {isMuted ? <BiMicrophoneOff size={24} /> : <BiMicrophone size={24} />}
      </button>

      {callType === 'video' && (
        <>
          <button
            onClick={onToggleVideo}
            className={`flex h-14 w-14 items-center justify-center rounded-full shadow-lg transition-all duration-150 active:scale-[0.95] ${isVideoOff ? 'bg-red-500 text-white' : 'bg-white/20 text-white hover:bg-white/30'}`}
          >
            {isVideoOff ? <BiVideoOff size={24} /> : <BiVideo size={24} />}
          </button>
          <button
            onClick={onSwitchCamera}
            className="flex h-14 w-14 items-center justify-center rounded-full bg-white/20 text-white shadow-lg transition-all duration-150 hover:bg-white/30 active:scale-[0.95]"
          >
            <BiCamera size={24} />
          </button>
        </>
      )}

      <button
        onClick={onEndCall}
        className="flex h-16 w-16 items-center justify-center rounded-full bg-red-600 text-white shadow-lg transition-all duration-150 hover:bg-red-700 active:scale-[0.95] animate-pulse"
      >
        <BiPhoneOff size={28} />
      </button>
    </div>
  );
};

export default CallControls;
