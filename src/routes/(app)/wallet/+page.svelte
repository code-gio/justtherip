<script lang="ts">
  import { WalletBalance, WalletTransactions } from "$lib/components/wallet";
  import { goto } from "$app/navigation";

  let { data } = $props();
  let { balance, transactions } = $derived(data);

  let isLoading = $state(false);
</script>

<div class="space-y-6 container mx-auto max-w-5xl w-full">
  <WalletBalance {balance} {isLoading} onBuyRips={() => goto("/buy")} />
  <WalletTransactions {transactions} {isLoading} />
</div>
