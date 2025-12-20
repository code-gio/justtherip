<script>
    import { siteConfig } from "$lib/config";
</script>

<header
    class="flex flex-wrap md:justify-start md:flex-nowrap z-50 bg-white border-b border-gray-200 dark:bg-neutral-900 dark:border-neutral-700"
>
    <div
        class="max-w-[85rem] flex justify-center basis-full items-center w-full mx-auto py-4 px-4 sm:px-6 lg:px-8"
    >
        <!-- Logo -->
        <a href="/" aria-label={siteConfig.title}>
            <img
                src={siteConfig.logo}
                alt={siteConfig.title}
                class="h-6 dark:hidden"
            />
            <img
                src={siteConfig.logoDark}
                alt={siteConfig.title}
                class="hidden h-6 dark:block"
            />
        </a>
        <!-- End Logo -->
    </div>
</header>
