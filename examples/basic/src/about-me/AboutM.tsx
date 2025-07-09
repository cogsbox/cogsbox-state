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
        <div className=" mx-auto space-y-4">
          {/* Expanded Introduction */}

          <section className="grid md:grid-cols-[70%_30%] gap-8 relative">
            <div className="absolute -top-3 left-6 bg-[#1a1a1a] px-4">
              <span className="text-blue-400 font-mono text-xl">
                // Background
              </span>
            </div>
            <div className="space-y-6 bg-[#1a1a1a] border border-gray-700/50 rounded-lg p-4 py-10 text-gray-400">
              <p className="text-purple-400 font-bold">
                Learning Web Development
              </p>
              <p className="text-lg leading-relaxed">
                When I joined my previous role, I initially came on board to
                help the owner with day-to-day operations. As a white label
                company, we handled hundreds of label designs that required
                manual batch ID updates - a process that quickly proved
                unsustainable. I took it upon myself to develop a solution.
              </p>
              <p className="text-lg leading-relaxed">
                Despite limited web development experience, I leveraged my basic
                PHP knowledge to create what started as a simple batch ID
                overlay system. This evolved into a comprehensive CRM and
                manufacturing system. Through this process, I expanded my
                skillset into JavaScript and Node.js, continuously modernizing
                our tech stack.
              </p>
              <p className="text-lg leading-relaxed">
                The system's success became apparent as we connected with other
                businesses in the industry. Most were either paying excessive
                amounts for ill-fitting solutions or relying on basic Excel
                spreadsheets. This realization led us to rebuild the system from
                the ground up using modern technologies, aiming to create a
                solution that can be tailored to any business's needs in the
                manufacturing sector.
              </p>
            </div>
          </section>

          <section className="grid md:grid-cols-[30%_70%] gap-4 relative">
            <div></div>
            <div className="space-y-3 bg-[#1a1a1a] border border-gray-700/50 rounded-lg p-8 py-10 relative text-gray-400">
              <p className="text-purple-400 font-bold">
                Developing a SaaS ERP - Data integrity and the source of truth
              </p>
              <p className="text-lg leading-relaxed">
                Building a generic ERP system presented unique challenges in
                data management. Our MySQL database structure grew into an
                intricate web of relationships - stock items connected to their
                respective categories which in turn had nested data, properties
                linked to units of measure with complex hierarchical
                relationships between them. Every item carried its own stock
                records, activity logs, and user interactions.
              </p>
              <p className="text-lg leading-relaxed">
                The data structure naturally evolved into large, tree-like
                structures, mirroring how DOM nodes represent HTML. These data
                trees became the foundation for our UI components, forms,
                displays, and notification systems. While fetching and managing
                this data was streamlined using Objection.js for graph fetching
                and tRPC for efficient, cached API calls, a new challenge
                emerged.
              </p>
              <p className="text-lg leading-relaxed">
                The real complexity lay in client-state mutations. Each form
                element nested deep within our state tree required increasingly
                complex mutation paths. Even with TypeScript, managing these
                deep state updates became error-prone and cumbersome. While you
                could send partial data to components and manage it
                independently, this monolithic approach was wasteful in terms of
                re-rendering that occurred during any field mutation.
              </p>
            </div>
          </section>

          <section className="grid md:grid-cols-[70%_30%] gap-8 relative">
            <div className="absolute -top-3 left-6 bg-[#1a1a1a] px-4">
              <span className="text-blue-400 font-mono text-xl">
                // The Authentication Challenge
              </span>
            </div>
            <div className="space-y-6 bg-[#1a1a1a] border border-gray-700/50 rounded-lg p-4 py-10 text-gray-400">
              <p className="text-purple-400 font-bold">
                Nothing Like This Existed
              </p>
              <p className="text-lg leading-relaxed">
                When building a multi-tenant SaaS platform, I discovered
                existing auth solutions were either too simple (basic JWT
                validation) or enterprise overkill. What I needed didn't exist:
                fine-grained per-route controls with dynamic permission groups
                that each tenant could configure themselves.
              </p>
              <p className="text-lg leading-relaxed">
                The breaking point came when we needed rules like "can access
                /inventory/* but only if they're in the warehouse team AND it's
                during business hours" or "can view all orders but edit only
                their region's data". Auth0, Clerk, and similar services
                couldn't handle our complex, tenant-specific permission matrices
                without expensive enterprise plans that still required
                significant customization.
              </p>
              <p className="text-lg leading-relaxed">
                So I built cogs-auth: a Cloudflare Workers-based auth system
                using Durable Objects for real-time session management. It
                handles everything from basic login to complex role hierarchies,
                secondary security measures (PIN/password re-entry for sensitive
                actions), and even tracks user activity across tabs in
                real-time. All while maintaining sub-50ms response times
                globally.
              </p>
            </div>
          </section>

          <section className="grid md:grid-cols-[30%_70%] gap-4 relative">
            <div></div>
            <div className="space-y-3 bg-[#1a1a1a] border border-gray-700/50 rounded-lg p-8 py-10 relative text-gray-400">
              <p className="text-purple-400 font-bold">
                State Management Revolution
              </p>
              <p className="text-lg leading-relaxed">
                Our monolithic data structures simplified the developer process
                but fought against React's re-render model. We needed something
                that could isolate subsets of state while making it easy to
                manipulate even the most deeply nested data. What started as a
                simple hook transformed into cogsbox-state - a library built for
                this express purpose.
              </p>
              <p className="text-lg leading-relaxed">
                Instead of writing complex update logic like:
              </p>
              <pre className="bg-gray-900 p-4 rounded-lg overflow-x-auto">
                <code className="text-sm text-gray-300">{`// Traditional approach - painful nested updates
setData(prev => ({
  ...prev,
  warehouse: {
    ...prev.warehouse,
    inventory: {
      ...prev.warehouse.inventory,
      items: prev.warehouse.inventory.items.map(item =>
        item.id === targetId 
          ? { ...item, quantity: item.quantity + 1 }
          : item
      )
    }
  }
}))`}</code>
              </pre>
              <p className="text-lg leading-relaxed mt-4">
                With cogsbox-state, you simply write:
              </p>
              <pre className="bg-gray-900 p-4 rounded-lg overflow-x-auto">
                <code className="text-sm text-gray-300">{`// Cogsbox approach - intuitive and type-safe
state.warehouse.inventory.items
  .stateFind(item => item.id === targetId)
  .quantity.update(q => q + 1)`}</code>
              </pre>
              <p className="text-lg leading-relaxed mt-4">
                The library provides a proxy-based API that mirrors your data
                structure, making deeply nested updates as simple as property
                access. It includes built-in form bindings, automatic
                persistence, and isolated re-renders - solving all the pain
                points we experienced with traditional state management.
              </p>
            </div>
          </section>

          {/* Why I Built These Libraries Section */}
          <section className="bg-gradient-to-r from-blue-900/60 to-purple-900/60 border border-gray-700/30 rounded-lg p-10">
            <h2 className="text-3xl font-bold text-gray-100 mb-6">
              I built a bunch of libraries but why
            </h2>
            <div className="space-y-4 text-gray-300">
              <p className="text-lg leading-relaxed pt-4">
                Look, most of the time you don't need to build your own stuff.
                There's literally thousands of libraries out there and 99% of
                the time one of them will do what you need. But sometimes you
                hit that 1% where nothing quite fits right - like when you need
                auth that handles weird multi-tenant edge cases or state
                management that doesn't make you want to tear your hair out when
                dealing with deeply nested objects.
              </p>
              <p className="text-lg leading-relaxed">
                So I ended up building these libraries. Not because I wanted to
                reinvent the wheel but because I needed wheels that could handle
                our specific terrain. And honestly, diving deep into how these
                things actually work - like really understanding how
                Cloudflare's Durable Object model can be leveraged for creating
                a globally accessible cache of data. Or how using proxies for
                state objects can sidestep React rerendering and let you develop
                a more targeted approach.
              </p>
              <p className="text-lg leading-relaxed">
                The whole process was basically: try existing solution → realize
                it doesn't quite work → try to hack around it → give up and
                build exactly what we need. Each time I had to learn a bunch of
                new stuff but I've come out of it a much better developer.
              </p>
            </div>
          </section>

          {/* Libraries Section */}
          <section className="space-y-8">
            <div className="flex items-center gap-4 mb-8">
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
