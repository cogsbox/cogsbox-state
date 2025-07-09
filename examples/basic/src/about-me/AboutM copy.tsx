export default function AboutMe() {
  return (
    <div className="w-full min-h-screen bg-[#1a1a1a]/70 relative overflow-hidden">
      {/* Dot Pattern Background - Denser in header area */}
      <div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage:
            'radial-gradient(circle at 1px 1px, #4a5568 1px, transparent 1px)',
          backgroundSize: '20px 20px',
        }}
      />

      {/* Denser dots for header section */}
      <div
        className="absolute top-0 left-0 right-0 h-[500px] opacity-10"
        style={{
          backgroundImage:
            'radial-gradient(circle at 1px 1px, #6366f1 1px, transparent 1px)',
          backgroundSize: '10px 10px',
        }}
      />

      <div className="relative z-10 p-10">
        {/* Header Section - Improved Layout */}
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
        <div className="max-w-6xl mx-auto space-y-16">
          {/* Expanded Introduction */}
          <section className="grid md:grid-cols-2 gap-8">
            <div className="bg-[#1a1a1a] border border-gray-700/50 rounded-lg p-8 relative">
              <div className="absolute -top-3 left-6 bg-[#1a1a1a] px-4">
                <span className="text-blue-400 font-mono text-sm">
                  // background
                </span>
              </div>
              <p className="text-gray-300 leading-relaxed mb-4">
                I'm a developer who thrives on tackling complex technical
                challenges. My journey from web design to systems architecture
                has taught me that the best solutions come from truly
                understanding both the problem and the people who'll use your
                tools.
              </p>
              <p className="text-gray-400">
                With experience ranging from growing a company from 1 to 60+
                staff as Operations Manager, to building comprehensive ERP
                systems, I bring both technical expertise and business acumen to
                every project.
              </p>
            </div>

            <div className="bg-[#1a1a1a] border border-gray-700/50 rounded-lg p-8 relative">
              <div className="absolute -top-3 left-6 bg-[#1a1a1a] px-4">
                <span className="text-green-400 font-mono text-sm">
                  // approach
                </span>
              </div>
              <p className="text-gray-300 leading-relaxed mb-4">
                I believe in building tools that developers actually want to
                use. That means prioritizing simplicity, type safety, and
                developer experience without sacrificing functionality.
              </p>
              <p className="text-gray-400">
                Whether it's creating a state management solution that handles
                monolithic objects elegantly, or building authentication that
                works seamlessly at the edge, I focus on making complex things
                simple.
              </p>
            </div>
          </section>

          {/* Why I Built These Libraries Section */}
          <section className="bg-gradient-to-r from-blue-900/10 to-purple-900/10 border border-gray-700/30 rounded-lg p-10">
            <h2 className="text-3xl font-bold text-gray-100 mb-6">
              Why I Built These Libraries
            </h2>
            <div className="space-y-4 text-gray-300">
              <p className="text-lg leading-relaxed">
                While developing a complex multi-tenant warehouse and
                manufacturing management system, I kept hitting walls with
                existing solutions. The application needed to handle:
              </p>
              <ul className="space-y-2 ml-6 text-gray-400">
                <li className="flex items-start gap-2">
                  <span className="text-blue-400 mt-1">•</span>
                  <span>
                    Multiple warehouses with real-time inventory tracking across
                    locations
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-400 mt-1">•</span>
                  <span>
                    Complex manufacturing workflows with batch tracking and
                    quality control
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-400 mt-1">•</span>
                  <span>
                    Granular permissions across different tenant organizations
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-400 mt-1">•</span>
                  <span>
                    Real-time collaboration features with offline capabilities
                  </span>
                </li>
              </ul>
              <p className="text-lg leading-relaxed pt-4">
                The complexity was overwhelming, and existing tools either did
                too much (becoming bloated) or too little (requiring endless
                workarounds). I needed solutions that were powerful yet simple,
                type-safe yet flexible. So I built them.
              </p>
            </div>
          </section>

          {/* Libraries Section */}
          <section className="space-y-8">
            <div className="flex items-center gap-4 mb-8">
              <div className="h-px bg-gray-700 flex-1" />
              <h2 className="text-3xl font-bold text-gray-200">
                Libraries I've Built
              </h2>
              <div className="h-px bg-gray-700 flex-1" />
            </div>

            <p className="text-gray-400 text-center max-w-3xl mx-auto mb-12">
              Each library solves specific pain points I encountered. Together,
              they form a cohesive ecosystem for building complex, real-time,
              multi-tenant applications with an emphasis on developer
              experience.
            </p>

            {/* Library Cards - Original Grid Layout */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* CogsAuth */}
              <div className="group relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg blur-xl opacity-25 group-hover:opacity-40 transition-opacity" />
                <div className="relative bg-[#1a1a1a] border border-gray-700/50 rounded-lg p-6 hover:border-gray-600 transition-colors">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
                      <span className="text-blue-400 text-xl font-bold">
                        🔐
                      </span>
                    </div>
                    <h3 className="text-2xl font-bold text-gray-100">
                      cogs-auth
                    </h3>
                  </div>
                  <div className="space-y-3">
                    <p className="text-gray-300">
                      A comprehensive authentication solution built on
                      Cloudflare Workers with Durable Objects for session
                      management and real-time user activity tracking.
                    </p>
                    <div className="pt-3 border-t border-gray-800">
                      <p className="text-sm text-gray-500 mb-2">
                        Technologies:
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {[
                          'Cloudflare Workers',
                          'Durable Objects',
                          'JWT',
                          'WebSockets',
                          'iron-session',
                          'bcrypt',
                        ].map((tech) => (
                          <span
                            key={tech}
                            className="px-2 py-1 bg-gray-800 text-gray-400 text-xs rounded"
                          >
                            {tech}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="pt-3">
                      <p className="text-sm text-gray-500 mb-2">
                        What it solves:
                      </p>
                      <ul className="text-sm text-gray-400 space-y-1">
                        <li>
                          • Edge-based authentication with global low latency
                        </li>
                        <li>• Real-time user activity tracking across tabs</li>
                        <li>• Multi-tenant permission management</li>
                        <li>
                          • Session state persistence without traditional
                          databases
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              {/* CogsBox Shape */}
              <div className="group relative">
                <div className="absolute inset-0 bg-gradient-to-r from-green-600 to-teal-600 rounded-lg blur-xl opacity-25 group-hover:opacity-40 transition-opacity" />
                <div className="relative bg-[#1a1a1a] border border-gray-700/50 rounded-lg p-6 hover:border-gray-600 transition-colors">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
                      <span className="text-green-400 text-xl font-bold">
                        📐
                      </span>
                    </div>
                    <h3 className="text-2xl font-bold text-gray-100">
                      cogsbox-shape
                    </h3>
                  </div>
                  <div className="space-y-3">
                    <p className="text-gray-300">
                      A TypeScript-first schema declaration and validation
                      library that provides type-safe schemas across database,
                      client, and validation layers with automatic
                      transformations.
                    </p>
                    <div className="pt-3 border-t border-gray-800">
                      <p className="text-sm text-gray-500 mb-2">
                        Technologies:
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {[
                          'TypeScript',
                          'Zod',
                          'Type Inference',
                          'Schema Validation',
                        ].map((tech) => (
                          <span
                            key={tech}
                            className="px-2 py-1 bg-gray-800 text-gray-400 text-xs rounded"
                          >
                            {tech}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="pt-3">
                      <p className="text-sm text-gray-500 mb-2">
                        What it solves:
                      </p>
                      <ul className="text-sm text-gray-400 space-y-1">
                        <li>• Single source of truth for data schemas</li>
                        <li>• Automatic type transformations between layers</li>
                        <li>• Type-safe database to client data flow</li>
                        <li>• Eliminates schema duplication across stack</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              {/* CogsBox State */}
              <div className="group relative">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg blur-xl opacity-25 group-hover:opacity-40 transition-opacity" />
                <div className="relative bg-[#1a1a1a] border border-gray-700/50 rounded-lg p-6 hover:border-gray-600 transition-colors">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center">
                      <span className="text-purple-400 text-xl font-bold">
                        🔄
                      </span>
                    </div>
                    <h3 className="text-2xl font-bold text-gray-100">
                      cogsbox-state
                    </h3>
                  </div>
                  <div className="space-y-3">
                    <p className="text-gray-300">
                      A powerful state management solution with built-in form
                      handling, validation, and real-time synchronization
                      capabilities. Perfect for working with monolithic objects
                      and deeply nested state.
                    </p>
                    <div className="pt-3 border-t border-gray-800">
                      <p className="text-sm text-gray-500 mb-2">
                        Technologies:
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {[
                          'React',
                          'TypeScript',
                          'Proxy API',
                          'LocalStorage',
                          'SuperJSON',
                          'Zod',
                        ].map((tech) => (
                          <span
                            key={tech}
                            className="px-2 py-1 bg-gray-800 text-gray-400 text-xs rounded"
                          >
                            {tech}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="pt-3">
                      <p className="text-sm text-gray-500 mb-2">
                        What it solves:
                      </p>
                      <ul className="text-sm text-gray-400 space-y-1">
                        <li>• Unified state and form management</li>
                        <li>• Automatic persistence and hydration</li>
                        <li>• Type-safe nested state updates</li>
                        <li>• Built-in validation with error handling</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              {/* CogsBox Sync */}
              <div className="group relative">
                <div className="absolute inset-0 bg-gradient-to-r from-orange-600 to-red-600 rounded-lg blur-xl opacity-25 group-hover:opacity-40 transition-opacity" />
                <div className="relative bg-[#1a1a1a] border border-gray-700/50 rounded-lg p-6 hover:border-gray-600 transition-colors">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-orange-500/20 rounded-lg flex items-center justify-center">
                      <span className="text-orange-400 text-xl font-bold">
                        🔌
                      </span>
                    </div>
                    <h3 className="text-2xl font-bold text-gray-100">
                      cogsbox-sync
                    </h3>
                  </div>
                  <div className="space-y-3">
                    <p className="text-gray-300">
                      A real-time synchronization engine that seamlessly
                      connects client state with backend services, providing
                      optimistic updates and conflict resolution.
                    </p>
                    <div className="pt-3 border-t border-gray-800">
                      <p className="text-sm text-gray-500 mb-2">
                        Technologies:
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {[
                          'WebSockets',
                          'Cloudflare Durable Objects',
                          'Event Sourcing',
                          'CRDT concepts',
                        ].map((tech) => (
                          <span
                            key={tech}
                            className="px-2 py-1 bg-gray-800 text-gray-400 text-xs rounded"
                          >
                            {tech}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="pt-3">
                      <p className="text-sm text-gray-500 mb-2">
                        What it solves:
                      </p>
                      <ul className="text-sm text-gray-400 space-y-1">
                        <li>• Real-time data synchronization</li>
                        <li>• Optimistic UI updates with rollback</li>
                        <li>• Offline-first capabilities</li>
                        <li>• Conflict resolution strategies</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Tech Stack Section */}
          <section className="mt-16 bg-[#1a1a1a] border border-gray-700/50 rounded-lg p-8">
            <h3 className="text-2xl font-bold text-gray-100 mb-6">
              Tech Stack & Expertise
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
