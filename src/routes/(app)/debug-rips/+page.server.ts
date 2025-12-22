import { redirect } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";
import { supabaseAdmin } from "$lib/server/rips";

export const load: PageServerLoad = async ({ locals }) => {
  const { session, user } = await locals.safeGetSession();

  if (!session || !user) {
    throw redirect(303, "/sign-in");
  }

  const diagnostics: any = {
    userId: user.id,
    email: user.email,
    tests: {},
  };

  try {
    // Test 1: Check if rip_balances table exists
    const { data: balanceData, error: balanceError } = await supabaseAdmin
      .from("rip_balances")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();

    diagnostics.tests.rip_balances = {
      exists: !balanceError || balanceError.code !== "42P01",
      hasUserRecord: !!balanceData,
      data: balanceData,
      error: balanceError?.message,
      errorCode: balanceError?.code,
    };

    // Test 2: Check if rip_bundles table exists and has data
    const { data: bundlesData, error: bundlesError } = await supabaseAdmin
      .from("rip_bundles")
      .select("*")
      .eq("is_active", true);

    diagnostics.tests.rip_bundles = {
      exists: !bundlesError || bundlesError.code !== "42P01",
      count: bundlesData?.length || 0,
      data: bundlesData,
      error: bundlesError?.message,
    };

    // Test 3: Try to call get_user_rip_balance function
    const { data: balanceFuncData, error: balanceFuncError } =
      await supabaseAdmin.rpc("get_user_rip_balance", {
        p_user_id: user.id,
      });

    diagnostics.tests.get_user_rip_balance_function = {
      exists: !balanceFuncError || balanceFuncError.code !== "42883",
      result: balanceFuncData,
      error: balanceFuncError?.message,
    };

    // Test 4: Check RLS policies
    const { data: rlsData, error: rlsError } = await supabaseAdmin
      .from("rip_balances")
      .select("*");

    diagnostics.tests.rls_check = {
      canReadAllRecords: !rlsError,
      recordCount: rlsData?.length || 0,
      error: rlsError?.message,
    };
  } catch (error) {
    diagnostics.generalError = error instanceof Error ? error.message : error;
  }

  return diagnostics;
};
