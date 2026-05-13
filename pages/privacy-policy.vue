<template>
  <div class="privacy-page">
    <header class="privacy-header">
      <div class="header-inner">
        <h1 class="header-title">Privacy Policy</h1>
        <p class="header-meta">Last updated: <time>13 May 2026</time></p>
      </div>
    </header>

    <div class="privacy-body">
      <article class="privacy-content">
        <section class="intro-block">
          <p>
            <b class="brand-greeting">Yia Sas!</b> Lost in Cyprus is a guide to discovering hidden experiences on the island we call home. 
            We value your privacy: we do not run advertising, sell your data, or create user profiles. 
            This policy outlines the limited instances where data is handled.
          </p>
        </section>

        <section class="policy-section">
          <h2>1. Data Collection</h2>
          <p>
            We do not directly collect or store personal data. There are no user accounts or 
            tracking analytics on this site. The only personal information we receive is 
            what you voluntarily provide via our contact form (your email and message), 
            which is used solely to respond to your inquiry.
          </p>
        </section>

        <section class="policy-section">
          <h2>2. Third-Party Services</h2>
          <p>
            To keep the site running securely and reliably, we use a few trusted service providers. 
            These services may log standard technical information (like your IP address) 
            to deliver the website to your browser:
          </p>
          <ul class="service-list">
            <li><strong>Netlify:</strong> Website hosting and delivery.</li>
            <li><strong>Supabase:</strong> Storage for our articles and images.</li>
            <li><strong>EmailJS:</strong> Secure delivery of contact form messages.</li>
            <li><strong>Cloudflare Turnstile:</strong> Privacy-friendly bot protection.</li>
          </ul>
        </section>

        <section class="policy-section">
          <h2>3. Cookies & Tracking</h2>
          <p>
            We do not use tracking cookies, advertising pixels, or fingerprinting scripts. 
            The only browser storage used is strictly functional to ensure the site works 
            correctly during your visit (such as remembering a map filter).
          </p>
        </section>

        <section class="policy-section">
          <h2>4. Data Sharing & Rights</h2>
          <p>
            We never sell or trade your data. Because we do not store your personal 
            information ourselves, we generally have no data to provide or delete. 
            If you have contacted us via email and wish for that correspondence to 
            be deleted, simply let us know.
          </p>
        </section>

        <section class="policy-section">
          <h2>5. Contact</h2>
          <p>
            If you have any questions regarding this policy, please reach out via 
            the contact form on our website.
          </p>
        </section>
      </article>
    </div>
  </div>
</template>

<style scoped>
.privacy-page {
  background-color: var(--bg-warm-light);
  color: var(--text-primary);
  min-height: 100svh;
  font-family: var(--font-main);
}

.privacy-header {
  padding: var(--navbar-height) var(--space-4) var(--space-4);
  max-width: var(--container-narrow);
  margin: 0 auto;
}

.header-title {
  font-family: var(--font-heading);
  font-size: var(--size-2xl);
  font-weight: var(--weight-bold);
  margin-bottom: var(--space-2);
  color: var(--color-navy);
}

.header-meta {
  font-size: var(--size-sm);
  color: var(--color-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.1em;
}

.privacy-body {
  max-width: var(--container-narrow);
  margin: 0 auto;
  padding: 0 var(--space-4) var(--space-5);
}

.privacy-content {
  display: flex;
  flex-direction: column;
  gap: var(--space-5);
}

.intro-block {
  font-size: var(--size-lg);
  line-height: 1.6;
  color: var(--color-text-dark);
}

.brand-greeting {
  color: var(--color-copper);
}

.policy-section h2 {
  font-family: var(--font-heading);
  font-size: var(--size-xl);
  font-weight: var(--weight-bold);
  margin-bottom: var(--space-3);
  color: var(--color-navy);
}

.policy-section p {
  font-size: var(--size-base);
  line-height: 1.8;
  color: var(--color-text-mid);
}

.service-list {
  list-style: none;
  padding: 0;
  margin-top: var(--space-3);
}

.service-list li {
  padding: var(--space-2) 0;
  border-bottom: 1px solid var(--border-light);
  color: var(--color-text-mid);
  font-size: var(--size-sm);
}

.service-list li:last-child {
  border-bottom: none;
}

.service-list strong {
  color: var(--color-navy);
  font-weight: var(--weight-bold);
}

@media (min-width: 768px) {  
  .privacy-header {
    padding-top: calc(var(--navbar-height) + var(--space-3));
  }
}
</style>