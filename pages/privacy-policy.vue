<template>
  <div class="privacy-page">

    <header class="privacy-header">
      <div class="header-inner">
        <span class="header-eyebrow">Legal</span>
        <h1 class="header-title">Privacy Policy</h1>
        <p class="header-meta">Last updated: <time>{{ lastUpdated }}</time></p>
      </div>
      <div class="header-decoration" aria-hidden="true">
        <span>🔒</span>
      </div>
    </header>

    <div class="privacy-body">
      <article class="privacy-content">

        <section class="intro-block">
          <p>
            This website ("Cyprus Secrets") is a guide to discovering hidden experiences in Cyprus. 
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

<script setup lang="ts">
const lastUpdated = new Date().toLocaleDateString('en-GB', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
})
</script>

<style scoped>
.privacy-page {
  background-color: var(--bg-warm);
  color: var(--color-navy);
  min-height: 100svh;
  padding-top: 0; /* Reset for mobile */
}

@media (min-width: 768px) {
  .privacy-page {
    padding-top: var(--navbar-height);
  }
}

.privacy-header {
  background-color: var(--color-navy);
  padding: var(--space-5) var(--space-4) 56px;
  position: relative;
  overflow: hidden;
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
}

.privacy-header::before {
  content: '';
  position: absolute;
  inset: 0;
  background:
    radial-gradient(ellipse at 80% 50%, var(--color-gold-muted) 0%, transparent 60%),
    radial-gradient(ellipse at 20% 80%, rgba(198, 159, 75, 0.06) 0%, transparent 50%);
}

.header-inner { position: relative; z-index: 1; }

.header-eyebrow {
  display: block;
  font-size: var(--size-xs);
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: var(--color-gold);
  margin-bottom: var(--space-2);
}

.header-title {
  font-size: clamp(2.5rem, 6vw, 4rem);
  font-weight: var(--weight-bold);
  color: var(--text-white);
  margin: 0 0 var(--space-3);
  line-height: 1;
}

.header-meta {
  font-size: var(--size-sm);
  color: rgba(255, 255, 255, 0.45);
  margin: 0;
}

.header-decoration {
  font-size: 5rem;
  opacity: 0.08;
  position: relative;
  z-index: 1;
  line-height: 1;
  align-self: center;
}

.privacy-body {
  max-width: var(--container-narrow);
  margin: 0 auto;
  padding: var(--space-5) var(--space-4) 80px;
}

.privacy-content {
  display: flex;
  flex-direction: column;
  gap: var(--space-5);
}

.intro-block {
  background: var(--color-navy);
  color: rgba(255, 255, 255, 0.85);
  border-radius: var(--radius);
  padding: 28px 32px;
  font-size: var(--size-base);
  line-height: 1.7;
}

.policy-section {
  padding-bottom: var(--space-5);
}

.policy-section h2 {
  font-size: var(--size-xl);
  font-weight: var(--weight-bold);
  color: var(--color-navy);
  margin: 0 0 var(--space-3);
}

.policy-section p {
  font-size: var(--size-base);
  line-height: 1.8;
  color: var(--color-text-mid);
}

.service-list {
  list-style: none;
  padding: 0;
  margin: var(--space-3) 0 0;
}

.service-list li {
  font-size: var(--size-sm);
  color: var(--color-text-mid);
  padding: var(--space-2) 0;
  border-bottom: 1px solid var(--border-mid);
}

.service-list li:last-child { 
  border-bottom: none; 
}

.service-list strong { 
  color: var(--color-navy); 
  font-weight: var(--weight-bold); 
}

@media (min-width: 900px) {
  .privacy-header { padding: 80px 60px 64px; }
  .privacy-body { padding: 60px 60px 100px; }
}
</style>
