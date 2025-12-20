import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async (event) => {
    try {
        const { email } = await event.request.json();
        const { locals: { supabase } } = event;

        if (!email) {
            return new Response('Email is required', { status: 400 });
        }

        const { error: resendError } = await supabase.auth.resend({
            type: "signup",
            email: email,
        });

        if (resendError) {
            console.error('Resend error:', resendError);
            return new Response(resendError.message, { status: 400 });
        }

        return json({ success: true });
    } catch (error) {
        console.error('Error in resend verification:', error);
        return new Response('Internal server error', { status: 500 });
    }
};