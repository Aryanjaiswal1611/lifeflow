import { useSocket } from '../../context/SocketContext';
import { BiPhoneCall, BiX } from 'react-icons/bi';

const CallPopup = () => {
  const { incomingCall, setIncomingCall, emit, setActiveCall } = useSocket();

  if (!incomingCall) return null;

  const handleAccept = () => {
    emit('accept_call', { callId: incomingCall.callId, callerId: incomingCall.callerId });
    setActiveCall({
      callId: incomingCall.callId,
      otherId: incomingCall.callerId,
      otherName: incomingCall.callerName,
      callType: incomingCall.callType,
      status: 'connecting',
      isReceiver: true
    });
    setIncomingCall(null);
  };

  const handleReject = () => {
    emit('reject_call', { callId: incomingCall.callId, callerId: incomingCall.callerId });
    setIncomingCall(null);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60">
      <div className="mx-4 w-full max-w-sm animate-bounce-in rounded-2xl bg-white p-8 text-center shadow-2xl dark:bg-gray-800">
        <div className={`mb-4 text-6xl ${incomingCall.callType === 'video' ? '' : 'animate-pulse'}`}>
          {incomingCall.callType === 'video' ? '📹' : '📞'}
        </div>
        <h3 className="mb-1 text-xl font-bold text-gray-900 dark:text-white">Incoming {incomingCall.callType} call</h3>
        <p className="mb-6 text-lg text-gray-600 dark:text-gray-300">{incomingCall.callerName}</p>
        <div className="flex justify-center gap-6">
          <button onClick={handleReject} className="flex h-16 w-16 items-center justify-center rounded-full bg-red-500 text-white shadow-lg transition-all duration-150 hover:bg-red-600 active:scale-[0.95]">
            <BiX size={28} />
          </button>
          <button onClick={handleAccept} className="flex h-16 w-16 items-center justify-center rounded-full bg-green-500 text-white shadow-lg transition-all duration-150 hover:bg-green-600 active:scale-[0.95] animate-pulse">
            <BiPhoneCall size={28} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default CallPopup;
