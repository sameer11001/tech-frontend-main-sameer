export class TemplateConstants {
  // Categories
  static readonly CATEGORIES = ['Marketing', 'Authentication', 'Utility'] as const;
  static readonly CATEGORY_TYPES = {
    MARKETING: 'MARKETING',
    AUTHENTICATION: 'AUTHENTICATION',
    UTILITY: 'UTILITY'
  } as const;

  // Broadcast options
  static readonly BROADCAST_OPTIONS = ['None', 'Text', 'Image', 'Video', 'Document'] as const;
  static readonly BROADCAST_TYPES = {
    NONE: 'None',
    TEXT: 'Text',
    IMAGE: 'Image',
    VIDEO: 'Video',
    DOCUMENT: 'Document'
  } as const;

  // Button types
  static readonly BUTTON_TYPES = ['Website', 'Call Phone', 'Copy Offer', 'Quick Reply'] as const;
  static readonly BUTTON_TYPE_VALUES = {
    WEBSITE: 'Website',
    CALL_PHONE: 'Call Phone',
    COPY_OFFER: 'Copy Offer',
    QUICK_REPLY: 'Quick Reply'
  } as const;

  // Media constraints
  static readonly MAX_FILE_SIZE = 16 * 1024 * 1024; // 16MB
  static readonly MAX_QUICK_REPLY_BUTTONS = 4;

  // Media types
  static readonly ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
  static readonly ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/3gpp'];
  static readonly ALLOWED_DOCUMENT_TYPES = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ];

  // Language mappings
  static readonly LANGUAGE_MAP: { [key: string]: string } = {
    'ar': 'ar_EG',
    'en': 'en_US',
    'es': 'es_ES',
    'fr': 'fr_FR',
    'de': 'de_DE'
  };

  // Form validation patterns
  static readonly TEMPLATE_NAME_PATTERN = /^[a-zA-Z0-9_]+$/;
} 