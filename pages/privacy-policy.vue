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
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;1,400&family=DM+Sans:wght@300;400;500&display=swap');

.privacy-page {
  font-family: 'DM Sans', sans-serif;
  background-color: #f8f6f0;
  color: #1c2a32;
  min-height: 100svh;
}

.privacy-header {
  background-color: #1c2a32;
  padding: 64px 24px 56px;
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
    radial-gradient(ellipse at 80% 50%, rgba(198, 159, 75, 0.12) 0%, transparent 60%),
    radial-gradient(ellipse at 20% 80%, rgba(198, 159, 75, 0.06) 0%, transparent 50%);
}

.header-inner { position: relative; z-index: 1; }

.header-eyebrow {
  display: block;
  font-size: 0.7rem;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: #c69f4b;
  margin-bottom: 12px;
}

.header-title {
  font-family: 'Cormorant Garamond', serif;
  font-size: clamp(2.5rem, 6vw, 4rem);
  font-weight: 600;
  color: #ffffff;
  margin: 0 0 16px;
  line-height: 1;
}

.header-meta {
  font-size: 0.8rem;
  color: rgba(255,255,255,0.45);
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
  max-width: 800px; /* Narrower layout now that TOC is gone */
  margin: 0 auto;
  padding: 48px 24px 80px;
}

.privacy-content {
  display: flex;
  flex-direction: column;
  gap: 40px;
}

.intro-block {
  background: #1c2a32;
  color: rgba(255,255,255,0.85);
  border-radius: 12px;
  padding: 28px 32px;
  font-size: 1rem;
  line-height: 1.7;
}

.policy-section {
  padding-bottom: 32px;
}

.policy-section h2 {
  font-family: 'Cormorant Garamond', serif;
  font-size: 1.6rem;
  font-weight: 600;
  color: #1c2a32;
  margin: 0 0 16px;
}

.policy-section p {
  font-size: 0.95rem;
  line-height: 1.8;
  color: #3d4f58;
}

.service-list {
  list-style: none;
  padding: 0;
  margin: 16px 0 0;
}

.service-list li {
  font-size: 0.9rem;
  color: #3d4f58;
  padding: 8px 0;
  border-bottom: 1px solid #e4dfd5;
}

.service-list li:last-child { border-bottom: none; }

.service-list strong { color: #1c2a32; font-weight: 500; }

@media (min-width: 900px) {
  .privacy-header { padding: 80px 60px 64px; }
  .privacy-body { padding: 60px 60px 100px; }
}
</style>