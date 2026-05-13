<template>
  <div class="about-page">
    <!-- Header Section -->
    <header class="about-header">
      <h1>About the Guide</h1>
      <p class="intro-text">
        <b>Yia Sas!</b> Lost in Cyprus is a passion project born from our love for the island we call home. 
        We’re two Cypriots dedicated to helping visitors and locals alike uncover the hidden gems, 
        activities, and events that make this island so special.
      </p>
    </header>

    <!-- Founders Section (Large Nature Silhouettes) -->
    <section class="founders-section">
      <h2 class="section-title">Our Founders</h2>
      <div class="founders-container">
        <!-- Founder 1 -->
        <div class="founder-card">
          <div class="silhouette-frame">
            <!-- Replace with your actual silhouette photo -->
            <img src="/founder_1.webp" alt="Founder silhouette in the mountains surrounded by snow" class="founder-img" />
          </div>
          <div class="founder-info">
            <h3>The Explorer</h3>
            <p>On a mission to map every hidden trail and sunset peak.</p>
          </div>
        </div>

        <!-- Founder 2 -->
        <div class="founder-card">
          <div class="silhouette-frame">
            <!-- Replace with your actual silhouette photo -->
            <img src="/founder_2.webp" alt="Founder silhouette by a coastal cliff with sea in background" class="founder-img" />
          </div>
          <div class="founder-info">
            <h3>The Storyteller</h3>
            <p>Capturing the traditions and secrets that define our culture.</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Impact Quote -->
    <section class="quote-container">
      <blockquote class="mission-quote">
        "We don't just find locations; we find the stories that locals keep for themselves."
      </blockquote>
    </section>

    <!-- Dynamic Discovery Grid -->
    <section class="discoveries-section">
      <h2 class="section-title">Latest Discoveries</h2>
      <div class="placeholder-grid">
        <div class="grid-content">
          <p>*This will be a placeholder grid of 6 images from DB*</p>
          <span class="grid-subtext">Images and slugs loading soon...</span>
        </div>
      </div>
      
      <div class="cta-wrapper">
        <NuxtLink to="/" class="explore-btn">
          EXPLORE THE SECRETS
        </NuxtLink>
      </div>
    </section>
  </div>
</template>

<style scoped>
/* Base Layout */
.about-page {
  padding: var(--navbar-height) 20px 5rem;
  max-width: var(--container-narrow);
  margin: 0 auto;
  color: #1a1a1a;
}

.about-header {
  margin-bottom: 4rem;
}

.intro-text {
  font-size: 1.15rem;
  line-height: 1.6;
  max-width: 650px;
}

.section-title {
  font-size: 1.8rem;
  margin-bottom: 2rem;
  font-weight: 700;
}

/* Founder Cards with Large Silhouettes */
.founders-container {
  display: flex;
  flex-direction: column;
  gap: 3.5rem;
  margin-bottom: 6rem;
}

.silhouette-frame {
  width: 100%;
  aspect-ratio: 4 / 5;
  border-radius: 16px;
  overflow: hidden;
  background-color: #f4f4f4;
  margin-bottom: 1.25rem;
  box-shadow: 0 4px 20px rgba(0,0,0,0.05);
}

.founder-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.6s cubic-bezier(0.25, 1, 0.5, 1);
}

.founder-card:hover .founder-img {
  transform: scale(1.03);
}

.founder-info h3 {
  font-size: 1.4rem;
  margin-bottom: 0.4rem;
}

.founder-info p {
  color: #555;
  font-size: 1rem;
}

/* Big Impact Quote */
.quote-container {
  padding: 4rem 0;
  border-top: 1px solid #eee;
  border-bottom: 1px solid #eee;
  margin-bottom: 6rem;
}

.mission-quote {
  font-size: 1.75rem;
  font-weight: 800;
  text-align: center;
  line-height: 1.3;
  color: #000;
  max-width: 800px;
  margin: 0 auto;
}

/* Placeholder Grid Styling */
.placeholder-grid {
  width: 100%;
  min-height: 350px;
  background: #f9f9f9;
  border: 2px dashed #dcdcdc;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  margin-bottom: 3rem;
}

.grid-content p {
  font-weight: 600;
  color: #888;
}

.grid-subtext {
  font-size: 0.85rem;
  color: #aaa;
}

/* CTA Styling */
.cta-wrapper {
  display: flex;
  justify-content: center;
}

.explore-btn {
  background: #1a1a1a;
  color: #fff;
  padding: 1.2rem 3rem;
  border-radius: 50px;
  text-decoration: none;
  font-weight: 700;
  letter-spacing: 1px;
  transition: background 0.3s ease;
}

.explore-btn:hover {
  background: #333;
}

/* Responsive Desktop Layout */
@media (min-width: 768px) {
  .founders-container {
    flex-direction: row;
    gap: 2rem;
  }

  .founder-card {
    flex: 1;
  }

  .mission-quote {
    font-size: 2.2rem;
  }
}
</style>