<script lang="ts">
  interface Props {
    pullProgress: number;
    pullTarget: number;
  }

  let { pullProgress, pullTarget }: Props = $props();
</script>

<div class="animate-in fade-in slide-in-from-top-4 duration-300">
  <div class="rounded-2xl border border-primary/30 bg-primary/5 p-4 shadow-inner space-y-2">
    <p class="text-sm font-semibold text-primary animate-pulse">🎲 Simulating progress</p>
    <p class="text-sm text-muted-foreground">
      {pullProgress} / {pullTarget} pulls completed
    </p>
    <div class="h-2 rounded-full bg-primary/20 overflow-hidden">
      <div
        class="h-full rounded-full bg-gradient-to-r from-primary to-primary/50 transition-all duration-300 ease-out shadow-lg shadow-primary/50"
        style={`width: ${pullTarget ? (pullProgress / pullTarget) * 100 : 0}%`}
      ></div>
    </div>
  </div>
</div>
