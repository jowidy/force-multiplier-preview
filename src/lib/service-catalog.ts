export type Service = {
  slug: string;
  title: string;
  shortTitle: string;
  category: 'monthly' | 'once';
  eyebrow: string;
  headline: string;
  lead: string;
  benefit: string;
  icon:
    | 'posts'
    | 'people'
    | 'ads'
    | 'search'
    | 'write'
    | 'email'
    | 'support'
    | 'page'
    | 'home'
    | 'profile';
  deliverables: string[];
  preparation: string[];
  scopeReview: string[];
  costs: string;
  faq: { question: string; answer: string }[];
  related: string[];
};

const monthlyTerms = [
  {
    question: 'Can I choose just this service?',
    answer:
      'Yes. It is $400 per month under its own month-to-month agreement. Choose the work you need, and end one service independently of the others. Your agreement will explain notice, the final service date and refund terms before you start.',
  },
  {
    question: 'Will I need to make time for regular meetings?',
    answer:
      'No standing meetings are required. Share your business details once, then use written updates and clear approval requests. We ask for your input when facts, decisions or access need your attention.',
  },
  {
    question: 'Who owns the accounts and finished work?',
    answer:
      'You keep ownership of your business accounts and paid deliverables. You grant the access needed for the work and can remove it when the service ends. Third-party assets and software remain subject to their own licenses.',
  },
];

const projectTerms = [
  {
    question: 'Is this a subscription?',
    answer:
      'No. This is a $400 one-time project with its own agreement. There is no required maintenance subscription or bundle. Any other service you choose has a separate scope and price.',
  },
  {
    question: 'How will we work together?',
    answer:
      'Start with a short written brief and the relevant business facts and assets. We agree the scope, review process and timing before work begins, then share work for your feedback. No standing meetings are required.',
  },
  {
    question: 'Who owns the finished work?',
    answer:
      'You keep ownership of your business accounts and paid deliverables, with an agreed handoff. Your domain stays yours. Third-party assets, software and fonts remain subject to their own licenses.',
  },
];

export const services: Service[] = [
  {
    slug: 'social-posts',
    title: '20 custom social posts',
    shortTitle: 'Social posts',
    category: 'monthly',
    eyebrow: 'A little more you in the feed',
    headline: '20 social posts. Your voice. One clear price.',
    lead: 'You know your business. Turning that knowledge into a steady stream of posts is another job. Get 20 custom posts with imagery every month, built around your brand voice and the things your customers care about.',
    benefit: 'Keep showing up with useful posts that sound like your business.',
    icon: 'posts',
    deliverables: [
      '20 custom social posts per month, each with imagery and copy shaped around your brand voice.',
      'Content grounded in your real services, offers, business facts and customer questions.',
      'A set of posts you can review together, with a clear route for factual corrections and feedback.',
    ],
    preparation: [
      'Your logo, colors, existing imagery and examples of how you like to sound.',
      'The services, offers and dates you want people to know about.',
      'Your social profiles and the person who can approve business facts.',
    ],
    scopeReview: [
      'Confirm the social platforms, image formats and how cross-posting will be handled.',
      'Agree the publishing or handoff arrangement, approval schedule and revision process.',
      'Confirm any photography, video, animation or other asset needs before including them in the scope.',
    ],
    costs:
      'The service is $400 per month. Paid promotion is separate. Any client-owned scheduling subscription or paid asset license needed for your agreed scope is disclosed before you authorize it.',
    faq: [
      {
        question: 'Will the posts sound like me?',
        answer:
          'That is the point. We use your voice examples, customer questions and business facts to shape the copy. You can flag words that do not sound right and claims that need correcting before the agreed publication or handoff.',
      },
      {
        question: 'Does this include answering comments or running ads?',
        answer:
          'Community engagement and Meta ads management are separate $400 monthly services. You can choose either if you need it. Creating your social posts does not automatically enroll you in anything else.',
      },
      ...monthlyTerms,
    ],
    related: ['community-engagement', 'meta-ads', 'newsletters'],
  },
  {
    slug: 'community-engagement',
    title: 'Social community engagement',
    shortTitle: 'Community engagement',
    category: 'monthly',
    eyebrow: 'Be part of the conversation',
    headline: 'Give your community a thoughtful reply.',
    lead: 'A good social presence includes listening, joining in and being useful. Get help with genuine replies, relevant comments and thoughtful sharing so your business can build relationships beyond its own posts.',
    benefit: 'Make space for real conversations with customers and your wider community.',
    icon: 'people',
    deliverables: [
      'Community participation shaped around your business voice and agreed topics.',
      'Relevant replies, proactive comments and strategic sharing with context behind each interaction.',
      'A clear handoff for questions or sensitive situations that need your decision.',
    ],
    preparation: [
      'The profiles and communities where your customers and useful business connections spend time.',
      'Your tone, common questions, approved answers and subjects that need your input.',
      'A business contact for customer issues that cannot be resolved through an approved reply.',
    ],
    scopeReview: [
      'Confirm the platforms, current message volume and kinds of engagement that fit the service.',
      'Agree the cadence, coverage hours, response expectations and escalation process.',
      'Set boundaries for private messages, complaints and customer support before the service starts.',
    ],
    costs:
      'The service is $400 per month. Paid promotion and any agreed client-owned social management software are separate. Extra costs must be disclosed and agreed in advance.',
    faq: [
      {
        question: 'Is this just liking a few posts?',
        answer:
          'No. The service is about genuine participation: reading the context, contributing a useful comment, answering an appropriate question or sharing something relevant. The exact activity and cadence are agreed for your community.',
      },
      {
        question: 'Does this replace customer service?',
        answer:
          'No. Refunds, order problems and sensitive complaints stay with your designated business contact. Coverage and response expectations are agreed before you start; this is not a promise of constant availability or instant replies.',
      },
      ...monthlyTerms,
    ],
    related: ['social-posts', 'newsletters', 'meta-ads'],
  },
  {
    slug: 'meta-ads',
    title: 'Meta ads management',
    shortTitle: 'Meta ads',
    category: 'monthly',
    eyebrow: 'Put your offer in front of people',
    headline: 'Give your Facebook and Instagram ads a plan.',
    lead: 'You have something worth promoting. Get help managing, optimizing and testing Meta ads, with a clear offer, an agreed audience and a budget you control.',
    benefit: 'Keep your Meta advertising focused on a useful business goal.',
    icon: 'ads',
    deliverables: [
      'Management of the Meta advertising activity agreed for your business.',
      'Ongoing optimization and testing tied to the goal and spending limits you approve.',
      'Plain-language updates on what changed, what the results show and what to consider next.',
    ],
    preparation: [
      'Your offer, intended customers, service area and approved advertising budget.',
      'A client-owned Meta ad account, delegated access and accurate brand assets and claims.',
      'The landing page or lead destination, plus access to the agreed measurement tools.',
    ],
    scopeReview: [
      'Confirm the accounts, campaigns, markets, creative formats and test workload before contracting.',
      'Agree which ad copy and visual assets are included and which need a separate project.',
      'Review tracking readiness, reporting cadence and any account or integration repair needed before activation.',
    ],
    costs:
      'The $400 monthly fee pays for management. Ad spend is additional and paid to Meta through your account. Landing pages, specialist production and any agreed third-party software are separate; you approve those costs and the media budget before spending begins.',
    faq: [
      {
        question: 'Does $400 include the advertising budget?',
        answer:
          'No. The management fee and media spend are separate. We agree the advertising budget with you before starting, and Meta charges your ad account for that approved spend.',
      },
      {
        question: 'Will you guarantee a number of leads?',
        answer:
          'No. Results depend on your offer, audience, competition, destination and available data. Testing helps inform the next decision, but a small sample may not establish a reliable winner.',
      },
      ...monthlyTerms,
    ],
    related: ['landing-page', 'social-posts', 'google-ads'],
  },
  {
    slug: 'google-ads',
    title: 'Google Ads management',
    shortTitle: 'Google Ads',
    category: 'monthly',
    eyebrow: 'Meet a customer at the search',
    headline: 'Show up when people are looking for what you do.',
    lead: 'Give your Google advertising a clear purpose. We manage, optimize and test the agreed campaigns, connecting what people are looking for with an offer and a page that make sense.',
    benefit: 'Put your advertising budget behind relevant customer intent.',
    icon: 'search',
    deliverables: [
      'Google Ads management aligned with your offer, customers and approved geography.',
      'Ongoing optimization and testing within the scope and media budget you authorize.',
      'Clear updates that connect advertising activity with the business outcome you want to measure.',
    ],
    preparation: [
      'The services you want to promote, locations you serve and an approved media budget.',
      'Your client-owned Google Ads account and delegated access to the relevant tools.',
      'A suitable destination page and a defined inquiry, sale or other action to measure.',
    ],
    scopeReview: [
      'Confirm the campaign types, account structure, markets and campaign workload; no campaign count or media ceiling is fixed in this draft.',
      'Agree keyword research, exclusions, copy, testing and reporting requirements for the selected campaign types.',
      'Check conversion measurement and identify any separate landing-page, feed or tracking implementation work.',
    ],
    costs:
      'Management is $400 per month. Your Google Ads media budget is separate and paid through your account. Landing pages, tracking development and any agreed third-party tools are extra only when separately scoped and authorized.',
    faq: [
      {
        question: 'Is the $400 paid to Google?',
        answer:
          'No. It is Force Multiplier’s monthly management fee. Google charges your account separately for advertising. You approve that budget before a campaign can spend.',
      },
      {
        question: 'Will I appear at the top of every search?',
        answer:
          'No placement or lead volume is guaranteed. Eligibility, auction competition, relevance and budget affect when an ad appears. We agree the campaign approach and review what the available evidence can actually support.',
      },
      ...monthlyTerms,
    ],
    related: ['landing-page', 'google-business-profile', 'seo-content'],
  },
  {
    slug: 'seo-content',
    title: 'Human-written SEO content',
    shortTitle: 'Human-written SEO',
    category: 'monthly',
    eyebrow: 'Helpful answers, written by a person',
    headline: 'Turn what you know into content customers can use.',
    lead: 'Your website should answer real questions in a voice people trust. Get genuinely human-written onsite SEO content based on your business, your customers and the topics worth explaining well.',
    benefit: 'Build useful website content around the questions your customers ask.',
    icon: 'write',
    deliverables: [
      'Onsite SEO content with the final prose written by a real person.',
      'Writing shaped around an agreed topic, your business facts and the reader’s needs.',
      'Clear, readable copy with factual claims and references checked during review.',
    ],
    preparation: [
      'Your website, priority services and the customer questions you hear most often.',
      'Accurate business information, useful source material and examples of your preferred voice.',
      'A person who can confirm subject-specific facts, plus site access if publishing is agreed.',
    ],
    scopeReview: [
      'Agree the monthly quantity, length and content types. An article count or word allowance has not yet been approved.',
      'Confirm topic research, metadata, internal links, imagery, CMS publishing and revision requirements.',
      'Agree any research or outline assistance and the authorship process; the final prose must remain human-written.',
    ],
    costs:
      'The agreed content service is $400 per month. Website hosting, paid image licenses and client-owned software are separate if needed and agreed. Paid advertising and unrelated technical website work are not included.',
    faq: [
      {
        question: 'Does “human-written” mean edited AI copy?',
        answer:
          'No. A real person writes the final prose. Tools may support agreed research, organization or quality checks, but that does not turn generated prose into human-written content. Any permitted assistance and authorship checks are agreed before work starts.',
      },
      {
        question: 'Will this guarantee better Google rankings?',
        answer:
          'No. Useful content can support your website, but rankings depend on many factors beyond a single service. This offer does not imply a broader technical SEO program, link building or a guaranteed search position.',
      },
      ...monthlyTerms,
    ],
    related: ['website-page', 'newsletters', 'google-ads'],
  },
  {
    slug: 'newsletters',
    title: 'Newsletters and list growth',
    shortTitle: 'Newsletters',
    category: 'monthly',
    eyebrow: 'Give people a reason to stay in touch',
    headline: 'Useful emails. More reasons to subscribe.',
    lead: 'Stay connected with the people who want to hear from your business. Get newsletters that have something to say, alongside active work to help the right people join your email list.',
    benefit: 'Keep in touch with subscribers while improving the path to joining your list.',
    icon: 'email',
    deliverables: [
      'Newsletters built around useful updates, offers and stories from your business.',
      'Active, permission-based list-building work through the channels agreed in your scope.',
      'Attention to the reader’s journey from signup to email, including relevant links and opt-out handling.',
    ],
    preparation: [
      'Your email platform, existing template and current subscriber and suppression records.',
      'The news, offers and useful information you want to share.',
      'Your current signup locations and the channels you are comfortable using to invite subscribers.',
    ],
    scopeReview: [
      'Agree newsletter frequency, length, audience size, segmentation and the review process.',
      'Choose the active list-growth work and confirm any signup-form changes or related site access.',
      'Check sender and list readiness; agree separately on migration, custom automation or deliverability repair if needed.',
    ],
    costs:
      'The service is $400 per month. Your email platform subscription is separate and may vary with list size and sending volume. Paid promotion, new standalone assets and any other third-party costs require separate agreement.',
    faq: [
      {
        question: 'What does list growth involve?',
        answer:
          'It means doing agreed work to help interested people subscribe, such as improving a signup invitation or promoting it through an owned channel. It is more than leaving a form untouched. The chosen work is scoped before you start; a subscriber count is not guaranteed.',
      },
      {
        question: 'Can you buy a list or send cold emails?',
        answer:
          'This service is for newsletters and permission-based list growth. It does not include bought lists or cold email. We need the relevant subscriber and suppression information before agreeing a send.',
      },
      ...monthlyTerms,
    ],
    related: ['social-posts', 'landing-page', 'seo-content'],
  },
  {
    slug: 'website-support',
    title: 'Website maintenance and support',
    shortTitle: 'Website support',
    category: 'monthly',
    eyebrow: 'Look after the website you rely on',
    headline: 'A little less website worry.',
    lead: 'Your website still needs attention after launch. Get ongoing maintenance and support suited to the way your site is built, with a clear place to raise a problem and agree what happens next.',
    benefit: 'Have someone responsible for the website care you agree together.',
    icon: 'support',
    deliverables: [
      'Ongoing website maintenance and support for a site confirmed as a fit.',
      'Care and checks appropriate to your platform and the parts of the site your business relies on.',
      'A clear route to report an issue, understand the response and review agreed changes.',
    ],
    preparation: [
      'Your website address, platform and hosting details.',
      'Delegated access to the site and relevant accounts, plus information about existing licenses.',
      'The pages, forms and integrations you depend on, and any known issues.',
    ],
    scopeReview: [
      'Check platform compatibility, site size, current condition and any custom features before accepting the site.',
      'Agree the maintenance checklist, update and recovery approach, and allowance for content changes.',
      'Confirm support hours, response expectations, urgent-issue handling and work that would need a separate project.',
    ],
    costs:
      'The service is $400 per month. Hosting, domain renewals, premium licenses and other client-owned subscriptions remain separate. Any repair or development outside the agreed support scope needs your approval before an extra charge.',
    faq: [
      {
        question: 'Can you support a website someone else built?',
        answer:
          'Potentially. We first check the platform, access, condition and recovery options. That review establishes whether the site fits and identifies any existing problems that need separate work before ongoing support begins.',
      },
      {
        question: 'Is this unlimited development or round-the-clock support?',
        answer:
          'No. The agreement defines the work, support hours and response expectations. New pages, major redesigns, migrations and custom application work are scoped separately. We agree response and recovery expectations after reviewing your site.',
      },
      ...monthlyTerms,
    ],
    related: ['website-page', 'homepage', 'landing-page'],
  },
  {
    slug: 'landing-page',
    title: 'Product, service or event landing page',
    shortTitle: 'Landing page',
    category: 'once',
    eyebrow: 'One offer. A clear next step.',
    headline: 'Give your next offer a page of its own.',
    lead: 'A great offer can get lost on a busy website. Give a product, service or event a focused page that explains why it matters and makes the next step easy to find.',
    benefit: 'Send people to a page built around the offer they came to see.',
    icon: 'page',
    deliverables: [
      'A landing page focused on your chosen product, service or event.',
      'A clear offer, useful supporting information and a next step suited to your goal.',
      'A page designed to work across phone and desktop screens in the agreed website environment.',
    ],
    preparation: [
      'The offer, audience, accurate details and action you want a visitor to take.',
      'Your brand assets, approved imagery and any supporting proof you have permission to use.',
      'Website access and the destination for inquiries, bookings or other agreed actions.',
    ],
    scopeReview: [
      'Confirm the platform, page structure, copy and imagery requirements, and revision process.',
      'Agree the form, booking link or other interaction and how it will be tested before handoff.',
      'Confirm publishing, measurement and any integration needs; custom tools or checkout require separate scoping.',
    ],
    costs:
      'The page is $400 one time. Hosting, your domain, paid assets, platform subscriptions and agreed third-party integrations are separate. Advertising and ad management are also separate services and costs.',
    faq: [
      {
        question: 'Can I use it with a Google or Meta campaign?',
        answer:
          'Yes, a focused landing page can support an advertising campaign. We agree the destination and desired action as part of the page brief. Ad management, media spend and any additional tracking implementation are separate.',
      },
      {
        question: 'Can the page collect inquiries or bookings?',
        answer:
          'We agree the appropriate form, booking link or existing tool before building. The scope needs to identify where an inquiry goes and how the path will be tested. Custom integrations or payment flows are not assumed to be included.',
      },
      ...projectTerms,
    ],
    related: ['google-ads', 'meta-ads', 'website-support'],
  },
  {
    slug: 'homepage',
    title: 'Small-business homepage',
    shortTitle: 'Homepage',
    category: 'once',
    eyebrow: 'Make a good first introduction',
    headline: 'A homepage that gets to the point.',
    lead: 'Tell visitors what you do, who you help and how to take the next step. Get a complete small-business homepage with a clear story, a welcoming design and the details people need to feel comfortable getting in touch.',
    benefit: 'Help a new visitor understand your business and know what to do next.',
    icon: 'home',
    deliverables: [
      'A complete homepage for your small business in the agreed website environment.',
      'A clear introduction to your offer, relevant services and a visible contact or other next step.',
      'Responsive presentation of your business facts, brand assets and accurately attributed proof.',
    ],
    preparation: [
      'What your business does, who you serve and the questions customers ask before choosing you.',
      'Your logo, imagery and any testimonials or examples you are authorized to share.',
      'The site platform, access and destinations for navigation and contact actions.',
    ],
    scopeReview: [
      'Confirm the supported platform, visual direction, page structure, copy needs and revision process.',
      'Agree the header, footer, navigation and contact interactions needed for the homepage.',
      'Identify any domain, hosting, email migration, new branding or additional pages that need separate work.',
    ],
    costs:
      'The homepage is $400 one time. Domains, hosting, platform subscriptions, paid assets and any agreed third-party services are separate. Additional pages and ongoing maintenance are optional, separately contracted services.',
    faq: [
      {
        question: 'Is this a complete website?',
        answer:
          'It is a complete homepage. Other pages, a store, a custom application or a broader site migration are not implied. We agree how the homepage fits your existing site or supported setup before work begins.',
      },
      {
        question: 'Do I need to arrive with polished copy?',
        answer:
          'You need accurate business facts and a clear idea of the customers you serve. We agree the writing and refinement needed in the brief, so you know what to supply and what the project will produce. We will not invent customer proof or business claims.',
      },
      ...projectTerms,
    ],
    related: ['website-page', 'website-support', 'google-business-profile'],
  },
  {
    slug: 'website-page',
    title: 'Additional website page',
    shortTitle: 'Website page',
    category: 'once',
    eyebrow: 'Make room for the next useful thing',
    headline: 'Add the page your customers keep looking for.',
    lead: 'Maybe your story needs an About page. Maybe an important service needs more room. Add a useful page to your existing website, with a clear purpose and a design that feels at home.',
    benefit: 'Answer a customer’s next question without rebuilding the whole site.',
    icon: 'page',
    deliverables: [
      'An additional page for an existing website confirmed as a fit.',
      'Content organized around the purpose of the page and the information your visitors need.',
      'A responsive page that follows the site’s established visual style.',
    ],
    preparation: [
      'Your website and the purpose of the page, such as About, Contact or a service explanation.',
      'Accurate source information, approved imagery and any existing draft copy.',
      'Edit access and the navigation or links that should lead visitors to the new page.',
    ],
    scopeReview: [
      'Check the existing website and agree the page structure, copy, imagery and review process.',
      'Confirm navigation, internal links, forms or existing embeds needed for the page.',
      'Identify any custom development, integration or wider site changes before agreeing the project.',
    ],
    costs:
      'Each additional page is a separate $400 one-time project. Hosting, domain renewals, platform fees, paid assets and any agreed third-party integrations remain separate. No maintenance subscription is required.',
    faq: [
      {
        question: 'Does Force Multiplier have to build my homepage first?',
        answer:
          'No. We can review an existing site for compatibility and access. If it is a fit, the additional page can be its own project without a homepage purchase.',
      },
      {
        question: 'Can this include a new booking system or store?',
        answer:
          'A new system is a different scope from adding a page. An existing form or embed may fit once we review it, but custom integrations, stores and application features need separate assessment and agreement.',
      },
      ...projectTerms,
    ],
    related: ['homepage', 'seo-content', 'website-support'],
  },
  {
    slug: 'google-business-profile',
    title: 'Google Business Profile and Google setup',
    shortTitle: 'Google Business Profile',
    category: 'once',
    eyebrow: 'Help local customers find the right details',
    headline: 'Get your business’s Google basics in order.',
    lead: 'Make it easier for local customers to find accurate information about your business. Get help creating or optimizing your Google Business Profile, along with the relevant Google and Analytics setup agreed for your website.',
    benefit:
      'Bring your local business information and basic website measurement into clearer shape.',
    icon: 'profile',
    deliverables: [
      'Creation or optimization of an eligible Google Business Profile using accurate business information.',
      'Relevant Google and Analytics setup scoped to your website and business needs.',
      'A clear account and status handoff, including any verification or owner action still outstanding.',
    ],
    preparation: [
      'Your official business details, service area, hours, website and approved photos.',
      'The business-owned Google accounts and any existing profile, Analytics or Search Console access.',
      'Website access and an owner available for Google’s verification steps when required.',
    ],
    scopeReview: [
      'Check profile eligibility, ownership, locations and any existing duplicates or account problems.',
      'Agree the Analytics property, website measurement, events and relevant account links required.',
      'Confirm website and consent compatibility; disputes, complex tracking or recovery work need separate assessment.',
    ],
    costs:
      'The setup service is $400 one time. Google Business Profile itself is free; this fee pays for the agreed setup and optimization work. Advertising, hosting, paid software and any required third-party work are separate and must be agreed before spending.',
    faq: [
      {
        question: 'Can you guarantee Google will verify my profile?',
        answer:
          'No. Google controls eligibility and verification and may require direct action from the owner. We distinguish completed setup work from anything awaiting Google or you. The project does not promise a verification date or search ranking.',
      },
      {
        question: 'Are Business Profile and Analytics the same thing?',
        answer:
          'No. Business Profile presents information about an eligible business on Google. Analytics measures agreed activity on your website. We identify the relevant setup and account connections for your business instead of assuming every tool is needed.',
      },
      ...projectTerms,
    ],
    related: ['homepage', 'google-ads', 'website-support'],
  },
];
