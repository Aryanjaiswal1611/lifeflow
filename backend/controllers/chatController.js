const Conversation = require('../models/Conversation');
const Message = require('../models/Message');

const createOrGetConversation = async (req, res) => {
  try {
    const { participantId, requestId } = req.body;
    if (!participantId) {
      return res.status(400).json({ message: 'Participant ID required' });
    }

    const userIds = [req.user._id, participantId].sort();

    let conversation = await Conversation.findOne({
      participants: { $all: userIds, $size: 2 }
    }).populate('participants', 'name email role');

    if (!conversation) {
      conversation = await Conversation.create({
        participants: userIds,
        requestId: requestId || null
      });
      conversation = await conversation.populate('participants', 'name email role');
    }

    res.json(conversation);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getConversations = async (req, res) => {
  try {
    const conversations = await Conversation.find({
      participants: req.user._id
    })
      .populate('participants', 'name email role')
      .populate('lastMessage.sender', 'name')
      .sort({ 'lastMessage.timestamp': -1, updatedAt: -1 });

    res.json(conversations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getMessages = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const conversation = await Conversation.findById(conversationId);

    if (!conversation) {
      return res.status(404).json({ message: 'Conversation not found' });
    }

    const isParticipant = conversation.participants.some(
      p => p.toString() === req.user._id.toString()
    );
    if (!isParticipant) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const messages = await Message.find({ conversation: conversationId })
      .populate('sender', 'name email')
      .sort({ createdAt: 1 });

    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const sendMessage = async (req, res) => {
  try {
    const { conversationId, text, messageType, fileUrl } = req.body;

    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({ message: 'Conversation not found' });
    }

    const isParticipant = conversation.participants.some(
      p => p.toString() === req.user._id.toString()
    );
    if (!isParticipant) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const message = await Message.create({
      conversation: conversationId,
      sender: req.user._id,
      text: text || '',
      messageType: messageType || 'text',
      fileUrl: fileUrl || ''
    });

    conversation.lastMessage = {
      text: text || (messageType === 'image' ? 'Image' : 'File'),
      sender: req.user._id,
      timestamp: new Date()
    };
    await conversation.save();

    const populated = await message.populate('sender', 'name email');

    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const markAsRead = async (req, res) => {
  try {
    const { conversationId } = req.params;

    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({ message: 'Conversation not found' });
    }

    await Message.updateMany(
      { conversation: conversationId, sender: { $ne: req.user._id }, seen: false },
      { seen: true, seenAt: new Date() }
    );

    res.json({ message: 'Messages marked as read' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { createOrGetConversation, getConversations, getMessages, sendMessage, markAsRead };
