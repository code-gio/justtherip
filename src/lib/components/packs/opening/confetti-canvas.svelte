<script lang="ts">
  let { active = false }: { active?: boolean } = $props();
  let canvas = $state<HTMLCanvasElement | null>(null);
  let animationId: number | null = null;

  function startConfetti() {
    if (!canvas || !active || animationId !== null) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const particles: Array<{
      x: number;
      y: number;
      vx: number;
      vy: number;
      color: string;
      size: number;
    }> = [];

    // Create confetti particles
    for (let i = 0; i < 100; i++) {
      particles.push({
        x: canvas.width / 2,
        y: canvas.height / 2,
        vx: (Math.random() - 0.5) * 4,
        vy: Math.random() * -3 - 2,
        color: ["#ef4444", "#f59e0b", "#8b5cf6", "#ec4899", "#06b6d4"][
          Math.floor(Math.random() * 5)
        ],
        size: Math.random() * 4 + 2,
      });
    }

    let frame = 0;
    const animate = () => {
      if (frame++ > 180 || !canvas || !active) {
        animationId = null;
        return;
      }
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.1; // Gravity
        ctx.fillStyle = p.color;
        ctx.fillRect(p.x, p.y, p.size, p.size);
      });
      animationId = requestAnimationFrame(animate);
    };
    animationId = requestAnimationFrame(animate);
  }

  let previousActive = $state(false);
  
  // Watch for active changes without effect
  $effect(() => {
    if (active && !previousActive && canvas) {
      startConfetti();
    } else if (!active && previousActive && animationId !== null) {
      cancelAnimationFrame(animationId);
      animationId = null;
    }
    previousActive = active;
  });
</script>

<canvas
  bind:this={canvas}
  class="fixed inset-0 pointer-events-none z-40"
  width={1920}
  height={1080}
></canvas>
