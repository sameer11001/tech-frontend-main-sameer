export type FlowNodeType = "message" | "question" | "interactive_buttons";

export interface Position {
  x: number;
  y: number;
}

export interface ContentItem {
  type: 'text' | 'image' | 'video' | 'audio' | 'document';
  order: number;
  content: {
    text_body?: string;
    file_name?: string;
    bytes?: string;
    mime_type?: string;
    preview_url?: string;
  };
}

export interface InteractiveButton {
  type: 'reply';
  reply?: {
    id: string;
    title: string;
    nextNodeId?: string;
  };
}

export interface InteractiveHeader {
  type: 'text' | 'media' | undefined;
  text?: string;
  media?: any;
}

export interface InteractiveFooter {
  text: string;
}

export interface InteractiveAction {
  buttons?: InteractiveButton[];
  button?: string;
  sections?: any[];
}

export interface DynamicFlowNodeBody {
  bodyMessage?: {
    content_items: ContentItem[];
  };
  bodyQuestion?: {
    question_text: string;
    answer_variant: string;
    accept_media_response: boolean;
    save_to_variable: boolean;
    variable_name?: string;
  };
  bodyButton?: {
    type: 'button';
    header?: InteractiveHeader;
    body: {
      text: string;
    };
    footer?: InteractiveFooter;
    action: InteractiveAction;
  };
}

export interface Node {
  id: string;
  type: FlowNodeType;
  title: string;
  body: DynamicFlowNodeBody;
  position: { x: number; y: number };
  children: Node[];
  parents?: Node[];
  parent: Node | null;
  isFirst: boolean;
  isFinal: boolean;
  nextNodes?: string | null;
  buttonConnections?: { [buttonIndex: number]: string }; 
}
