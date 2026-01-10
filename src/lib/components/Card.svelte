<script lang="ts">
  interface CardProps {
    title: string;
    description: string;
    image: string;
    variant: 'notes' | 'gallery' | 'researches';
    onClick: () => void;
  }

  let { title, description, image, variant, onClick }: CardProps = $props();
</script>

<button class="card {variant}" onclick={onClick} style="background-image: url({image})">
  <div class="card-content">
    <h2>{title}</h2>
    <p>{description}</p>
  </div>
</button>

<style>
  .card {
    background-color: var(--color-background);
    border-radius: var(--radius-lg);
    padding: 20px;
    box-shadow: var(--shadow-neomorph-static);
    cursor: pointer;
    text-align: left;
    width: 330px;
    height: 500px;
    flex-shrink: 0;
    display: flex;
    flex-direction: column;
    position: relative;
    overflow: hidden;
    background-repeat: no-repeat;
    transition: 
      width 0.4s ease,
      height 0.4s ease,
      background-size 0.4s ease,
      background-position 0.4s ease,
      box-shadow var(--transition-fast),
      transform var(--transition-fast);
  }

  /* Notes: 450x487, top 192px, left -25px */
  .card.notes {
    background-position: -25px 192px;
    background-size: 450px 487px;
  }

  /* Gallery: 451x526, top 160px, left 0px */
  .card.gallery {
    background-position: 0px 160px;
    background-size: 451px 526px;
  }

  /* Researches: 393x573, top 132px, left -32px */
  .card.researches {
    background-position: -32px 132px;
    background-size: 393px 573px;
  }

  .card:hover {
    box-shadow: var(--shadow-button-hover);
    transform: translateY(-4px);
  }

  .card:active {
    box-shadow: var(--shadow-button-pressed);
    transform: translateY(-2px);
  }

  .card-content {
    display: flex;
    flex-direction: column;
    gap: 12px;
    position: relative;
    z-index: 1;
  }

  h2 {
    font-family: var(--font-heading);
    font-size: 32px;
    font-weight: var(--font-weight-light);
    color: var(--color-h1);
    margin: 0;
    line-height: 1.1;
  }

  p {
    font-family: var(--font-body);
    font-size: 14px;
    font-weight: var(--font-weight-regular);
    color: var(--color-h2);
    line-height: 1.5;
    max-width: 220px;
    margin: 0;
  }

  /* Sidebar open state - controlled by parent */
  :global(.sidebar-open) .card {
    width: 297px;
    height: 450px;
  }

  /* Scale images proportionally when sidebar open */
  :global(.sidebar-open) .card.notes {
    background-position: -22px 173px;
    background-size: 405px 438px;
  }

  :global(.sidebar-open) .card.gallery {
    background-position: 0px 144px;
    background-size: 406px 473px;
  }

  :global(.sidebar-open) .card.researches {
    background-position: -29px 119px;
    background-size: 354px 516px;
  }
</style>
