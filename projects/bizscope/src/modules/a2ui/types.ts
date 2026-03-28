export interface A2UIDataRef {
  $ref: string;
}

export interface A2UIComponent {
  id: string;
  component: string;
  child?: string;
  children?: string[];
  [key: string]: unknown;
}

export interface A2UISurface {
  surfaceId: string;
  catalog?: string;
  components: Map<string, A2UIComponent>;
  dataModel: Record<string, unknown>;
}

export interface A2UIUpdateComponents {
  surfaceId: string;
  components: A2UIComponent[];
}

export interface A2UIUpdateDataModel {
  surfaceId: string;
  data: Record<string, unknown>;
}

export interface A2UIMessage {
  version: 'v0.9';
  createSurface?: {
    surfaceId: string;
    catalog?: string;
  };
  updateComponents?: A2UIUpdateComponents;
  updateDataModel?: A2UIUpdateDataModel;
  deleteSurface?: {
    surfaceId: string;
  };
}

export interface A2UICatalogEntry {
  component: string;
  description: string;
  props: Record<string, {
    type: 'string' | 'number' | 'boolean' | 'object' | 'array';
    required?: boolean;
    description?: string;
  }>;
}

export interface A2UICatalog {
  name: string;
  version: string;
  components: A2UICatalogEntry[];
}

export interface A2UIEvent {
  type: 'action' | 'change';
  surfaceId: string;
  componentId: string;
  name?: string;
  value?: unknown;
}
