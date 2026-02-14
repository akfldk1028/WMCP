import type { DescriptionTemplate } from './types.js';

export const DESCRIPTION_TEMPLATES: DescriptionTemplate[] = [
  // CRUD operations
  {
    pattern: 'create|add|new|insert|post',
    category: 'crud',
    template: 'Create a new {resource}. Required: {required_fields}. Returns: {return_type}.',
    example: 'Create a new user account. Required: email, password, name. Returns: user object with ID.',
  },
  {
    pattern: 'read|get|fetch|retrieve|list|show',
    category: 'crud',
    template: 'Retrieve {resource} by {identifier}. Returns: {return_type}. Returns empty if not found.',
    example: 'Retrieve user profile by user ID. Returns: user object with name, email, avatar. Returns empty if not found.',
  },
  {
    pattern: 'update|edit|modify|patch|put',
    category: 'crud',
    template: 'Update {resource} {identifier}. Modifiable fields: {fields}. Returns: updated {resource}.',
    example: 'Update user profile by user ID. Modifiable fields: name, avatar, bio. Returns: updated user object.',
  },
  {
    pattern: 'delete|remove|destroy|drop',
    category: 'crud',
    template: 'Permanently delete {resource} by {identifier}. This action cannot be undone. Returns: confirmation.',
    example: 'Permanently delete a blog post by post ID. This action cannot be undone. Returns: deletion confirmation.',
  },
  // Search
  {
    pattern: 'search|find|query|lookup|filter',
    category: 'search',
    template: 'Search for {resource} matching {criteria}. Supports: {filters}. Returns: paginated list of {resource}.',
    example: 'Search for products matching keywords. Supports: category, price range, rating. Returns: paginated list of products.',
  },
  // Transform
  {
    pattern: 'convert|transform|format|parse|encode|decode',
    category: 'transform',
    template: 'Convert {input_type} to {output_type}. Input: {input_desc}. Output: {output_desc}.',
    example: 'Convert Markdown to HTML. Input: markdown string. Output: sanitized HTML string.',
  },
  // Navigation
  {
    pattern: 'navigate|goto|open|redirect|visit',
    category: 'navigate',
    template: 'Navigate to {destination}. Parameters: {params}. Side effects: {effects}.',
    example: 'Navigate to product detail page. Parameters: product ID. Side effects: updates browser URL.',
  },
  // Auth
  {
    pattern: 'login|logout|auth|signin|signup|register',
    category: 'auth',
    template: '{action} user authentication. Required: {credentials}. Returns: {session_info}. Security: {security_notes}.',
    example: 'Login user authentication. Required: email, password. Returns: session token. Security: rate-limited to 5 attempts.',
  },
];

export interface OptimizationRule {
  id: string;
  check: (desc: string) => boolean;
  fix: string;
  weight: number;
}

export const OPTIMIZATION_RULES: OptimizationRule[] = [
  {
    id: 'action_verb',
    check: (desc: string) =>
      !/^(Create|Read|Get|Update|Delete|Search|Convert|Navigate|Submit|Login|Logout|List|Fetch|Send|Check|Validate|Calculate|Generate|Download|Upload|Process|Analyze|Compare|Sort|Filter|Export|Import)/i.test(desc),
    fix: 'Start with a strong action verb',
    weight: 0.25,
  },
  {
    id: 'length',
    check: (desc: string) => desc.length < 20 || desc.length > 200,
    fix: 'Keep between 20-200 characters',
    weight: 0.15,
  },
  {
    id: 'return_type',
    check: (desc: string) => !/returns?:?\s/i.test(desc),
    fix: 'Specify what the tool returns',
    weight: 0.20,
  },
  {
    id: 'input_hint',
    check: (desc: string) => !/required|input|parameter|accepts?/i.test(desc),
    fix: 'Mention required inputs',
    weight: 0.15,
  },
  {
    id: 'constraints',
    check: (desc: string) => !/limit|max|only|must|cannot|restricted/i.test(desc),
    fix: 'Add constraints or limitations',
    weight: 0.10,
  },
  {
    id: 'no_jargon',
    check: (desc: string) => /(?:utilize|leverage|facilitate|synerg)/i.test(desc),
    fix: 'Use simple, direct language',
    weight: 0.15,
  },
];
