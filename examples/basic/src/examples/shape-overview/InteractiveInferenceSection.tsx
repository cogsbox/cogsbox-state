// src/pages/shape/InteractiveInferenceSection.jsx

import { Sandpack } from '@codesandbox/sandpack-react';
import { atomDark } from '@codesandbox/sandpack-themes';

// Helper component
function SectionWrapper({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-[#1a1a1a] border border-gray-700/50 rounded-lg p-6 text-white">
      {children}
    </div>
  );
}

// The code is now a simple React component inside a .tsx file.
// This gives us the full power of TypeScript's language server.
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

export default function App() {
  type UserTypes = InferFromSchema<typeof finalUserSchema>;
  const newUser: UserTypes['Client'] = finalUserSchema.defaultValues;
  return <h1>Hover over 'newUser' to test!</h1>
}
`;

const sandboxPackageJson = JSON.stringify(
  {
    name: 'cogsbox-demo-environment',
    scripts: {
      start: 'vite', // The UNAMBIGUOUS command for this sandbox.
    },
    dependencies: {
      react: '^18.2.0',
      'react-dom': '^18.2.0',
      vite: '^4.3.9',
      'cogsbox-shape': 'latest', // Your REAL library as a dependency
      zod: 'latest',
    },
    devDependencies: {
      '@vitejs/plugin-react': '^4.0.0',
      typescript: '^5.0.4',
    },
  },
  null,
  2
);

export default function InteractiveInferenceSection() {
  return (
    <SectionWrapper>
      <h2 className="text-3xl font-bold text-gray-100 mb-2">
        🔮 Live Type Inference
      </h2>
      <div className="prose prose-invert max-w-none mb-6">
        <p className="text-gray-300 leading-relaxed">
          The editor below fetches the live{' '}
          <code className="text-orange-400">cogsbox-shape</code> package from
          NPM and runs it in a fully-featured TypeScript environment.
        </p>
        <p className="font-semibold text-orange-400">
          Instructions: Hover your mouse over the `newUser` variable in the code
          to see its complete, inferred type.
        </p>
      </div>

      <Sandpack
        template="react-ts" // This template uses Vite under the hood
        theme={atomDark}
        files={{
          // Provide our App code as the main file
          '/App.tsx': {
            code: exampleCode,
            active: true,
          },
          // Provide our own package.json to override any defaults
          '/package.json': {
            code: sandboxPackageJson,
            hidden: true, // Hide it from the user
          },
        }}
        // We no longer need customSetup.dependencies because they are in our package.json
        options={{
          editorHeight: '650px',
          showTabs: true,
          showLineNumbers: true,
          editorWidthPercentage: 60,
        }}
      />
    </SectionWrapper>
  );
}
