const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Message = require('../models/Message');
const Conversation = require('../models/Conversation');
const CallHistory = require('../models/CallHistory');

const onlineUsers = new Map();

const setupSocket = (io) => {
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) {
        return next(new Error('Authentication required'));
      }
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id);
      if (!user) {
        return next(new Error('User not found'));
      }
      socket.userId = user._id.toString();
      socket.user = user;
      next();
    } catch (error) {
      next(new Error('Authentication failed'));
    }
  });

  io.on('connection', (socket) => {
    const userId = socket.userId;
    onlineUsers.set(userId, socket.id);
    io.emit('online_users', Array.from(onlineUsers.keys()));

    socket.join(`user:${userId}`);

    socket.on('join_conversation', (conversationId) => {
      socket.join(`conversation:${conversationId}`);
    });

    socket.on('leave_conversation', (conversationId) => {
      socket.leave(`conversation:${conversationId}`);
    });

    socket.on('send_message', async (data, callback) => {
      try {
        const { conversationId, text, messageType, fileUrl } = data;

        const conversation = await Conversation.findById(conversationId);
        if (!conversation) {
          if (callback) callback({ error: 'Conversation not found' });
          return;
        }

        const isParticipant = conversation.participants.some(
          p => p.toString() === userId
        );
        if (!isParticipant) {
          if (callback) callback({ error: 'Not authorized' });
          return;
        }

        const message = await Message.create({
          conversation: conversationId,
          sender: userId,
          text: text || '',
          messageType: messageType || 'text',
          fileUrl: fileUrl || ''
        });

        const populated = await message.populate('sender', 'name email');

        conversation.lastMessage = {
          text: text || (messageType === 'image' ? '📷 Image' : '📎 File'),
          sender: userId,
          timestamp: new Date()
        };
        await conversation.save();

        io.to(`conversation:${conversationId}`).emit('new_message', populated);

        const receiverId = conversation.participants.find(
          p => p.toString() !== userId
        );
        if (receiverId) {
          const receiverSocketId = onlineUsers.get(receiverId.toString());
          if (receiverSocketId) {
            io.to(receiverSocketId).emit('notification', {
              type: 'message',
              title: socket.user.name,
              message: text || (messageType === 'image' ? 'Sent an image' : 'Sent a file'),
              conversationId
            });
          }
        }

        if (callback) callback({ success: true, message: populated });
      } catch (error) {
        if (callback) callback({ error: error.message });
      }
    });

    socket.on('typing_start', (conversationId) => {
      socket.to(`conversation:${conversationId}`).emit('typing', {
        conversationId,
        userId,
        name: socket.user.name
      });
    });

    socket.on('typing_stop', (conversationId) => {
      socket.to(`conversation:${conversationId}`).emit('stop_typing', {
        conversationId,
        userId
      });
    });

    socket.on('mark_seen', async (conversationId) => {
      try {
        await Message.updateMany(
          { conversation: conversationId, sender: { $ne: userId }, seen: false },
          { seen: true, seenAt: new Date() }
        );
        socket.to(`conversation:${conversationId}`).emit('messages_seen', {
          conversationId,
          userId
        });
      } catch (_) {}
    });

    socket.on('call_user', async (data, callback) => {
      try {
        const { receiverId, callType } = data;
        const receiverSocketId = onlineUsers.get(receiverId);

        if (!receiverSocketId) {
          await CallHistory.create({
            caller: userId,
            receiver: receiverId,
            callType,
            status: 'missed'
          });
          if (callback) callback({ error: 'User is offline' });
          return;
        }

        const call = await CallHistory.create({
          caller: userId,
          receiver: receiverId,
          callType,
          status: 'ongoing'
        });

        io.to(receiverSocketId).emit('call_request', {
          callId: call._id,
          callerId: userId,
          callerName: socket.user.name,
          callType
        });

        if (callback) callback({ success: true, callId: call._id });
      } catch (error) {
        if (callback) callback({ error: error.message });
      }
    });

    socket.on('accept_call', async (data, callback) => {
      try {
        const { callId, callerId } = data;
        const callerSocketId = onlineUsers.get(callerId);

        await CallHistory.findByIdAndUpdate(callId, { status: 'ongoing' });

        if (callerSocketId) {
          io.to(callerSocketId).emit('call_accepted', {
            callId,
            receiverId: userId,
            receiverName: socket.user.name
          });
        }

        if (callback) callback({ success: true });
      } catch (error) {
        if (callback) callback({ error: error.message });
      }
    });

    socket.on('reject_call', async (data, callback) => {
      try {
        const { callId, callerId } = data;
        const callerSocketId = onlineUsers.get(callerId);

        await CallHistory.findByIdAndUpdate(callId, { status: 'rejected', endedAt: new Date() });

        if (callerSocketId) {
          io.to(callerSocketId).emit('call_rejected', {
            callId,
            receiverId: userId
          });
        }

        if (callback) callback({ success: true });
      } catch (error) {
        if (callback) callback({ error: error.message });
      }
    });

    socket.on('end_call', async (data, callback) => {
      try {
        const { callId, receiverId, duration } = data;
        const receiverSocketId = onlineUsers.get(receiverId);

        await CallHistory.findByIdAndUpdate(callId, {
          status: 'completed',
          duration: duration || 0,
          endedAt: new Date()
        });

        if (receiverSocketId) {
          io.to(receiverSocketId).emit('call_ended', { callId, duration });
        }

        if (callback) callback({ success: true });
      } catch (error) {
        if (callback) callback({ error: error.message });
      }
    });

    socket.on('webrtc_offer', (data) => {
      const { receiverId, offer } = data;
      const receiverSocketId = onlineUsers.get(receiverId);
      if (receiverSocketId) {
        io.to(receiverSocketId).emit('webrtc_offer', { offer, senderId: userId });
      }
    });

    socket.on('webrtc_answer', (data) => {
      const { receiverId, answer } = data;
      const receiverSocketId = onlineUsers.get(receiverId);
      if (receiverSocketId) {
        io.to(receiverSocketId).emit('webrtc_answer', { answer, senderId: userId });
      }
    });

    socket.on('ice_candidate', (data) => {
      const { receiverId, candidate } = data;
      const receiverSocketId = onlineUsers.get(receiverId);
      if (receiverSocketId) {
        io.to(receiverSocketId).emit('ice_candidate', { candidate, senderId: userId });
      }
    });

    socket.on('disconnect', () => {
      onlineUsers.delete(userId);
      io.emit('online_users', Array.from(onlineUsers.keys()));
    });
  });
};

module.exports = { setupSocket, onlineUsers };
