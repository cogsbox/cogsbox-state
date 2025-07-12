// src/pages/shape/InteractiveInferenceSection.jsx

import { Sandpack } from '@codesandbox/sandpack-react';
import { atomDark } from '@codesandbox/sandpack-themes';

// Helper component (can be moved to a shared file)
function SectionWrapper({ children }) {
  return (
    <div className="bg-[#1a1a1a] border border-gray-700/50 rounded-lg p-6 text-white">
      {children}
    </div>
  );
}

// Define the example code that will run in the sandbox.
// It now imports directly from "cogsbox-shape".
const exampleCode = `
import { z } from "zod";
import { schema, s, createSchema, schemaRelations, InferFromSchema } from "cogsbox-shape";

// --- 1. Define Schemas ---
const userSchema = schema({
  _tableName: "users",
  id: s.sql({ type: "int", pk: true }).initialState(() => 0),
  name: s.sql({ type: "varchar" }).initialState(""),
  status: s
    .sql({ type: "int" }) // DB: 0 | 1
    .client(() => z.enum(["inactive", "active"]))
    .transform({
      toClient: (db) => (db === 1 ? "active" : "inactive"),
      toDb: (client) => (client === "active" ? 1 : 0),
    }),
});

const postSchema = schema({
  _tableName: "posts",
  id: s.sql({ type: "int", pk: true }),
  title: s.sql({ type: "varchar" }),
});

// --- 2. Define Relations ---
const postSchemaWithRels = schemaRelations(postSchema, (s) => ({
  authorId: s.reference(() => userSchema.id),
}));

const userSchemaWithRels = schemaRelations(userSchema, (s) => ({
  posts: s.hasMany({
    fromKey: "id",
    toKey: () => postSchemaWithRels.authorId,
    defaultCount: 1,
  }),
}));

// --- 3. Create Final Schemas ---
const finalUserSchema = createSchema(userSchema, userSchemaWithRels);

// --- 4. INFER ALL TYPES! ---
type UserTypes = InferFromSchema<typeof finalUserSchema>;

// HOVER OVER THE VARIABLES BELOW TO SEE THE INFERRED TYPES!

// This \`newUser\` object is fully typed based on your schema.
const newUser: UserTypes['Client'] = finalUserSchema.defaultValues;

// This is the type for a raw database record.
const dbUser: UserTypes['Sql'] = {
  id: 123,
  name: 'John Doe',
  status: 1,
  posts: [] // 'posts' would be loaded separately
}

console.log('Client-side default user object:', newUser);
`;

export default function InteractiveInferenceSection() {
  return (
    <SectionWrapper>
      <h2 className="text-3xl font-bold text-gray-100 mb-2">
        🔮 The Payoff: Live Type Inference
      </h2>
      <div className="prose prose-invert max-w-none mb-6">
        <p className="text-gray-300 leading-relaxed">
          The ultimate goal of `cogsbox-shape` is to do the work for you. The editor below fetches the live <code className="text-orange-400">cogsbox-shape</code> package from NPM and runs it in a sandboxed environment.
        </p>
        <p className="font-semibold text-orange-400">
          Instructions: Inside the editor, hover your mouse over the `newUser` or `dbUser` variables to see TypeScript's fully inferred types in action.
        </p>
      </div>

      <Sandpack
        template="react-ts"
        theme={atomDark}
        files={{
          // The code that uses your library
          '/index.js': {
            code: exampleCode,
            active: true,
          },
        }}
        customSetup={{
          // --- THIS IS THE CRITICAL PART ---
          // Sandpack will now run `npm install` for these packages.
          dependencies: {
            'cogsbox-shape': 'latest', // Or a specific version e.g., "0.1.2"
            'zod': 'latest',
          },
        }}
        options={{
          editorHeight: '600px',
          showTabs: true,
          showLineNumbers: true,
          editorWidthPercentage: 60, // Give more room to the code
        }}
      />
    </SectionWrapper>
  );
}