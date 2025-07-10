export default function AboutMe() {
  return (
    <div className="w-full min-h-screen bg-[#1a1a1a]/70 relative overflow-hidden">
      {/* Dot Pattern Background - Subtle */}
      <div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage:
            'radial-gradient(circle at 1px 1px, #4a5568 1px, transparent 1px)',
          backgroundSize: '20px 20px',
        }}
      />
      <div
        className="absolute top-0 left-0 right-0 h-[500px] opacity-10"
        style={{
          backgroundImage:
            'radial-gradient(circle at 1px 1px, #6366f1 1px, transparent 1px)',
          backgroundSize: '10px 10px',
        }}
      />
      <div className="relative z-10 py-8 px-12">
        {/* Clean Header */}
        <div className="mb-20 flex items-center gap-12">
          {/* Stacked squares - smaller and refined */}
          <div className="relative w-[320px] h-[160px] flex-shrink-0">
            <div className="absolute top-6 left-6 w-full h-full bg-gradient-to-br from-red-600/40 to-orange-600/40 rounded-lg" />
            <div className="absolute top-3 left-3 w-full h-full bg-gradient-to-br from-blue-600/40 to-purple-600/40 rounded-lg" />
            <div className="absolute top-0 left-0 w-full h-full bg-[#1a1a1a] border border-gray-700/50 rounded-lg flex items-center justify-center shadow-2xl backdrop-blur-sm">
              <h1 className="text-gray-200 text-4xl font-bold tracking-wider">
                About Me
              </h1>
            </div>
          </div>

          {/* Quick intro blurb */}
          <div className="flex-1 max-w-2xl">
            <h2 className="text-3xl font-bold text-gray-100 mb-3">
              Christopher Murphy
            </h2>
            <p className="text-gray-400 text-lg leading-relaxed">
              Fullstack TypeScript developer and systems architect
            </p>
          </div>
        </div>

        {/* Main Content */}
        <div className="px-12  mx-auto space-y-12">
          {/* Origin Story */}
          <section className="relative grid grid-cols-[3fr_1fr] gap-4">
            <div>
              <div className="absolute -top-3 left-6 bg-[#1a1a1a] px-4 z-10">
                <span className="text-blue-400 font-mono text-xl">
                  // How I Got Here
                </span>
              </div>
              <div className="bg-[#1a1a1a] border border-gray-700/50 rounded-lg p-8 pt-10">
                <div className="space-y-4 text-gray-300 text-lg leading-relaxed">
                  <p>
                    In 2018, I was hired to help with day-to-day operations at a
                    company handling hundreds of e-liquid label designs. Every
                    batch needed manual ID updates - a mind-numbing process that
                    was clearly unsustainable.
                  </p>
                  <p>
                    With just basic PHP knowledge, I built a simple batch ID
                    overlay system. But like most "simple" solutions, it grew.
                    What started as a label updater evolved into a full CRM,
                    stock picking and manufacturing system. Along the way, I
                    picked up JavaScript, Node.js, and kept modernizing our
                    stack.
                  </p>
                  <p>
                    The real eye-opener came when talking to other businesses in
                    the industry. They were either bleeding money on ill-fitting
                    enterprise solutions or limping along with Excel
                    spreadsheets. This realization led us to rebuild the system
                    from the ground up using modern technologies, aiming to
                    create a solution that can be tailored to any business's
                    needs in the manufacturing sector.
                  </p>
                </div>
              </div>
            </div>
            <div className="flex flex-col  border rounded-xl border-gray-700/50 bg-black/10 ">
              dsad
            </div>
          </section>

          {/* Technical Challenges */}
          <section className="relative">
            <div className="absolute -top-3 left-6 bg-[#1a1a1a] px-4 z-10">
              <span className="text-purple-400 font-mono text-xl">
                // Technical Challenges
              </span>
            </div>
            <div className="bg-[#1a1a1a] border border-gray-700/50 rounded-lg p-8 pt-10">
              <div className="space-y-6 text-gray-300 text-lg leading-relaxed">
                <div>
                  <h3 className="text-xl font-semibold text-gray-200 mb-2">
                    The Data Structure Problem
                  </h3>
                  <p className="text-lg leading-relaxed">
                    Building a generic ERP system presented unique challenges in
                    data management. Our MySQL database structure grew into an
                    intricate web of relationships - stock items connected to
                    their respective categories which in turn had nested data,
                    properties linked to units of measure with complex
                    hierarchical relationships between them. Every item carried
                    its own stock records, activity logs, and user interactions.
                  </p>
                  <p className="text-lg leading-relaxed">
                    The data structure naturally evolved into large, tree-like
                    structures, mirroring how DOM nodes represent HTML. These
                    data trees became the foundation for our UI components,
                    forms, displays, and notification systems. While fetching
                    and managing this data was streamlined using Objection.js
                    for graph fetching and tRPC for efficient, cached API calls,
                    a new challenge emerged.
                  </p>
                  <p className="text-lg leading-relaxed">
                    The real complexity lay in client-state mutations. Each form
                    element nested deep within our state tree required
                    increasingly complex mutation paths. Even with TypeScript
                    providing errors in VS-code, managing these deep state
                    updates became error-prone and cumbersome. While you could
                    send partial data to components and manage it independently,
                    this monolithic approach was wasteful in terms of
                    re-rendering that occurred during any field mutation.
                  </p>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-gray-200 mb-2">
                    The Multi-Tenant Auth Nightmare
                  </h3>
                  <p>
                    Existing auth solutions were either too simple (basic JWT
                    validation) or enterprise overkill. We needed fine-grained,
                    per-route controls with dynamic permission groups that each
                    tenant could configure. Think "can access /inventory/* but
                    only if in warehouse team AND during business hours."
                  </p>
                  <p className="mt-2">
                    Auth0, Clerk, and others couldn't handle our permission
                    matrices without expensive enterprise plans that still
                    needed heavy customization. So I built my own solution on
                    Cloudflare Workers.
                  </p>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-gray-200 mb-2">
                    Too Many Schemas For One Data Shape
                  </h3>
                  <p>
                    Now the large schemas themselves are not really an issue,
                    but when you have your DB SQL migrations, your ORM schema,
                    your Types and your default client state you end up with
                    multiple places describing the same data.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Libraries Section */}
          <section className="mt-16">
            <h2 className="text-3xl font-bold text-gray-100 mb-2">
              Libraries I Built (And Why)
            </h2>
            <p className="text-gray-400 mb-12 text-lg">
              Each library solves a specific pain point I couldn't find good
              solutions for.
            </p>

            <div className="space-y-8">
              {/* CogsBox State */}
              <div className="bg-[#1a1a1a] border border-gray-700/50 rounded-lg p-8">
                <div className="mb-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-2xl font-bold text-purple-400 mb-2">
                        cogsbox-state
                      </h3>
                      <p className="text-gray-400">
                        State management for deeply nested objects without the
                        pain
                      </p>
                    </div>
                    <div className="flex gap-3">
                      <a
                        href="https://github.com/cogsbox/cogsbox-state"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-3 py-1.5 bg-gray-800 hover:bg-gray-700 border border-gray-600 rounded text-gray-300 text-sm transition-colors"
                      >
                        <svg
                          className="w-4 h-4"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                        </svg>
                        GitHub
                      </a>
                      <a
                        href="https://www.npmjs.com/package/cogsbox-state"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-3 py-1.5 bg-red-900/20 hover:bg-red-900/30 border border-red-700/30 rounded text-red-300 text-sm transition-colors"
                      >
                        <svg
                          className="w-4 h-4"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path d="M1.763 0C.786 0 0 .786 0 1.763v20.474C0 23.214.786 24 1.763 24h20.474c.977 0 1.763-.786 1.763-1.763V1.763C24 .786 23.214 0 22.237 0zM5.13 5.323l13.837.019-.009 5.183H13.82v2.073h5.13v5.067l-13.82.027zm4.109 6.463h4.142v2.069H9.239z" />
                        </svg>
                        npm
                      </a>
                    </div>
                  </div>
                  {/* Tech badges prominently at top */}
                  <div className="flex flex-wrap gap-2 mb-6">
                    {[
                      'React',
                      'TypeScript',
                      'Proxy API',
                      'SuperJSON',
                      'Zod',
                    ].map((tech) => (
                      <span
                        key={tech}
                        className="px-3 py-1.5 bg-purple-900/20 border border-purple-700/30 text-purple-300 text-sm rounded"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                  <div>
                    <h4 className="text-sm font-semibold text-gray-500 uppercase mb-3">
                      The Problem
                    </h4>
                    <p className="text-gray-300 mb-4">
                      Our monolithic data structures required complex nested
                      update patterns. Even simple operations became verbose and
                      error-prone:
                    </p>
                    <pre className="bg-gray-900/50 border border-gray-800 p-4 rounded-lg overflow-x-auto text-sm">
                      <code className="text-gray-300">{`// Updating a nested item - the old way
setData(prev => ({
  ...prev,
  warehouse: {
    ...prev.warehouse,
    inventory: {
      ...prev.warehouse.inventory,
      items: prev.warehouse.inventory.items.map(
        item => item.id === targetId 
          ? { ...item, quantity: item.quantity + 1 }
          : item
      )
    }
  }
}))`}</code>
                    </pre>
                  </div>

                  <div>
                    <h4 className="text-sm font-semibold text-gray-500 uppercase mb-3">
                      My Solution
                    </h4>
                    <p className="text-gray-300 mb-4">
                      I built a proxy-based API that mirrors your data
                      structure, making updates intuitive:
                    </p>
                    <pre className="bg-gray-900/50 border border-gray-800 p-4 rounded-lg overflow-x-auto text-sm">
                      <code className="text-gray-300">{`// The cogsbox way
state.warehouse.inventory.items
  .stateFind(item => item.id === targetId)
  .quantity.update(q => q + 1)`}</code>
                    </pre>
                    <div className="mt-4">
                      <p className="text-sm text-gray-500 mb-2">
                        Key implementation details:
                      </p>
                      <ul className="text-sm text-gray-400 space-y-1">
                        <li>• Proxy-based API for natural property access</li>
                        <li>
                          • Isolated re-renders using Zustand store based
                          subscriptions
                        </li>
                        <li>• Form validation and bindings with Zod schema</li>
                        <li>• TypeScript inference throughout the chain</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              {/* Cogs Auth */}
              <div className="bg-[#1a1a1a] border border-gray-700/50 rounded-lg p-8">
                <div className="mb-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-2xl font-bold text-blue-400 mb-2">
                        cogs-auth
                      </h3>
                      <p className="text-gray-400">
                        Edge-based auth with real-time session management
                      </p>
                    </div>
                  </div>
                  {/* Tech badges prominently at top */}
                  <div className="flex flex-wrap gap-2 mb-6">
                    {[
                      'Cloudflare Workers',
                      'Durable Objects',
                      'WebSockets',
                      'JWT',
                      'bcrypt',
                      'iron-session',
                    ].map((tech) => (
                      <span
                        key={tech}
                        className="px-3 py-1.5 bg-blue-900/20 border border-blue-700/30 text-blue-300 text-sm rounded"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                  <div>
                    <h4 className="text-sm font-semibold text-gray-500 uppercase mb-3">
                      The Problem
                    </h4>
                    <p className="text-gray-300 mt-3">
                      Multi-tenant SaaS needed complex, dynamic permissions that
                      existing solutions couldn't handle without enterprise
                      pricing. We needed shareable accounts for warehouse staff
                      with quick pincode access as well as granular permissions.
                    </p>
                    <p className="text-gray-300 mt-3">
                      Plus, we needed real-time activity tracking across tabs
                      and secondary auth challenges for sensitive operations -
                      features that required custom implementation anyway.
                    </p>
                  </div>

                  <div>
                    <h4 className="text-sm font-semibold text-gray-500 uppercase mb-3">
                      Technical Approach
                    </h4>
                    <p className="text-gray-300 mb-4">
                      Built on Cloudflare Workers with Durable Objects for
                      distributed session state:
                    </p>
                    <ul className="text-sm text-gray-400 space-y-2">
                      <li>
                        <span className="text-gray-300 font-semibold">
                          • Durable Objects
                        </span>{' '}
                        for real-time session management - each user gets a
                        stateful object that tracks all their active sessions
                      </li>
                      <li>
                        <span className="text-gray-300 font-semibold">
                          • WebSocket connections
                        </span>{' '}
                        to sync activity across tabs instantly
                      </li>
                      <li>
                        <span className="text-gray-300 font-semibold">
                          • Iron-session
                        </span>{' '}
                        for encrypted, stateless session tokens
                      </li>
                      <li>
                        <span className="text-gray-300 font-semibold">
                          • Permission matrices
                        </span>{' '}
                        stored at edge for sub-50ms auth checks globally
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* CogsBox Shape */}
              <div className="bg-[#1a1a1a] border border-gray-700/50 rounded-lg p-8">
                <div className="mb-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-2xl font-bold text-purple-400 mb-2">
                        cogsbox-shape
                      </h3>
                      <p className="text-gray-400">
                        State management for deeply nested objects without the
                        pain
                      </p>
                    </div>
                    <div className="flex gap-3">
                      <a
                        href="https://github.com/cogsbox/cogsbox-shape"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-3 py-1.5 bg-gray-800 hover:bg-gray-700 border border-gray-600 rounded text-gray-300 text-sm transition-colors"
                      >
                        <svg
                          className="w-4 h-4"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                        </svg>
                        GitHub
                      </a>
                      <a
                        href="https://www.npmjs.com/package/cogsbox-shape"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-3 py-1.5 bg-red-900/20 hover:bg-red-900/30 border border-red-700/30 rounded text-red-300 text-sm transition-colors"
                      >
                        <svg
                          className="w-4 h-4"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path d="M1.763 0C.786 0 0 .786 0 1.763v20.474C0 23.214.786 24 1.763 24h20.474c.977 0 1.763-.786 1.763-1.763V1.763C24 .786 23.214 0 22.237 0zM5.13 5.323l13.837.019-.009 5.183H13.82v2.073h5.13v5.067l-13.82.027zm4.109 6.463h4.142v2.069H9.239z" />
                        </svg>
                        npm
                      </a>
                    </div>
                  </div>

                  {/* Tech badges prominently at top */}
                  <div className="flex flex-wrap gap-2 mb-6">
                    {[
                      'TypeScript',
                      'Zod',
                      'Schema Validation',
                      'Type Inference',
                    ].map((tech) => (
                      <span
                        key={tech}
                        className="px-3 py-1.5 bg-green-900/20 border border-green-700/30 text-green-300 text-sm rounded"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                  <div>
                    <h4 className="text-sm font-semibold text-gray-500 uppercase mb-3">
                      The Problem
                    </h4>
                    <p className="text-gray-300 mb-4">
                      Data lives in different forms throughout its lifecycle:
                      integers in MySQL, UUID strings during creation,
                      transformed values for clients (cents to dollars), and
                      validation rules for user input. Keeping these
                      synchronized was a constant source of bugs.
                    </p>
                    <div className="bg-gray-900/30 p-3 rounded-lg mt-3">
                      <code className="text-green-400 font-mono text-sm">
                        SQL → Initial State → Client → Validation
                      </code>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-semibold text-gray-500 uppercase mb-3">
                      How It Works
                    </h4>
                    <p className="text-gray-300 mb-4">
                      Define your schema once with transformations at each
                      layer:
                    </p>
                    <pre className="bg-gray-900/50 border border-gray-800 p-4 rounded-lg overflow-x-auto text-sm">
                      <code className="text-gray-300">{`const productSchema = schema({
  _tableName: "products",
  
  // SQL: Integer cents in DB
  price: s.int()
    // Client: Dollars as decimal
    .client(() => z.number().multipleOf(0.01))
    // Auto-convert between formats
    .transform({
      toClient: cents => cents / 100,
      toDb: dollars => Math.round(dollars * 100)
    }),
    
  // SQL: Integer ID  
  id: s.int({ pk: true })
    // Initial: UUID for new records
    .initialState(z.string().uuid(), () => uuidv4())
});`}</code>
                    </pre>
                  </div>
                </div>
              </div>

              {/* CogsBox Sync */}
              <div className="bg-[#1a1a1a] border border-gray-700/50 rounded-lg p-8">
                <div className="mb-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-2xl font-bold text-orange-400 mb-2">
                        cogsbox-sync
                      </h3>
                      <p className="text-gray-400">
                        Real-time state synchronization with optimistic updates
                      </p>
                    </div>
                  </div>
                  {/* Tech badges prominently at top */}
                  <div className="flex flex-wrap gap-2 mb-6">
                    {[
                      'WebSockets',
                      'Cloudflare Durable Objects',
                      'Event Sourcing',
                      'CRDT concepts',
                    ].map((tech) => (
                      <span
                        key={tech}
                        className="px-3 py-1.5 bg-orange-900/20 border border-orange-700/30 text-orange-300 text-sm rounded"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                  <div>
                    <h4 className="text-sm font-semibold text-gray-500 uppercase mb-3">
                      The Problem
                    </h4>
                    <p className="text-gray-300">
                      ERP systems need real-time updates - when someone updates
                      inventory, everyone should see it immediately. But we also
                      needed optimistic updates for responsive UIs and conflict
                      resolution for concurrent edits.
                    </p>
                  </div>

                  <div>
                    <h4 className="text-sm font-semibold text-gray-500 uppercase mb-3">
                      Architecture
                    </h4>
                    <ul className="text-sm text-gray-400 space-y-2">
                      <li>
                        <span className="text-gray-300 font-semibold">
                          • Event sourcing pattern
                        </span>{' '}
                        - all changes are events that can be replayed
                      </li>
                      <li>
                        <span className="text-gray-300 font-semibold">
                          • Durable Objects as coordinators
                        </span>{' '}
                        - each data scope gets a stateful coordinator
                      </li>
                      <li>
                        <span className="text-gray-300 font-semibold">
                          • Optimistic updates
                        </span>{' '}
                        with automatic rollback on conflicts
                      </li>
                      <li>
                        <span className="text-gray-300 font-semibold">
                          • CRDT-inspired merge strategies
                        </span>{' '}
                        for specific data types
                      </li>
                      <li>
                        <span className="text-gray-300 font-semibold">
                          • WebSocket multiplexing
                        </span>{' '}
                        - single connection for all subscriptions
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Tech Stack Section */}
          <section className="mt-16 bg-[#1a1a1a] border border-gray-700/50 rounded-lg p-8">
            <h3 className="text-2xl font-bold text-gray-100 mb-6">
              What I Work With Now
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <h4 className="text-lg font-semibold text-blue-400 mb-3">
                  Frontend
                </h4>
                <p className="text-gray-400 text-sm">
                  TypeScript, React, Next.js, Tailwind CSS, Zustand, React
                  Query, Zod
                </p>
              </div>
              <div>
                <h4 className="text-lg font-semibold text-green-400 mb-3">
                  Backend
                </h4>
                <p className="text-gray-400 text-sm">
                  Node.js, Express, Fastify, TRPC, Knex, ObjectionJS, MySQL
                </p>
              </div>
              <div>
                <h4 className="text-lg font-semibold text-purple-400 mb-3">
                  Infrastructure
                </h4>
                <p className="text-gray-400 text-sm">
                  Cloudflare Workers, Durable Objects, AWS (S3, RDS, KMS),
                  Docker, GitHub Actions
                </p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
