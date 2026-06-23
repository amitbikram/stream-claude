#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import { z } from 'zod';
import { handleShowBlogWizard, ShowBlogWizardSchema } from './tools.js';

const server = new Server(
  { name: 'peregrine-mcp-app', version: '0.2.0' },
  { capabilities: { tools: {} } },
);

const TOOLS = [
  {
    name: 'show_blog_wizard',
    description:
      'Render the AI-powered blog wizard inline in chat as an interactive UI resource. ' +
      'Call this whenever you need to display or update the wizard — including the initial ' +
      "open (no args), after Stream-MCP's `generate_blog_brief` returns (pass the brief), " +
      "and after Stream-MCP's `create_blog_from_brief` returns (pass items + url + app_url). " +
      'Always include the FULL state object on every re-render so the user can navigate back ' +
      'through completed steps without losing data.',
    inputSchema: zodToJsonSchema(ShowBlogWizardSchema),
    handler: (args: unknown) => handleShowBlogWizard(ShowBlogWizardSchema.parse(args ?? {})),
  },
] as const;

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: TOOLS.map(t => ({ name: t.name, description: t.description, inputSchema: t.inputSchema })),
}));

server.setRequestHandler(CallToolRequestSchema, async (req) => {
  const tool = TOOLS.find(t => t.name === req.params.name);
  if (!tool) {
    return { isError: true, content: [{ type: 'text', text: `Unknown tool: ${req.params.name}` }] };
  }
  try {
    return await tool.handler(req.params.arguments ?? {});
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return { isError: true, content: [{ type: 'text', text: `Tool ${tool.name} failed: ${message}` }] };
  }
});

// Minimal zod → JSON Schema conversion sufficient for our flat object inputs.
function zodToJsonSchema(schema: z.ZodTypeAny): Record<string, unknown> {
  if (schema instanceof z.ZodObject) {
    const shape = (schema as z.ZodObject<z.ZodRawShape>).shape;
    const properties: Record<string, unknown> = {};
    const required: string[] = [];
    for (const [key, value] of Object.entries(shape)) {
      const fieldSchema = value as z.ZodTypeAny;
      properties[key] = zodFieldToJsonSchema(fieldSchema);
      if (!fieldSchema.isOptional()) required.push(key);
    }
    const out: Record<string, unknown> = { type: 'object', properties };
    if (required.length) out.required = required;
    return out;
  }
  return { type: 'object' };
}

function zodFieldToJsonSchema(schema: z.ZodTypeAny): Record<string, unknown> {
  if (schema instanceof z.ZodDefault) return zodFieldToJsonSchema((schema as z.ZodDefault<z.ZodTypeAny>)._def.innerType);
  if (schema instanceof z.ZodOptional) return zodFieldToJsonSchema((schema as z.ZodOptional<z.ZodTypeAny>)._def.innerType);
  if (schema instanceof z.ZodString) return { type: 'string' };
  if (schema instanceof z.ZodNumber) return { type: 'number' };
  if (schema instanceof z.ZodBoolean) return { type: 'boolean' };
  if (schema instanceof z.ZodEnum) return { type: 'string', enum: (schema as z.ZodEnum<[string, ...string[]]>).options };
  if (schema instanceof z.ZodArray) return { type: 'array', items: zodFieldToJsonSchema((schema as z.ZodArray<z.ZodTypeAny>)._def.type) };
  if (schema instanceof z.ZodObject) return zodToJsonSchema(schema);
  return {};
}

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('peregrine-mcp-app listening on stdio');
}

main().catch(err => {
  console.error('Fatal server error:', err);
  process.exit(1);
});
