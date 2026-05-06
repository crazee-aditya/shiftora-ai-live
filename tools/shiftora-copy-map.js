(() => {
  const BOOKING_URL = 'https://cal.com/shreshth-daga-rxfhkj/30min';
  const replacements = [
    ['Varick Agents', 'shiftora.ai'],
    ['HOW IT WORKS', 'CAPABILITIES'],
    ['OUR AGENTS', 'INDUSTRIES'],
    ['CASE STUDIES', 'ENGAGEMENTS'],
    ['CAREERS', 'APPROACH'],
    ['FAQ', 'ABOUT'],
    ['SCHEDULE DISCOVERY', 'BOOK A DISCOVERY CALL'],
    ['View Deployments', 'See our work'],
    ['Partnering with the Industry\'s Best', 'Trusted by operators of high-growth and Legacy Enterprises'],
    ['Built by engineers from', 'Trusted by operators at'],

    ['Transform Your Enterprise With AI', 'We rebuild Legacy Enterprises around AI.'],
    [
      'Custom AI implementations tailored to automate and scale enterprise workflows.',
      'Shiftora designs, builds, and ships custom AI systems, enablement programs, and software platforms for Large organizations carrying decades of operating drag.'
    ],

    [
      'Varick designs and deploys AI agent systems that execute operational workflows inside enterprise organizations.',
      'We do not sell tools. We replace the operating model.'
    ],
    [
      'Varick designs and deploys AI agent systems that',
      'We do not sell tools.'
    ],
    [
      'execute operational workflows inside enterprise organizations.',
      'We replace the operating model.'
    ],

    ['How it works', 'Capabilities'],
    ['AI Opportunity Audit', 'Custom AI Automations'],
    ['Process Architecture & Redesign', 'Enablement & Process Optimization'],
    ['Production Deployment', 'Enterprise Software Solutions'],
    [
      'We conduct a structured audit of how work moves through your organization across teams, systems, and decision points.',
      'We build AI systems for the work your enterprise actually runs on: document pipelines, voice and chat agents, vision systems, predictive models, and workflow automation around your real data.'
    ],
    [
      'Varick designs and builds the AI agent system that will execute the workflow - integrating it with the enterprise tools, data, and operational logic that power the process. You\'re kept in the loop the entire time.',
      'We sit with your operators, map the process, strip dead steps, rebuild the workflow around AI, train the teams, document SOPs, and stay in the room until adoption is real.'
    ],
    [
      'Varick deploys the AI agent system into the enterprise stack, connecting it to live systems and workflows so it can begin executing operational work in production. Agents are built on top of your existing software, meaning no migrations are required. If you have BAAs with AI Labs we\'ll use their models, and we deploy on your cloud.',
      'We build full-stack applications, custom CRMs, microservices, partner APIs, B2B portals, internal tools, and executive dashboards engineered to enterprise standards and owned by you.'
    ],

    ['Reduce Operational Overhead', 'Custom AI Automations'],
    ['Accelerate Execution', 'Enablement & Process Optimization'],
    ['Scale Without Hiring', 'Enterprise Software Solutions'],
    [
      'AI agents remove manual coordination, approvals, and repetitive operational work across systems.',
      'Purpose-built AI systems remove manual review, routing, validation, and repetitive operational work across existing systems.'
    ],
    [
      'Processes that once required multiple team handoffs can now execute continuously.',
      'Workflows are redesigned around adoption, governance, dashboards, SOPs, and operator enablement.'
    ],
    [
      'Operational output increases without adding headcount or new coordination layers.',
      'Enterprise platforms, CRMs, APIs, dashboards, and internal tools ship fast without forcing a stack migration.'
    ],

    ['Agents', 'Industries'],
    ['Revenue Ops Agents', 'Travel & Hospitality'],
    ['Finance Ops Agents', 'Legal Technology'],
    ['Logistics Ops Agents', 'Financial Services & Fintech'],
    [
      'Agents built for your sales org after mapping every handoff from lead intake through deal desk, forecasting, comp, and customer handoff. Deployed across your existing CRM, call recording, CLM, and enablement tools.',
      'Visa platforms, partner APIs, AI document validation, and vision-based quality control across distributed property portfolios.'
    ],
    [
      'Agents built for your finance department after embedding with your team and mapping how work actually moves across AP, AR, close, treasury, and FP&A. Deployed across your existing ERP, expense, and reporting systems. No migration, no new software.',
      'Salesforce-native lead intelligence, attorney-client matching, automated document drafting, and cadence and conversion engineering.'
    ],
    [
      'Agents built for your operations team after mapping exception flows, demand planning, procurement, and warehouse coordination. Deployed across your existing ERP, WMS, and planning systems.',
      'Investor-matching engines, founder-to-funding pipelines, portfolio intelligence dashboards, and automated compliance and KYC workflows.'
    ],
    ['CRM auto-enrichment', 'FMCG & Distribution'],
    ['Deal orchestration and approval routing', 'Education & EdTech'],
    ['Forecast intelligence', 'Logistics & Supply Chain'],
    [
      'Agents handle CRM hygiene, deal desk approvals, pipeline reporting, and forecast assembly. Keep your sales data clean and your reps selling instead of doing sales operations work.',
      'B2B CRMs from the ground up, account-level lead scoring, route-to-market intelligence, and distribution analytics built for the sales floor.'
    ],
    [
      'Agents handle accounts payable, accounts receivable, card reconciliation, runways and forecasting, and more. Close your books in record time without the overhead.',
      'Inbound demand automation at 50,000+ interaction scale, full-stack platform engineering, and founder-office reporting infrastructure.'
    ],
    [
      'Agents manage vendor onboarding, purchasing approvals, contract coordination, and supplier communication. Cut procurement cycle times and stop losing money to off-contract spend.',
      'Workflow orchestration, document automation pipelines, exception management, and real-time operating dashboards across geographies.'
    ],

    ['Case Studies', 'Selected work'],
    ['Case Study', 'Selected work'],
    ['Watch Varick Agents in Action', 'The work, in the open.'],
    ['Finance Operations', 'Global Travel & Visa Services'],
    ['Compliance & Risk', 'LegalMatch'],
    ['Procurement', 'Wakao Foods'],
    ['AUTONOMOUS SYSTEM', 'TRAVEL TECH / NDA'],
    ['FULLY INTEGRATED', 'LEGAL TECH / UNITED STATES'],
    [
      'Agents operate within existing system permissions and enterprise security policies. Access is controlled through integrations, and all agent actions are logged so activity can be monitored and audited.',
      'End-to-end B2C visa platform, AI visa workflow, document automation, B2B partner APIs, dashboards, payments, and operations case-management.'
    ],
    [
      'Agents track regulatory deadlines, assemble audit documentation, monitor policy adherence, and flag exceptions before they become findings. Stay audit-ready without the manual overhead.',
      'Salesforce-native predictive lead scoring and outbound cadence optimization layered directly into the existing system of record.'
    ],
    ['Payment timing optimization', 'Custom CRM build'],
    ['Cash position and forecasting', 'Automated B2B lead scoring'],
    ['Close readiness tracking', '15-day handover'],
    ['AP exception triage and resolution', 'AI document validation'],
    ['Cross system reconciliation', 'Partner API dashboards'],
    ['Commission validation', 'Submission rejection reduction'],
    ['Security questionnaire automation', 'Legal document automation'],
    ['Quality defect pattern detection', 'Investor auto-matching'],
    ['Supplier scorecard unification', 'Portfolio intelligence dashboards'],
    ['Inventory and allocation optimization', 'Founder-office reporting'],
    ['Demand sensing', '50,000+ inbound interactions'],
    ['Exception detection and routing', 'AI vision quality control'],

    ['Frequently Asked Questions.', 'Built differently, on purpose.'],
    ['What happens during the discovery call?', 'Senior pods, no offshoring layers.'],
    ['Can agents work with our existing enterprise tools?', 'Built around your stack, not ours.'],
    ['Can agents be fully customized for our workflows?', 'Speed that matches enterprise stakes.'],
    ['How long does it take to deploy an AI agent?', 'How fast can a first system ship?'],
    ['How much involvement is required from our internal org?', 'What does enablement include?'],
    ['What kinds of tasks can AI agents actually perform?', 'What kinds of systems does Shiftora build?'],
    ['How do you ensure security and governance?', 'Who owns the system after launch?'],
    [
      'The discovery call is a working session where we review how operational workflows currently run inside your organization. From there we identify areas where an AI agent could realistically execute work, what systems it would need to interact with, and what a deployment timeline would look like.',
      'We review workflows, systems, data, bottlenecks, and AI opportunities, then return with a diagnostic, roadmap, and first system worth building.'
    ],
    [
      'Yes. Agents integrate with the systems already running your operations - such as ERPs, CRMs, internal databases, and data platforms - through APIs and automation layers.',
      'We engineer inside Salesforce, HubSpot, ERPs, data warehouses, internal applications, and APIs. We do not push a proprietary platform by default.'
    ],
    [
      'Yes. Every deployment is designed around the specific workflows, systems, and operational rules inside your organization.',
      'Every engagement is run by senior architects and engineers who own the outcome. No staffing pyramids, junior handoffs, or project managers reading back what you said.'
    ],
    [
      'Most deployments move from discovery to a production agent in 6-12 weeks, depending on the complexity of the workflow and the systems involved.',
      'Most first deliveries ship in 15 to 30 days, depending on data readiness, system access, and workflow complexity.'
    ],
    [
      'Your team provides context on the workflow and systems involved (<20 hours across all employees). Varick handles the design and deployment of the agent system while coordinating with the appropriate technical or operational stakeholders.',
      'We map the process, redesign SOPs, train operators, install dashboards, and stay close until adoption is real.'
    ],
    [
      'Agents typically monitor operational systems, analyze incoming data, trigger actions, route approvals, generate internal reports, and coordinate work across tools that previously required manual oversight.',
      'Custom AI automations, AI vision, document pipelines, predictive lead intelligence, enterprise software, CRMs, APIs, B2B portals, dashboards, and BI systems.'
    ],
    [
      'Engagements are structured based on the complexity of the workflow, the systems involved, and the scope of the deployment. Pricing is typically discussed after the discovery call once we understand the operational requirements. Tends to be 90% cheaper than your otherwise FTE cost.',
      'Engagements are scoped after the diagnostic based on workflow complexity, integrations, data readiness, and deployment depth.'
    ],

    ['Deploy Your First AI Agent', 'Book a Discovery Call'],
    ['@varickai on X', 'info@shiftora.ai'],
    ['Linkedin', 'LinkedIn'],
    ['2026 Varick Agents. All rights reserved. Company names and logos are trademarks of their respective owners.', 'Shiftora.ai. All rights reserved.'],
    ['- Varick Agents', '- Shiftora.ai'],
    ['...AND 300+ additional enterprise workflows', '300+ enterprise workflows ready for AI enablement']
  ];

  const replacementMap = new Map(replacements.map(([from, to]) => [normalize(from), to]));

  function normalize(value = '') {
    return value
      .replace(/\u00a9/g, '')
      .replace(/\u2026/g, '...')
      .replace(/[\u2013\u2014]/g, '-')
      .replace(/&/g, '&')
      .replace(/\s+/g, ' ')
      .trim();
  }

  function isEditableTextNode(element) {
    if (!element || element.closest('#shiftora-text-editor-panel')) return false;
    if (!element.textContent || !element.textContent.trim()) return false;
    const tag = element.tagName;
    return ['H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'P', 'A', 'BUTTON'].includes(tag);
  }

  function replaceVisibleCopy() {
    document.title = 'Shiftora.ai | Custom AI, Enablement & Enterprise Software for Large Legacy Enterprises';
    document.querySelectorAll('meta[name="description"], meta[property="og:description"], meta[name="twitter:description"]').forEach((meta) => {
      meta.setAttribute('content', 'Shiftora rebuilds Large Legacy Enterprises around AI. Custom AI automations, enablement, process optimization, and enterprise software engineered into your existing stack.');
    });
    document.querySelectorAll('meta[property="og:title"], meta[name="twitter:title"]').forEach((meta) => {
      meta.setAttribute('content', document.title);
    });

    document.querySelectorAll('[data-framer-name="Group 6"]:has([data-framer-name="V"]), [data-framer-name="V"]').forEach((node) => {
      node.style.setProperty('display', 'none', 'important');
    });

    document.querySelectorAll('a').forEach((link) => {
      const text = normalize(link.textContent);
      const href = link.getAttribute('href') || '';
      const isBookingLink = text.includes('Book a Call') ||
        text.includes('Book a Discovery Call') ||
        href.includes('cal.com/team/varick-agents/discovery-call');

      if (!isBookingLink) return;
      link.setAttribute('href', BOOKING_URL);
      link.setAttribute('target', '_blank');
      link.setAttribute('rel', 'noopener');
    });
    document.querySelectorAll('a[href="https://x.com/varickai"]').forEach((link) => {
      link.setAttribute('href', 'mailto:info@shiftora.ai');
    });
    document.querySelectorAll('a[href="https://www.linkedin.com/company/varick-agents/"]').forEach((link) => {
      link.setAttribute('href', 'https://www.linkedin.com/company/shiftora-ai/');
    });

    document.querySelectorAll('h1,h2,h3,h4,h5,h6,p,a,button').forEach((element) => {
      if (!isEditableTextNode(element)) return;
      const key = normalize(element.textContent);
      if (!replacementMap.has(key)) return;
      element.textContent = replacementMap.get(key);
    });
  }

  window.__shiftoraCopyMap = replacements.map(([from, to]) => ({ from, to }));
  window.addEventListener('load', () => {
    setTimeout(replaceVisibleCopy, 1600);
    setTimeout(replaceVisibleCopy, 3200);
  });
})();
