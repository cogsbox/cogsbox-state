// src/pages/shape/ShapeOverview.jsx

import SyntaxHighlighter from 'react-syntax-highlighter';
import { atomOneDark } from 'react-syntax-highlighter/dist/esm/styles/hljs';
import InteractiveInferenceSection from './InteractiveInferenceSection';

// Helper Components (You can move these to a shared file)
function SectionWrapper({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-[#1a1a1a] border border-gray-700/50 rounded-lg p-6 text-white">
      {children}
    </div>
  );
}

function CodeSnippetDisplay({ title, code }: { title?: string; code: string }) {
  return (
    <div className="mt-4">
      {title && (
        <h4 className="text-gray-400 text-sm font-semibold mb-2 uppercase tracking-wider">
          {title}
        </h4>
      )}
      <div className="bg-gray-950 rounded-lg overflow-hidden border border-gray-800">
        <SyntaxHighlighter
          language={'javascript'}
          style={atomOneDark}
          customStyle={{
            backgroundColor: 'transparent',
            fontSize: '13px',
            padding: '1rem',
            margin: 0,
          }}
        >
          {code.trim()}
        </SyntaxHighlighter>
      </div>
    </div>
  );
}

// --- Content Sections ---

function IntroSection() {
  return (
    <SectionWrapper>
      <h2 className="text-3xl font-bold text-gray-100 mb-6">
        📦 cogsbox-shape
      </h2>
      <div className="prose prose-invert max-w-none">
        <p className="text-lg text-gray-300 leading-relaxed">
          <strong className="text-orange-400">cogsbox-shape</strong> is a
          powerful schema builder designed to create a single source of truth
          for your data models. It bridges the gap between your database, your
          client-side application, and your validation logic using a fluent,
          type-safe API.
        </p>
        <p className="text-gray-300 leading-relaxed">
          Define your schema once and get automatically inferred types and
          schemas for every layer of your stack.
        </p>
      </div>
    </SectionWrapper>
  );
}

function BuilderChainSection() {
  return (
    <SectionWrapper>
      <h2 className="text-3xl font-bold text-gray-100 mb-6">
        🔗 The Fluent Builder Chain
      </h2>
      <div className="prose prose-invert max-w-none mb-4">
        <p className="text-gray-300 leading-relaxed">
          Every field is defined using the `s` helper, which kicks off a
          chainable builder. This allows you to layer on types and behaviors for
          different contexts.
        </p>
      </div>
      <CodeSnippetDisplay
        title="Example: Defining a complex 'status' field"
        code={`
import { s } from './schema';
import { z } from 'zod';

const statusField = s.sql({ type: 'int' }) // 1. Base SQL type is an integer (e.g., 0 or 1)
  
  // 2. Define a default value when creating new records
  .initialState<'active' | 'inactive'>('inactive') 
  
  // 3. Define the type for the client (e.g., a React component)
  .client(() => z.enum(['active', 'inactive'])) 
  
  // 4. Add validation rules (can be used on server or client)
  .validation(({ client }) => client.refine(val => val === 'active', {
    message: "Status must be active to proceed",
  }));
        `}
      />
    </SectionWrapper>
  );
}

function TransformSection() {
  return (
    <SectionWrapper>
      <h2 className="text-3xl font-bold text-gray-100 mb-6">
        🔄 Bridging the Gap with Transformations
      </h2>
      <div className="prose prose-invert max-w-none mb-4">
        <p className="text-gray-300 leading-relaxed">
          Often, the way you store data in your database differs from how you
          want to use it in your UI. The `.transform()` method creates a two-way
          binding between your SQL and Client types.
        </p>
      </div>
      <CodeSnippetDisplay
        title="Example: Mapping an integer status to a string"
        code={`
const statusFieldWithTransform = s
  .sql({ type: 'int' }) // DB stores 0 or 1
  .client(() => z.enum(['inactive', 'active'])) // Client uses strings
  .transform({
    // How to convert from database (number) to client (string)
    toClient: (dbValue) => (dbValue === 1 ? 'active' : 'inactive'),
    
    // How to convert from client (string) back to database (number)
    toDb: (clientValue) => (clientValue === 'active' ? 1 : 0),
  });
        `}
      />
    </SectionWrapper>
  );
}

function RelationsSection() {
  return (
    <SectionWrapper>
      <h2 className="text-3xl font-bold text-gray-100 mb-6">
        🤝 Defining Data Relationships
      </h2>
      <div className="prose prose-invert max-w-none mb-4">
        <p className="text-gray-300 leading-relaxed">
          Schemas can be linked together using `schemaRelations`. This allows
          you to define `hasMany`, `hasOne`, and `reference` (belongsTo)
          relationships, which are then reflected in the inferred types.
        </p>
      </div>
      <CodeSnippetDisplay
        title="Example: Users and Posts"
        code={`
// 1. Define base schemas first, without relations
const userSchema = schema({
  _tableName: 'users',
  id: s.sql({ type: 'int', pk: true }),
  name: s.sql({ type: 'varchar' }),
});

const postSchema = schema({
  _tableName: 'posts',
  id: s.sql({ type: 'int', pk: true }),
  title: s.sql({ type: 'varchar' }),
});

// 2. Define relations in a separate step
const postSchemaRels = schemaRelations(postSchema, (s) => ({
    // A post has a reference to a user's ID
    authorId: s.reference(() => userSchema.id),
}));

const userSchemaRels = schemaRelations(userSchema, (s) => ({
    // A user has many posts
    posts: s.hasMany({
        fromKey: 'id',
        toKey: () => postSchemaRels.authorId,
    }),
}));

// 3. Combine them using createSchema
const finalUserSchema = createSchema(userSchema, userSchemaRels);
const finalPostSchema = createSchema(postSchema, postSchemaRels);
        `}
      />
    </SectionWrapper>
  );
}

function InferenceSection() {
  return (
    <SectionWrapper>
      <h2 className="text-3xl font-bold text-gray-100 mb-6">
        🔮 The Payoff: Automatic Type Inference
      </h2>
      <div className="prose prose-invert max-w-none mb-4">
        <p className="text-gray-300 leading-relaxed">
          The ultimate goal of `cogsbox-shape` is to do the work for you. After
          defining your schemas, use the `InferFromSchema` utility to get
          fully-typed Zod schemas and TypeScript types for every layer.
        </p>
      </div>
      <CodeSnippetDisplay
        title="Example: Extracting all types from the final schema"
        code={`
import { type InferFromSchema } from './schema';

// Assuming 'finalUserSchema' is the combined schema from the relations example
type UserTypes = InferFromSchema<typeof finalUserSchema>;

// Now you have access to everything:

// UserTypes.Sql gives you the type for a raw database row.
// { id: number; name: string; }

// UserTypes.Client gives you the type for the UI, including relations.
// { id: number; name: string; posts: { id: number; title: string; authorId: number; }[]; }

// UserTypes.Defaults gives you a typed object perfect for creating new records.
// { id: 0, name: "", posts: [] }

// UserTypes.SqlSchema is the Zod schema for server-side validation.
// UserTypes.ClientSchema is the Zod schema for client-side validation.
        `}
      />
    </SectionWrapper>
  );
}

// --- Main Component ---
export default function ShapeOverview() {
  return (
    <div className="flex-1 flex flex-col gap-8">
      <IntroSection />
      <BuilderChainSection />
      <TransformSection />
      <RelationsSection /> <InteractiveInferenceSection />
      <InferenceSection />
      <div className="h-20" />
    </div>
  );
}
